import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { calculateFare, assignDriver, processCompletion } from "../utils/businessLogic";
import { insertTaxiBookingSchema } from "@shared/schema";
import LiveOrderService from "../services/liveOrderService";
import { isAuthenticated, authorizeRole } from "../middleware/auth";

const router = Router();

// Request a ride
router.post("/request", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rideData = insertTaxiBookingSchema.parse(req.body);
    
    // Calculate fare
    const { fare, distance, duration } = calculateFare(
      parseFloat(rideData.pickupLatitude || "0"),
      parseFloat(rideData.pickupLongitude || "0"),
      parseFloat(rideData.dropoffLatitude || "0"),
      parseFloat(rideData.dropoffLongitude || "0"),
      rideData.vehicleType
    );

    // Create ride booking
    const ride = await storage.createTaxiBooking({
      ...rideData,
      userId,
    });

    // Update with calculated fields
    const updatedRide = await storage.updateTaxiBooking(ride.id, {
      fare: fare.toString(),
      distance: distance.toString(),
      estimatedDuration: duration,
    });

    // Get customer details for live order
    const customer = await storage.getUser(userId);
    
    // Create live order for real-time driver assignment
    try {
      await LiveOrderService.createLiveOrder({
        orderId: ride.id,
        serviceType: 'taxi',
        customerId: userId,
        customerName: customer?.name || 'Customer',
        customerPhone: customer?.phone || '',
        pickupLocation: rideData.pickupLocation,
        pickupLatitude: parseFloat(rideData.pickupLatitude || "0"),
        pickupLongitude: parseFloat(rideData.pickupLongitude || "0"),
        dropoffLocation: rideData.dropoffLocation,
        dropoffLatitude: parseFloat(rideData.dropoffLatitude || "0"),
        dropoffLongitude: parseFloat(rideData.dropoffLongitude || "0"),
        vehicleType: rideData.vehicleType,
        estimatedFare: fare,
        estimatedDistance: distance,
        estimatedDuration: duration,
        priority: 1,
      });
    } catch (error) {
      console.error('Error creating live order:', error);
    }

    res.json({ 
      ride: updatedRide || ride,
      estimatedFare: fare,
      estimatedDistance: distance,
      estimatedDuration: duration
    });
  } catch (error) {
    console.error("Error creating ride request:", error);
    res.status(400).json({ message: "Invalid ride request data" });
  }
});

// Get fare estimate
router.post("/estimate", async (req, res) => {
  try {
    const { pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, vehicleType } = req.body;
    
    if (!pickupLatitude || !pickupLongitude || !dropoffLatitude || !dropoffLongitude) {
      return res.status(400).json({ message: "Missing coordinates" });
    }

    const estimate = calculateFare(
      parseFloat(pickupLatitude),
      parseFloat(pickupLongitude),
      parseFloat(dropoffLatitude),
      parseFloat(dropoffLongitude),
      vehicleType || "car"
    );

    res.json(estimate);
  } catch (error) {
    console.error("Error calculating fare estimate:", error);
    res.status(500).json({ message: "Error calculating fare" });
  }
});

// Get ride status
router.get("/:id/status", async (req, res) => {
  try {
    const userId = req.session.userId;
    const rideId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ride = await storage.getTaxiBooking(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Check if user owns this ride or is the assigned driver
    if (ride.userId !== userId && ride.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ ride });
  } catch (error) {
    console.error("Error getting ride status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept ride (driver only)
router.post("/:id/accept", async (req, res) => {
  try {
    const userId = req.session.userId;
    const rideId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is a driver
    const user = await storage.getUser(userId);
    if (!user || user.role !== "driver") {
      return res.status(403).json({ message: "Driver access required" });
    }

    const ride = await storage.getTaxiBooking(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "pending") {
      return res.status(400).json({ message: "Ride is not available for acceptance" });
    }

    // Update ride with driver and status
    const updatedRide = await storage.updateTaxiBooking(rideId, {
      driverId: userId,
      status: "confirmed",
    });

    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start ride (driver only)
router.post("/:id/start", async (req, res) => {
  try {
    const userId = req.session.userId;
    const rideId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ride = await storage.getTaxiBooking(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (ride.status !== "confirmed") {
      return res.status(400).json({ message: "Ride cannot be started" });
    }

    const updatedRide = await storage.updateTaxiBooking(rideId, {
      status: "in_progress",
    });

    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error starting ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Complete ride (driver only)
router.post("/:id/complete", async (req, res) => {
  try {
    const userId = req.session.userId;
    const rideId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ride = await storage.getTaxiBooking(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (ride.status !== "in_progress") {
      return res.status(400).json({ message: "Ride is not in progress" });
    }

    // Update ride status
    const updatedRide = await storage.updateTaxiBooking(rideId, {
      status: "completed",
    });

    // Process payment and commission
    if (ride.fare && ride.driverId) {
      await processCompletion(
        "taxi",
        rideId,
        parseFloat(ride.fare),
        ride.userId,
        ride.driverId
      );
    }

    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel ride
router.post("/:id/cancel", async (req, res) => {
  try {
    const userId = req.session.userId;
    const rideId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ride = await storage.getTaxiBooking(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Only customer or assigned driver can cancel
    if (ride.userId !== userId && ride.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      return res.status(400).json({ message: "Ride cannot be cancelled" });
    }

    const updatedRide = await storage.updateTaxiBooking(rideId, {
      status: "cancelled",
    });

    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's rides
router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const rides = await storage.getTaxiBookingsByUser(userId);
    res.json({ rides });
  } catch (error) {
    console.error("Error getting user rides:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available rides for drivers
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

    const availableRides = await storage.getAvailableTaxiBookings();
    res.json({ rides: availableRides });
  } catch (error) {
    console.error("Error getting available rides:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;