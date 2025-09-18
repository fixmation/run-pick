import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["customer", "driver", "vendor", "business", "admin"]);
export const businessTypeEnum = pgEnum("business_type", ["restaurant", "gas_agent", "grocery", "pharmacy", "electronics"]);
export const driverTypeEnum = pgEnum("driver_type", ["car_driver", "bike_rider", "heavy_vehicle"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]);
export const parcelStatusEnum = pgEnum("parcel_status", ["pending", "confirmed", "picked_up", "in_transit", "delivered", "cancelled"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["credit", "debit", "commission", "refund"]);
export const serviceTypeEnum = pgEnum("service_type", ["taxi", "food", "parcel", "gas"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["car", "bike", "tuk_tuk", "mini_van", "van", "truck", "lorry_light", "light_open", "mover", "mover_open", "mover_plus", "mover_plus_open"]);
export const driverStatusEnum = pgEnum("driver_status", ["offline", "online", "busy", "unavailable"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").default("customer").notNull(),
  businessType: businessTypeEnum("business_type"),
  driverType: driverTypeEnum("driver_type"),
  city: text("city"),
  district: text("district"),
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Driver profiles table
export const driverProfiles = pgTable("driver_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  licenseNumber: text("license_number").notNull(),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  vehicleModel: text("vehicle_model"),
  vehicleColor: text("vehicle_color"),
  vehicleYear: integer("vehicle_year"),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  status: driverStatusEnum("status").default("offline"),
  isAvailable: boolean("is_available").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalRides: integer("total_rides").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor profiles table
export const vendorProfiles = pgTable("vendor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  description: text("description"),
  orderId: integer("order_id"),
  serviceType: serviceTypeEnum("service_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  serviceProviderId: integer("service_provider_id").notNull().references(() => users.id),
  orderId: integer("order_id"),
  serviceType: serviceTypeEnum("service_type").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Commission rules table
export const commissionRules = pgTable("commission_rules", {
  id: serial("id").primaryKey(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  flatFee: decimal("flat_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Taxi bookings table
export const taxiBookings = pgTable("taxi_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 8 }),
  dropoffLongitude: decimal("dropoff_longitude", { precision: 11, scale: 8 }),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  pickupTime: timestamp("pickup_time").notNull(),
  fare: decimal("fare", { precision: 10, scale: 2 }),
  baseFare: decimal("base_fare", { precision: 10, scale: 2 }),
  distance: decimal("distance", { precision: 8, scale: 2 }),
  estimatedDuration: integer("estimated_duration"),
  actualDuration: integer("actual_duration"),
  route: text("route"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  scheduledTime: timestamp("scheduled_time"),
  acceptedAt: timestamp("accepted_at"),
  arrivedAt: timestamp("arrived_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lorry bookings table (similar to taxi bookings but for lorries)
export const lorryBookings = pgTable("lorry_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 8 }),
  dropoffLongitude: decimal("dropoff_longitude", { precision: 11, scale: 8 }),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  pickupTime: timestamp("pickup_time").notNull(),
  fare: decimal("fare", { precision: 10, scale: 2 }),
  baseFare: decimal("base_fare", { precision: 10, scale: 2 }),
  distance: decimal("distance", { precision: 8, scale: 2 }),
  estimatedDuration: integer("estimated_duration"),
  actualDuration: integer("actual_duration"),
  route: text("route"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  scheduledTime: timestamp("scheduled_time"),
  acceptedAt: timestamp("accepted_at"),
  arrivedAt: timestamp("arrived_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Restaurants table
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: text("phone"),
  cuisine: text("cuisine"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  deliveryTime: integer("delivery_time").default(30), // minutes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Service zones table for location-based recommendations
export const serviceZones = pgTable("service_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  centerLatitude: decimal("center_latitude", { precision: 10, scale: 8 }).notNull(),
  centerLongitude: decimal("center_longitude", { precision: 11, scale: 8 }).notNull(),
  radiusKm: decimal("radius_km", { precision: 5, scale: 2 }).default("10.00"),
  priority: integer("priority").default(1), // Higher number = higher priority
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata"), // Store additional zone info
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Location-based recommendations table
export const locationRecommendations = pgTable("location_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userLatitude: decimal("user_latitude", { precision: 10, scale: 8 }).notNull(),
  userLongitude: decimal("user_longitude", { precision: 11, scale: 8 }).notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  recommendedServices: jsonb("recommended_services").notNull(), // Array of service recommendations
  distanceKm: decimal("distance_km", { precision: 8, scale: 2 }),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.00"), // 0-1 confidence score
  isViewed: boolean("is_viewed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Recommendations expire after some time
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Food orders table
export const foodOrders = pgTable("food_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  driverId: integer("driver_id").references(() => users.id),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  orderTime: timestamp("order_time").defaultNow().notNull(),
  deliveryTime: timestamp("delivery_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => foodOrders.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Parcel deliveries table
export const parcelDeliveries = pgTable("parcel_deliveries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  driverId: integer("driver_id").references(() => users.id),
  senderName: text("sender_name").notNull(),
  senderPhone: text("sender_phone").notNull(),
  senderAddress: text("sender_address").notNull(),
  senderLatitude: decimal("sender_latitude", { precision: 10, scale: 8 }),
  senderLongitude: decimal("sender_longitude", { precision: 11, scale: 8 }),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  recipientLatitude: decimal("recipient_latitude", { precision: 10, scale: 8 }),
  recipientLongitude: decimal("recipient_longitude", { precision: 11, scale: 8 }),
  packageType: text("package_type").notNull(),
  size: text("size").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  dimensions: text("dimensions"),
  deliveryInstructions: text("delivery_instructions"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  codAmount: decimal("cod_amount", { precision: 10, scale: 2 }),
  codFlag: boolean("cod_flag").default(false).notNull(),
  status: parcelStatusEnum("status").default("pending").notNull(),
  proofOfDeliveryUrl: text("proof_of_delivery_url"),
  pickupTime: timestamp("pickup_time"),
  deliveryTime: timestamp("delivery_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Commission tracking table
export const driverCommissions = pgTable("driver_commissions", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => users.id),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  commissionOwed: decimal("commission_owed", { precision: 10, scale: 2 }).default("0.00").notNull(),
  commissionPaid: decimal("commission_paid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lastReminderSent: timestamp("last_reminder_sent"),
  reminderCount: integer("reminder_count").default(0),
  isBlocked: boolean("is_blocked").default(false),
  blockedAt: timestamp("blocked_at"),
  unblockedAt: timestamp("unblocked_at"),
  weeklyStartDate: timestamp("weekly_start_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Commission transactions table
export const commissionTransactions = pgTable("commission_transactions", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => users.id),
  orderId: integer("order_id").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Driver notifications table - Enhanced for live booking notifications
export const driverNotifications = pgTable("driver_notifications", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'ride_request', 'food_order', 'parcel_pickup', 'commission_reminder', 'account_blocked', 'account_unblocked'
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: integer("order_id"), // Reference to the specific order/booking
  serviceType: serviceTypeEnum("service_type"), // 'taxi', 'food', 'parcel'
  priority: text("priority").default("normal"), // 'urgent', 'high', 'normal', 'low'
  isRead: boolean("is_read").default(false),
  isAccepted: boolean("is_accepted").default(false),
  isRejected: boolean("is_rejected").default(false),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  expiresAt: timestamp("expires_at"), // Auto-reject after this time
  sentVia: text("sent_via"), // 'websocket', 'email', 'sms', 'in_app'
  metadata: jsonb("metadata"), // Contains pickup/dropoff details, customer info, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enum for notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "order_received", "order_status_update", "ride_request", "delivery_request", 
  "gas_request", "payment_received", "rating_received", "system_announcement",
  "commission_reminder", "account_update", "promotion", "verification_status"
]);

// Enum for notification priorities
export const notificationPriorityEnum = pgEnum("notification_priority", ["low", "normal", "high", "urgent"]);

// Universal notifications table for all user roles
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userRole: userRoleEnum("user_role").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: integer("order_id"), // Reference to related order/booking
  serviceType: serviceTypeEnum("service_type"),
  priority: notificationPriorityEnum("priority").default("normal").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isActionRequired: boolean("is_action_required").default(false).notNull(),
  actionTaken: text("action_taken"), // 'accepted', 'rejected', 'completed', 'cancelled'
  actionTakenAt: timestamp("action_taken_at"),
  expiresAt: timestamp("expires_at"),
  sentVia: text("sent_via").array().default([]).notNull(), // ['in_app', 'email', 'sms', 'push']
  metadata: jsonb("metadata"), // Additional data (customer info, location, etc.)
  relatedUserId: integer("related_user_id").references(() => users.id), // Customer/Driver/Vendor involved
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    userRoleIdx: index("notifications_user_role_idx").on(table.userRole),
    typeIdx: index("notifications_type_idx").on(table.type),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  };
});

// Message logs table with 90-day retention for tracking all messages/orders
export const messageLogs = pgTable("message_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userRole: userRoleEnum("user_role").notNull(),
  recipientId: integer("recipient_id").references(() => users.id, { onDelete: "cascade" }),
  recipientRole: userRoleEnum("recipient_role"),
  messageType: text("message_type").notNull(), // 'notification', 'order', 'booking', 'system'
  serviceType: serviceTypeEnum("service_type"),
  orderId: integer("order_id"), // Related order/booking ID
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: notificationPriorityEnum("priority").default("normal").notNull(),
  deliveryMethods: text("delivery_methods").array().default([]).notNull(), // ['in_app', 'email', 'sms']
  deliveryStatus: text("delivery_status").default("sent").notNull(), // 'sent', 'delivered', 'failed', 'read'
  metadata: jsonb("metadata"), // Store additional message context
  customerInfo: jsonb("customer_info"), // Customer details for vendors
  locationInfo: jsonb("location_info"), // Location/address information
  orderDetails: jsonb("order_details"), // Order/booking specific details
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  responseRequired: boolean("response_required").default(false).notNull(),
  responseGiven: boolean("response_given").default(false).notNull(),
  responseData: jsonb("response_data"), // Accept/reject/custom response
  responseAt: timestamp("response_at"),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '90 days'`).notNull(), // Auto-delete after 90 days
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("message_logs_user_id_idx").on(table.userId),
    recipientIdIdx: index("message_logs_recipient_id_idx").on(table.recipientId),
    messageTypeIdx: index("message_logs_message_type_idx").on(table.messageType),
    serviceTypeIdx: index("message_logs_service_type_idx").on(table.serviceType),
    createdAtIdx: index("message_logs_created_at_idx").on(table.createdAt),
    expiresAtIdx: index("message_logs_expires_at_idx").on(table.expiresAt), // For efficient cleanup
    orderIdIdx: index("message_logs_order_id_idx").on(table.orderId),
  };
});

// Live order requests table - For managing real-time driver assignments
export const liveOrderRequests = pgTable("live_order_requests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }).notNull(),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }).notNull(),
  dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 8 }),
  dropoffLongitude: decimal("dropoff_longitude", { precision: 11, scale: 8 }),
  vehicleType: vehicleTypeEnum("vehicle_type"),
  maxRadius: decimal("max_radius", { precision: 5, scale: 2 }).default("10.00"), // km
  currentRadius: decimal("current_radius", { precision: 5, scale: 2 }).default("2.00"), // Start with 2km, expand gradually
  status: text("status").default("searching"), // 'searching', 'assigned', 'accepted', 'rejected', 'expired'
  assignedDriverIds: jsonb("assigned_driver_ids").default([]), // Track drivers already notified
  rejectedDriverIds: jsonb("rejected_driver_ids").default([]), // Track drivers who rejected
  acceptedDriverId: integer("accepted_driver_id").references(() => users.id),
  priority: integer("priority").default(0), // Higher number = higher priority
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WebSocket connections table - Track active driver connections
export const driverConnections = pgTable("driver_connections", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => users.id),
  connectionId: text("connection_id").notNull().unique(),
  isActive: boolean("is_active").default(true),
  lastPing: timestamp("last_ping").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  name: true,
  role: true,
});

export const insertDriverProfileSchema = createInsertSchema(driverProfiles).pick({
  userId: true,
  licenseNumber: true,
  vehicleType: true,
  vehicleNumber: true,
  vehicleModel: true,
});

export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).pick({
  userId: true,
  businessName: true,
  businessType: true,
  address: true,
  latitude: true,
  longitude: true,
});

export const insertTaxiBookingSchema = createInsertSchema(taxiBookings).pick({
  userId: true,
  pickupLocation: true,
  dropoffLocation: true,
  pickupLatitude: true,
  pickupLongitude: true,
  dropoffLatitude: true,
  dropoffLongitude: true,
  pickupTime: true,
  vehicleType: true,
});

export const insertLorryBookingSchema = createInsertSchema(lorryBookings).pick({
  userId: true,
  pickupLocation: true,
  dropoffLocation: true,
  pickupLatitude: true,
  pickupLongitude: true,
  dropoffLatitude: true,
  dropoffLongitude: true,
  pickupTime: true,
  vehicleType: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).pick({
  name: true,
  description: true,
  address: true,
  latitude: true,
  longitude: true,
  phone: true,
  cuisine: true,
  rating: true,
  deliveryTime: true,
});

export const insertServiceZoneSchema = createInsertSchema(serviceZones).pick({
  name: true,
  serviceType: true,
  centerLatitude: true,
  centerLongitude: true,
  radiusKm: true,
  priority: true,
  metadata: true,
});

export const insertLocationRecommendationSchema = createInsertSchema(locationRecommendations).pick({
  userId: true,
  userLatitude: true,
  userLongitude: true,
  serviceType: true,
  recommendedServices: true,
  distanceKm: true,
  confidence: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  restaurantId: true,
  name: true,
  description: true,
  price: true,
  category: true,
});

export const insertFoodOrderSchema = createInsertSchema(foodOrders).pick({
  userId: true,
  restaurantId: true,
  deliveryAddress: true,
  deliveryLatitude: true,
  deliveryLongitude: true,
  totalAmount: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  menuItemId: true,
  quantity: true,
  price: true,
});

export const insertParcelDeliverySchema = createInsertSchema(parcelDeliveries).pick({
  userId: true,
  senderName: true,
  senderPhone: true,
  senderAddress: true,
  senderLatitude: true,
  senderLongitude: true,
  recipientName: true,
  recipientPhone: true,
  recipientAddress: true,
  recipientLatitude: true,
  recipientLongitude: true,
  packageType: true,
  size: true,
  weight: true,
  dimensions: true,
  deliveryInstructions: true,
  cost: true,
  codAmount: true,
  codFlag: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true,
  orderId: true,
  serviceType: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  customerId: true,
  serviceProviderId: true,
  orderId: true,
  serviceType: true,
  rating: true,
  comment: true,
});

// Password reset table
export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset schemas
export const insertPasswordResetSchema = createInsertSchema(passwordResets).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

// Type exports
export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

export const insertCommissionRuleSchema = createInsertSchema(commissionRules).pick({
  serviceType: true,
  percentage: true,
  flatFee: true,
});

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  userRole: true,
  type: true,
  title: true,
  message: true,
  orderId: true,
  serviceType: true,
  priority: true,
  isActionRequired: true,
  expiresAt: true,
  sentVia: true,
  metadata: true,
  relatedUserId: true,
});

export const insertMessageLogSchema = createInsertSchema(messageLogs).pick({
  userId: true,
  userRole: true,
  recipientId: true,
  recipientRole: true,
  messageType: true,
  serviceType: true,
  orderId: true,
  title: true,
  content: true,
  priority: true,
  deliveryMethods: true,
  deliveryStatus: true,
  metadata: true,
  customerInfo: true,
  locationInfo: true,
  orderDetails: true,
  responseRequired: true,
  expiresAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DriverProfile = typeof driverProfiles.$inferSelect;
export type InsertDriverProfile = z.infer<typeof insertDriverProfileSchema>;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Commission schema types
export type DriverCommission = typeof driverCommissions.$inferSelect;
export type InsertDriverCommission = typeof driverCommissions.$inferInsert;
export type CommissionTransaction = typeof commissionTransactions.$inferSelect;
export type InsertCommissionTransaction = typeof commissionTransactions.$inferInsert;
export type DriverNotification = typeof driverNotifications.$inferSelect;
export type InsertDriverNotification = typeof driverNotifications.$inferInsert;
export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = z.infer<typeof insertCommissionRuleSchema>;
export type ServiceZone = typeof serviceZones.$inferSelect;
export type InsertServiceZone = z.infer<typeof insertServiceZoneSchema>;

// Notification types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MessageLog = typeof messageLogs.$inferSelect;
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;
export type LocationRecommendation = typeof locationRecommendations.$inferSelect;
export type InsertLocationRecommendation = z.infer<typeof insertLocationRecommendationSchema>;
export type TaxiBooking = typeof taxiBookings.$inferSelect;
export type InsertTaxiBooking = z.infer<typeof insertTaxiBookingSchema>;
export type LorryBooking = typeof lorryBookings.$inferSelect;
export type InsertLorryBooking = z.infer<typeof insertLorryBookingSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type FoodOrder = typeof foodOrders.$inferSelect;
export type InsertFoodOrder = z.infer<typeof insertFoodOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type ParcelDelivery = typeof parcelDeliveries.$inferSelect;
export type InsertParcelDelivery = z.infer<typeof insertParcelDeliverySchema>;

// Achievement System Tables
export const achievementCategories = pgTable("achievement_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: varchar("description"),
  iconColor: varchar("icon_color").default("#3B82F6"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => achievementCategories.id),
  name: varchar("name").notNull(),
  description: varchar("description").notNull(),
  badgeIcon: varchar("badge_icon").notNull(), // Lucide icon name
  badgeColor: varchar("badge_color").default("#10B981"),
  points: integer("points").default(10),
  requirement: jsonb("requirement").notNull(), // {type: 'ride_count', target: 10}
  tier: varchar("tier").default("bronze"), // bronze, silver, gold, platinum, diamond
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  totalPoints: integer("total_points").default(0),
  currentLevel: integer("current_level").default(1),
  totalRides: integer("total_rides").default(0),
  totalFoodOrders: integer("total_food_orders").default(0),
  totalParcels: integer("total_parcels").default(0),
  totalEarnings: integer("total_earnings").default(0), // in cents
  perfectRatingCount: integer("perfect_rating_count").default(0),
  streakDays: integer("streak_days").default(0),
  longestStreak: integer("longest_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyProgress = pgTable("daily_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  ridesCompleted: integer("rides_completed").default(0),
  foodOrdersCompleted: integer("food_orders_completed").default(0),
  parcelsDelivered: integer("parcels_delivered").default(0),
  pointsEarned: integer("points_earned").default(0),
  achievementsUnlocked: integer("achievements_unlocked").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userDateIdx: index("user_date_idx").on(table.userId, table.date),
}));

// Achievement Relations
export const achievementCategoriesRelations = relations(achievementCategories, ({ many }) => ({
  achievements: many(achievements),
}));

export const achievementsRelations = relations(achievements, ({ one, many }) => ({
  category: one(achievementCategories, {
    fields: [achievements.categoryId],
    references: [achievementCategories.id],
  }),
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
  user: one(users, {
    fields: [dailyProgress.userId],
    references: [users.id],
  }),
}));

// Zod schemas for achievements
export const insertAchievementCategorySchema = createInsertSchema(achievementCategories).pick({
  name: true,
  description: true,
  iconColor: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  categoryId: true,
  name: true,
  description: true,
  badgeIcon: true,
  badgeColor: true,
  points: true,
  requirement: true,
  tier: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
  totalPoints: true,
  currentLevel: true,
  totalRides: true,
  totalFoodOrders: true,
  totalParcels: true,
  totalEarnings: true,
});

// Chat System Tables
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  driverId: integer("driver_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  messageText: text("message_text").notNull(),
  messageType: text("message_type").default("text").notNull(), // text, location, image
  metadata: jsonb("metadata"), // For location coordinates, image URLs, etc.
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat Relations
export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  customer: one(users, {
    fields: [chatRooms.customerId],
    references: [users.id],
  }),
  driver: one(users, {
    fields: [chatRooms.driverId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatMessages.chatRoomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [chatMessages.receiverId],
    references: [users.id],
  }),
}));

// Chat Zod schemas
export const insertChatRoomSchema = createInsertSchema(chatRooms).pick({
  orderId: true,
  serviceType: true,
  customerId: true,
  driverId: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  chatRoomId: true,
  senderId: true,
  receiverId: true,
  messageText: true,
  messageType: true,
  metadata: true,
});

// Type exports for achievements
export type AchievementCategory = typeof achievementCategories.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type DailyProgress = typeof dailyProgress.$inferSelect;

export type InsertAchievementCategory = z.infer<typeof insertAchievementCategorySchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type InsertDailyProgress = typeof dailyProgress.$inferInsert;

// Type exports for chat
export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;


