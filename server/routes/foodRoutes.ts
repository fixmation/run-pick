import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { processCompletion } from "../utils/businessLogic";
import { insertFoodOrderSchema, insertOrderItemSchema } from "@shared/schema";
import LiveOrderService from "../services/liveOrderService";
import { isAuthenticated, authorizeRole } from "../middleware/auth";

const router = Router();

// Get all restaurants with optional location filtering
router.get("/restaurants", async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    // If location provided, filter by proximity
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const maxRadius = parseFloat(radius as string);
      
      if (isNaN(lat) || isNaN(lng) || isNaN(maxRadius)) {
        return res.status(400).json({ message: "Invalid location parameters" });
      }
      
      const restaurants = await storage.getRestaurantsNearLocation(lat, lng, maxRadius);
      res.json({ restaurants, filtered: true, location: { latitude: lat, longitude: lng, radius: maxRadius } });
    } else {
      // Return all restaurants if no location filtering requested
      const restaurants = await storage.getAllRestaurants();
      res.json({ restaurants, filtered: false });
    }
  } catch (error) {
    console.error("Error getting restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get restaurant details
router.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await storage.getRestaurant(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({ restaurant });
  } catch (error) {
    console.error("Error getting restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get restaurant menu
router.get("/restaurants/:id/menu", async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await storage.getRestaurant(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await storage.getMenuItemsByRestaurant(restaurantId);
    res.json({ restaurant, menuItems });
  } catch (error) {
    console.error("Error getting restaurant menu:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Place food order
router.post("/orders", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { order, items } = req.body;
    
    const orderData = insertFoodOrderSchema.parse({
      ...order,
      userId,
    });
    
    // Validate items
    const validatedItems = items.map((item: any) => 
      insertOrderItemSchema.parse(item)
    );

    // Calculate total amount
    let totalAmount = 0;
    for (const item of validatedItems) {
      const menuItem = await storage.getMenuItem(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItemId} not found` });
      }
      totalAmount += parseFloat(menuItem.price) * item.quantity;
    }

    // Create order
    const createdOrder = await storage.createFoodOrder({
      ...orderData,
      totalAmount: totalAmount.toString(),
    });
    
    // Create order items
    const orderItems = [];
    for (const item of validatedItems) {
      const menuItem = await storage.getMenuItem(item.menuItemId);
      const orderItem = await storage.createOrderItem({
        ...item,
        orderId: createdOrder.id,
        price: menuItem!.price,
      });
      orderItems.push(orderItem);
    }

    // Create live order for real-time driver assignment
    try {
      const restaurant = await storage.getRestaurant(createdOrder.restaurantId);
      await LiveOrderService.createLiveOrder({
        orderId: createdOrder.id,
        serviceType: 'food',
        customerId: userId,
        pickupLocation: restaurant?.address || 'Restaurant location',
        pickupLatitude: restaurant?.latitude ? parseFloat(restaurant.latitude) : 6.9271,
        pickupLongitude: restaurant?.longitude ? parseFloat(restaurant.longitude) : 79.8612,
        dropoffLocation: orderData.deliveryAddress,
        dropoffLatitude: parseFloat(orderData.deliveryLatitude || "0"),
        dropoffLongitude: parseFloat(orderData.deliveryLongitude || "0"),
        estimatedFare: totalAmount,
        priority: 1,
      });
    } catch (error) {
      console.error('Error creating live food order:', error);
    }
    
    res.json({ order: createdOrder, items: orderItems });
  } catch (error) {
    console.error("Error placing food order:", error);
    res.status(400).json({ message: "Invalid order data" });
  }
});

// Get user's food orders
router.get("/orders", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const orders = await storage.getFoodOrdersByUser(userId);
    res.json({ orders });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order details
router.get("/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const order = await storage.getFoodOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order, is the assigned driver, or is admin
    const user = await storage.getUser(userId);
    if (order.userId !== userId && order.driverId !== userId && user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const items = await storage.getOrderItemsByOrder(orderId);
    res.json({ order, items });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (vendor/driver only)
router.put("/orders/:id/status", async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user || (user.role !== "vendor" && user.role !== "driver" && user.role !== "admin")) {
      return res.status(403).json({ message: "Vendor or driver access required" });
    }

    const order = await storage.getFoodOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = ["confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await storage.updateFoodOrder(orderId, { status } as any);

    // If order is delivered, process payment
    if (status === "delivered" && order.driverId) {
      await processCompletion(
        "food",
        orderId,
        parseFloat(order.totalAmount),
        order.userId,
        order.driverId,
        order.restaurantId
      );
    }

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Assign driver to order (admin/vendor only)
router.put("/orders/:id/assign-driver", async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = parseInt(req.params.id);
    const { driverId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user || (user.role !== "vendor" && user.role !== "admin")) {
      return res.status(403).json({ message: "Vendor or admin access required" });
    }

    const order = await storage.getFoodOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate driver
    const driver = await storage.getUser(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(400).json({ message: "Invalid driver" });
    }

    const updatedOrder = await storage.updateFoodOrder(orderId, { 
      driverId,
      status: "ready"
    } as any);

    res.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error assigning driver:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending orders for vendors
router.get("/vendor/orders", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Vendor access required" });
    }

    // Get vendor's restaurants
    const vendorRestaurants = await storage.getRestaurantsByVendor(userId);
    const restaurantIds = vendorRestaurants.map(r => r.id);

    // Get pending orders for vendor's restaurants
    const pendingOrders = await storage.getPendingOrdersByRestaurants(restaurantIds);
    
    res.json({ orders: pendingOrders });
  } catch (error) {
    console.error("Error getting vendor orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available deliveries for drivers
router.get("/driver/deliveries", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== "driver") {
      return res.status(403).json({ message: "Driver access required" });
    }

    const availableDeliveries = await storage.getAvailableFoodDeliveries();
    res.json({ deliveries: availableDeliveries });
  } catch (error) {
    console.error("Error getting available deliveries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;