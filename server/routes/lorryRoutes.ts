import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { insertLorryBookingSchema } from "../../shared/schema";
import { storage } from "../storage";
import { calculateLorryFare } from "../utils/businessLogic";
import LiveOrderService from "../services/liveOrderService";

const router = express.Router();

// Create lorry booking
router.post("/request", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const lorryData = insertLorryBookingSchema.parse(req.body);
    
    // Calculate fare using lorry-specific logic
    const { fare, distance, duration } = calculateLorryFare(
      parseFloat(lorryData.pickupLatitude || "0"),
      parseFloat(lorryData.pickupLongitude || "0"),
      parseFloat(lorryData.dropoffLatitude || "0"),
      parseFloat(lorryData.dropoffLongitude || "0"),
      lorryData.vehicleType
    );

    // Create lorry booking
    const lorryBooking = await storage.createLorryBooking({
      ...lorryData,
      userId,
    });

    // Update with calculated fields
    const updatedLorryBooking = await storage.updateLorryBooking(lorryBooking.id, {
      fare: fare.toString(),
      distance: distance.toString(),
      estimatedDuration: duration,
    });

    // Get customer details for live order
    const customer = await storage.getUser(userId);
    
    // Create live order for real-time driver assignment
    try {
      await LiveOrderService.createLiveOrder({
        orderId: lorryBooking.id,
        serviceType: 'lorry' as any,
        customerId: userId,
        customerName: customer?.name || 'Customer',
        customerPhone: customer?.phone || '',
        pickupLocation: lorryData.pickupLocation,
        pickupLatitude: parseFloat(lorryData.pickupLatitude || "0"),
        pickupLongitude: parseFloat(lorryData.pickupLongitude || "0"),
        dropoffLocation: lorryData.dropoffLocation,
        dropoffLatitude: parseFloat(lorryData.dropoffLatitude || "0"),
        dropoffLongitude: parseFloat(lorryData.dropoffLongitude || "0"),
        vehicleType: lorryData.vehicleType,
        estimatedFare: fare,
        estimatedDistance: distance,
        estimatedDuration: duration,
        priority: 1,
      });
    } catch (error) {
      console.error('Error creating live order for lorry:', error);
    }

    res.json({ 
      lorryBooking: updatedLorryBooking || lorryBooking,
      estimatedFare: fare,
      estimatedDistance: distance,
      estimatedDuration: duration
    });
  } catch (error) {
    console.error("Error creating lorry request:", error);
    res.status(400).json({ message: "Invalid lorry request data" });
  }
});

// Get lorry bookings for user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const bookings = await storage.getUserLorryBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching lorry bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get specific lorry booking
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookingId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const booking = await storage.getLorryBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Lorry booking not found" });
    }

    // Check if user owns this booking or is the assigned driver
    if (booking.userId !== userId && booking.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching lorry booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel lorry booking
router.post("/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookingId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const booking = await storage.getLorryBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Lorry booking not found" });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update booking status to cancelled
    const updatedBooking = await storage.updateLorryBooking(bookingId, {
      status: "cancelled"
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error cancelling lorry booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;