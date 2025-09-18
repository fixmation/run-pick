import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { calculateParcelCost, assignDriver, processCompletion } from "../utils/businessLogic";
import { insertParcelDeliverySchema } from "@shared/schema";
import LiveOrderService from "../services/liveOrderService";
import { isAuthenticated, authorizeRole } from "../middleware/auth";

const router = Router();

// Create parcel delivery request
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcelData = insertParcelDeliverySchema.parse({
      ...req.body,
      userId,
    });

    // Calculate delivery cost
    const { cost, distance } = calculateParcelCost(
      parseFloat(parcelData.senderLatitude || "0"),
      parseFloat(parcelData.senderLongitude || "0"),
      parseFloat(parcelData.recipientLatitude || "0"),
      parseFloat(parcelData.recipientLongitude || "0"),
      parcelData.size
    );

    // Create parcel delivery
    const parcel = await storage.createParcelDelivery({
      ...parcelData,
      cost: cost.toString(),
    });

    // Create live order for real-time driver assignment
    try {
      await LiveOrderService.createLiveOrder({
        orderId: parcel.id,
        serviceType: 'parcel',
        customerId: userId,
        pickupLocation: parcelData.senderAddress,
        pickupLatitude: parseFloat(parcelData.senderLatitude || "0"),
        pickupLongitude: parseFloat(parcelData.senderLongitude || "0"),
        dropoffLocation: parcelData.recipientAddress,
        dropoffLatitude: parseFloat(parcelData.recipientLatitude || "0"),
        dropoffLongitude: parseFloat(parcelData.recipientLongitude || "0"),
        estimatedFare: cost,
        estimatedDistance: distance,
        priority: 1,
      });
    } catch (error) {
      console.error('Error creating live parcel order:', error);
    }

    res.json({ 
      parcel,
      estimatedCost: cost,
      estimatedDistance: distance
    });
  } catch (error) {
    console.error("Error creating parcel delivery:", error);
    res.status(400).json({ message: "Invalid parcel delivery data" });
  }
});

// Get cost estimate
router.post("/estimate", async (req, res) => {
  try {
    const { senderLatitude, senderLongitude, recipientLatitude, recipientLongitude, size } = req.body;
    
    if (!senderLatitude || !senderLongitude || !recipientLatitude || !recipientLongitude || !size) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const estimate = calculateParcelCost(
      parseFloat(senderLatitude),
      parseFloat(senderLongitude),
      parseFloat(recipientLatitude),
      parseFloat(recipientLongitude),
      size
    );

    res.json(estimate);
  } catch (error) {
    console.error("Error calculating parcel cost:", error);
    res.status(500).json({ message: "Error calculating cost" });
  }
});

// Get user's parcel deliveries
router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcels = await storage.getParcelDeliveriesByUser(userId);
    res.json({ parcels });
  } catch (error) {
    console.error("Error getting user parcels:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get parcel delivery status
router.get("/:id/status", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Check if user owns this parcel or is the assigned driver
    if (parcel.userId !== userId && parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ parcel });
  } catch (error) {
    console.error("Error getting parcel status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept parcel delivery (driver only)
router.post("/:id/accept", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is a driver
    const user = await storage.getUser(userId);
    if (!user || user.role !== "driver") {
      return res.status(403).json({ message: "Driver access required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.status !== "pending") {
      return res.status(400).json({ message: "Parcel is not available for acceptance" });
    }

    // Update parcel with driver and status
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      driverId: userId,
      status: "confirmed",
    } as any);

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error accepting parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Pickup parcel (driver only)
router.post("/:id/pickup", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (parcel.status !== "confirmed") {
      return res.status(400).json({ message: "Parcel cannot be picked up" });
    }

    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      status: "picked_up",
      pickupTime: new Date(),
    } as any);

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error picking up parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark parcel as in transit
router.post("/:id/transit", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (parcel.status !== "picked_up") {
      return res.status(400).json({ message: "Parcel must be picked up first" });
    }

    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      status: "in_transit",
    } as any);

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error updating parcel to transit:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Complete parcel delivery (driver only)
router.post("/:id/complete", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);
    const { proofOfDeliveryUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (parcel.status !== "in_transit") {
      return res.status(400).json({ message: "Parcel is not in transit" });
    }

    // Update parcel status
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      status: "delivered",
      deliveryTime: new Date(),
      proofOfDeliveryUrl,
    } as any);

    // Process payment and commission
    if (parcel.driverId) {
      await processCompletion(
        "parcel",
        parcelId,
        parseFloat(parcel.cost),
        parcel.userId,
        parcel.driverId
      );
    }

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error completing parcel delivery:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload proof of delivery
router.post("/:id/proof", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);
    const { proofOfDeliveryUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!proofOfDeliveryUrl) {
      return res.status(400).json({ message: "Proof of delivery URL required" });
    }

    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      proofOfDeliveryUrl,
    } as any);

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error uploading proof of delivery:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel parcel delivery
router.post("/:id/cancel", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Only customer or assigned driver can cancel
    if (parcel.userId !== userId && parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (parcel.status === "delivered" || parcel.status === "cancelled") {
      return res.status(400).json({ message: "Parcel cannot be cancelled" });
    }

    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      status: "cancelled",
    } as any);

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error cancelling parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available parcels for drivers
router.get("/available", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is a driver
    const user = await storage.getUser(userId);
    if (!user || user.role !== "driver") {
      return res.status(403).json({ message: "Driver access required" });
    }

    const availableParcels = await storage.getAvailableParcelDeliveries();
    res.json({ parcels: availableParcels });
  } catch (error) {
    console.error("Error getting available parcels:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// COD collection confirmation
router.post("/:id/cod-collected", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);
    const { codAmount } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const parcel = await storage.getParcelDelivery(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!parcel.codFlag) {
      return res.status(400).json({ message: "This parcel is not COD" });
    }

    if (parcel.status !== "delivered") {
      return res.status(400).json({ message: "Parcel must be delivered first" });
    }

    // Update COD amount (if different from initial)
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      codAmount: codAmount || parcel.codAmount,
    });

    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error confirming COD collection:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;