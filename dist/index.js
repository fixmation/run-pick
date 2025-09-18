var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievementCategories: () => achievementCategories,
  achievementCategoriesRelations: () => achievementCategoriesRelations,
  achievements: () => achievements,
  achievementsRelations: () => achievementsRelations,
  bookingStatusEnum: () => bookingStatusEnum,
  commissionRules: () => commissionRules,
  commissionTransactions: () => commissionTransactions,
  dailyProgress: () => dailyProgress,
  dailyProgressRelations: () => dailyProgressRelations,
  driverCommissions: () => driverCommissions,
  driverConnections: () => driverConnections,
  driverNotifications: () => driverNotifications,
  driverProfiles: () => driverProfiles,
  driverStatusEnum: () => driverStatusEnum,
  foodOrders: () => foodOrders,
  insertAchievementCategorySchema: () => insertAchievementCategorySchema,
  insertAchievementSchema: () => insertAchievementSchema,
  insertCommissionRuleSchema: () => insertCommissionRuleSchema,
  insertDriverProfileSchema: () => insertDriverProfileSchema,
  insertFoodOrderSchema: () => insertFoodOrderSchema,
  insertLocationRecommendationSchema: () => insertLocationRecommendationSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertParcelDeliverySchema: () => insertParcelDeliverySchema,
  insertPasswordResetSchema: () => insertPasswordResetSchema,
  insertRatingSchema: () => insertRatingSchema,
  insertRestaurantSchema: () => insertRestaurantSchema,
  insertServiceZoneSchema: () => insertServiceZoneSchema,
  insertTaxiBookingSchema: () => insertTaxiBookingSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserStatsSchema: () => insertUserStatsSchema,
  insertVendorProfileSchema: () => insertVendorProfileSchema,
  liveOrderRequests: () => liveOrderRequests,
  locationRecommendations: () => locationRecommendations,
  menuItems: () => menuItems,
  orderItems: () => orderItems,
  orderStatusEnum: () => orderStatusEnum,
  parcelDeliveries: () => parcelDeliveries,
  parcelStatusEnum: () => parcelStatusEnum,
  passwordResets: () => passwordResets,
  ratings: () => ratings,
  restaurants: () => restaurants,
  serviceTypeEnum: () => serviceTypeEnum,
  serviceZones: () => serviceZones,
  taxiBookings: () => taxiBookings,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  userAchievements: () => userAchievements,
  userAchievementsRelations: () => userAchievementsRelations,
  userRoleEnum: () => userRoleEnum,
  userStats: () => userStats,
  userStatsRelations: () => userStatsRelations,
  users: () => users,
  vehicleTypeEnum: () => vehicleTypeEnum,
  vendorProfiles: () => vendorProfiles,
  wallets: () => wallets
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum, bookingStatusEnum, orderStatusEnum, parcelStatusEnum, transactionTypeEnum, serviceTypeEnum, vehicleTypeEnum, driverStatusEnum, users, driverProfiles, vendorProfiles, wallets, transactions, ratings, commissionRules, taxiBookings, restaurants, serviceZones, locationRecommendations, menuItems, foodOrders, orderItems, parcelDeliveries, driverCommissions, commissionTransactions, driverNotifications, liveOrderRequests, driverConnections, insertUserSchema, insertDriverProfileSchema, insertVendorProfileSchema, insertTaxiBookingSchema, insertRestaurantSchema, insertServiceZoneSchema, insertLocationRecommendationSchema, insertMenuItemSchema, insertFoodOrderSchema, insertOrderItemSchema, insertParcelDeliverySchema, insertTransactionSchema, insertRatingSchema, passwordResets, insertPasswordResetSchema, insertCommissionRuleSchema, achievementCategories, achievements, userAchievements, userStats, dailyProgress, achievementCategoriesRelations, achievementsRelations, userAchievementsRelations, userStatsRelations, dailyProgressRelations, insertAchievementCategorySchema, insertAchievementSchema, insertUserStatsSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["customer", "driver", "vendor", "admin"]);
    bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]);
    orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]);
    parcelStatusEnum = pgEnum("parcel_status", ["pending", "confirmed", "picked_up", "in_transit", "delivered", "cancelled"]);
    transactionTypeEnum = pgEnum("transaction_type", ["credit", "debit", "commission", "refund"]);
    serviceTypeEnum = pgEnum("service_type", ["taxi", "food", "parcel"]);
    vehicleTypeEnum = pgEnum("vehicle_type", ["car", "bike", "tuk_tuk", "mini_van", "van", "truck"]);
    driverStatusEnum = pgEnum("driver_status", ["offline", "online", "busy", "unavailable"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull().unique(),
      phone: text("phone"),
      name: text("name"),
      role: userRoleEnum("role").default("customer").notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      isVerified: boolean("is_verified").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    driverProfiles = pgTable("driver_profiles", {
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
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    vendorProfiles = pgTable("vendor_profiles", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      businessName: text("business_name").notNull(),
      businessType: text("business_type").notNull(),
      address: text("address").notNull(),
      latitude: decimal("latitude", { precision: 10, scale: 8 }),
      longitude: decimal("longitude", { precision: 11, scale: 8 }),
      isVerified: boolean("is_verified").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    wallets = pgTable("wallets", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    transactions = pgTable("transactions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      type: transactionTypeEnum("type").notNull(),
      description: text("description"),
      orderId: integer("order_id"),
      serviceType: serviceTypeEnum("service_type"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    ratings = pgTable("ratings", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").notNull().references(() => users.id),
      serviceProviderId: integer("service_provider_id").notNull().references(() => users.id),
      orderId: integer("order_id"),
      serviceType: serviceTypeEnum("service_type").notNull(),
      rating: integer("rating").notNull(),
      comment: text("comment"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    commissionRules = pgTable("commission_rules", {
      id: serial("id").primaryKey(),
      serviceType: serviceTypeEnum("service_type").notNull(),
      percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
      flatFee: decimal("flat_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    taxiBookings = pgTable("taxi_bookings", {
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
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    restaurants = pgTable("restaurants", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      address: text("address").notNull(),
      latitude: decimal("latitude", { precision: 10, scale: 8 }),
      longitude: decimal("longitude", { precision: 11, scale: 8 }),
      phone: text("phone"),
      cuisine: text("cuisine"),
      rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
      deliveryTime: integer("delivery_time").default(30),
      // minutes
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    serviceZones = pgTable("service_zones", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      serviceType: serviceTypeEnum("service_type").notNull(),
      centerLatitude: decimal("center_latitude", { precision: 10, scale: 8 }).notNull(),
      centerLongitude: decimal("center_longitude", { precision: 11, scale: 8 }).notNull(),
      radiusKm: decimal("radius_km", { precision: 5, scale: 2 }).default("10.00"),
      priority: integer("priority").default(1),
      // Higher number = higher priority
      isActive: boolean("is_active").default(true).notNull(),
      metadata: jsonb("metadata"),
      // Store additional zone info
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    locationRecommendations = pgTable("location_recommendations", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      userLatitude: decimal("user_latitude", { precision: 10, scale: 8 }).notNull(),
      userLongitude: decimal("user_longitude", { precision: 11, scale: 8 }).notNull(),
      serviceType: serviceTypeEnum("service_type").notNull(),
      recommendedServices: jsonb("recommended_services").notNull(),
      // Array of service recommendations
      distanceKm: decimal("distance_km", { precision: 8, scale: 2 }),
      confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.00"),
      // 0-1 confidence score
      isViewed: boolean("is_viewed").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      expiresAt: timestamp("expires_at").notNull()
      // Recommendations expire after some time
    });
    menuItems = pgTable("menu_items", {
      id: serial("id").primaryKey(),
      restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
      name: text("name").notNull(),
      description: text("description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      category: text("category").notNull(),
      isAvailable: boolean("is_available").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    foodOrders = pgTable("food_orders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
      driverId: integer("driver_id").references(() => users.id),
      deliveryAddress: text("delivery_address").notNull(),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
      status: orderStatusEnum("status").default("pending").notNull(),
      orderTime: timestamp("order_time").defaultNow().notNull(),
      deliveryTime: timestamp("delivery_time"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull().references(() => foodOrders.id),
      menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
      quantity: integer("quantity").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    parcelDeliveries = pgTable("parcel_deliveries", {
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
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    driverCommissions = pgTable("driver_commissions", {
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
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    commissionTransactions = pgTable("commission_transactions", {
      id: serial("id").primaryKey(),
      driverId: integer("driver_id").notNull().references(() => users.id),
      orderId: integer("order_id").notNull(),
      serviceType: serviceTypeEnum("service_type").notNull(),
      orderAmount: decimal("order_amount", { precision: 10, scale: 2 }).notNull(),
      commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
      commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
      isPaid: boolean("is_paid").default(false),
      paidAt: timestamp("paid_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    driverNotifications = pgTable("driver_notifications", {
      id: serial("id").primaryKey(),
      driverId: integer("driver_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // 'ride_request', 'food_order', 'parcel_pickup', 'commission_reminder', 'account_blocked', 'account_unblocked'
      title: text("title").notNull(),
      message: text("message").notNull(),
      orderId: integer("order_id"),
      // Reference to the specific order/booking
      serviceType: serviceTypeEnum("service_type"),
      // 'taxi', 'food', 'parcel'
      priority: text("priority").default("normal"),
      // 'urgent', 'high', 'normal', 'low'
      isRead: boolean("is_read").default(false),
      isAccepted: boolean("is_accepted").default(false),
      isRejected: boolean("is_rejected").default(false),
      acceptedAt: timestamp("accepted_at"),
      rejectedAt: timestamp("rejected_at"),
      expiresAt: timestamp("expires_at"),
      // Auto-reject after this time
      sentVia: text("sent_via"),
      // 'websocket', 'email', 'sms', 'in_app'
      metadata: jsonb("metadata"),
      // Contains pickup/dropoff details, customer info, etc.
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    liveOrderRequests = pgTable("live_order_requests", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull(),
      serviceType: serviceTypeEnum("service_type").notNull(),
      customerId: integer("customer_id").notNull().references(() => users.id),
      pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }).notNull(),
      pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }).notNull(),
      dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 8 }),
      dropoffLongitude: decimal("dropoff_longitude", { precision: 11, scale: 8 }),
      vehicleType: vehicleTypeEnum("vehicle_type"),
      maxRadius: decimal("max_radius", { precision: 5, scale: 2 }).default("10.00"),
      // km
      currentRadius: decimal("current_radius", { precision: 5, scale: 2 }).default("2.00"),
      // Start with 2km, expand gradually
      status: text("status").default("searching"),
      // 'searching', 'assigned', 'accepted', 'rejected', 'expired'
      assignedDriverIds: jsonb("assigned_driver_ids").default([]),
      // Track drivers already notified
      rejectedDriverIds: jsonb("rejected_driver_ids").default([]),
      // Track drivers who rejected
      acceptedDriverId: integer("accepted_driver_id").references(() => users.id),
      priority: integer("priority").default(0),
      // Higher number = higher priority
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    driverConnections = pgTable("driver_connections", {
      id: serial("id").primaryKey(),
      driverId: integer("driver_id").notNull().references(() => users.id),
      connectionId: text("connection_id").notNull().unique(),
      isActive: boolean("is_active").default(true),
      lastPing: timestamp("last_ping").defaultNow(),
      userAgent: text("user_agent"),
      ipAddress: text("ip_address"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      email: true,
      phone: true,
      name: true,
      role: true
    });
    insertDriverProfileSchema = createInsertSchema(driverProfiles).pick({
      userId: true,
      licenseNumber: true,
      vehicleType: true,
      vehicleNumber: true,
      vehicleModel: true
    });
    insertVendorProfileSchema = createInsertSchema(vendorProfiles).pick({
      userId: true,
      businessName: true,
      businessType: true,
      address: true,
      latitude: true,
      longitude: true
    });
    insertTaxiBookingSchema = createInsertSchema(taxiBookings).pick({
      userId: true,
      pickupLocation: true,
      dropoffLocation: true,
      pickupLatitude: true,
      pickupLongitude: true,
      dropoffLatitude: true,
      dropoffLongitude: true,
      pickupTime: true,
      vehicleType: true
    });
    insertRestaurantSchema = createInsertSchema(restaurants).pick({
      name: true,
      description: true,
      address: true,
      latitude: true,
      longitude: true,
      phone: true,
      cuisine: true,
      rating: true,
      deliveryTime: true
    });
    insertServiceZoneSchema = createInsertSchema(serviceZones).pick({
      name: true,
      serviceType: true,
      centerLatitude: true,
      centerLongitude: true,
      radiusKm: true,
      priority: true,
      metadata: true
    });
    insertLocationRecommendationSchema = createInsertSchema(locationRecommendations).pick({
      userId: true,
      userLatitude: true,
      userLongitude: true,
      serviceType: true,
      recommendedServices: true,
      distanceKm: true,
      confidence: true
    });
    insertMenuItemSchema = createInsertSchema(menuItems).pick({
      restaurantId: true,
      name: true,
      description: true,
      price: true,
      category: true
    });
    insertFoodOrderSchema = createInsertSchema(foodOrders).pick({
      userId: true,
      restaurantId: true,
      deliveryAddress: true,
      totalAmount: true
    });
    insertOrderItemSchema = createInsertSchema(orderItems).pick({
      orderId: true,
      menuItemId: true,
      quantity: true,
      price: true
    });
    insertParcelDeliverySchema = createInsertSchema(parcelDeliveries).pick({
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
      codFlag: true
    });
    insertTransactionSchema = createInsertSchema(transactions).pick({
      userId: true,
      amount: true,
      type: true,
      description: true,
      orderId: true,
      serviceType: true
    });
    insertRatingSchema = createInsertSchema(ratings).pick({
      customerId: true,
      serviceProviderId: true,
      orderId: true,
      serviceType: true,
      rating: true,
      comment: true
    });
    passwordResets = pgTable("password_resets", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      token: text("token").unique().notNull(),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertPasswordResetSchema = createInsertSchema(passwordResets).pick({
      userId: true,
      token: true,
      expiresAt: true
    });
    insertCommissionRuleSchema = createInsertSchema(commissionRules).pick({
      serviceType: true,
      percentage: true,
      flatFee: true
    });
    achievementCategories = pgTable("achievement_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      description: varchar("description"),
      iconColor: varchar("icon_color").default("#3B82F6"),
      createdAt: timestamp("created_at").defaultNow()
    });
    achievements = pgTable("achievements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      categoryId: varchar("category_id").references(() => achievementCategories.id),
      name: varchar("name").notNull(),
      description: varchar("description").notNull(),
      badgeIcon: varchar("badge_icon").notNull(),
      // Lucide icon name
      badgeColor: varchar("badge_color").default("#10B981"),
      points: integer("points").default(10),
      requirement: jsonb("requirement").notNull(),
      // {type: 'ride_count', target: 10}
      tier: varchar("tier").default("bronze"),
      // bronze, silver, gold, platinum, diamond
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    userAchievements = pgTable("user_achievements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: integer("user_id").references(() => users.id).notNull(),
      achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
      progress: integer("progress").default(0),
      maxProgress: integer("max_progress").notNull(),
      isCompleted: boolean("is_completed").default(false),
      completedAt: timestamp("completed_at"),
      pointsEarned: integer("points_earned").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userStats = pgTable("user_stats", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: integer("user_id").references(() => users.id).notNull().unique(),
      totalPoints: integer("total_points").default(0),
      currentLevel: integer("current_level").default(1),
      totalRides: integer("total_rides").default(0),
      totalFoodOrders: integer("total_food_orders").default(0),
      totalParcels: integer("total_parcels").default(0),
      totalEarnings: integer("total_earnings").default(0),
      // in cents
      perfectRatingCount: integer("perfect_rating_count").default(0),
      streakDays: integer("streak_days").default(0),
      longestStreak: integer("longest_streak").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    dailyProgress = pgTable("daily_progress", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: integer("user_id").references(() => users.id).notNull(),
      date: varchar("date").notNull(),
      // YYYY-MM-DD format
      ridesCompleted: integer("rides_completed").default(0),
      foodOrdersCompleted: integer("food_orders_completed").default(0),
      parcelsDelivered: integer("parcels_delivered").default(0),
      pointsEarned: integer("points_earned").default(0),
      achievementsUnlocked: integer("achievements_unlocked").default(0),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      userDateIdx: index("user_date_idx").on(table.userId, table.date)
    }));
    achievementCategoriesRelations = relations(achievementCategories, ({ many }) => ({
      achievements: many(achievements)
    }));
    achievementsRelations = relations(achievements, ({ one, many }) => ({
      category: one(achievementCategories, {
        fields: [achievements.categoryId],
        references: [achievementCategories.id]
      }),
      userAchievements: many(userAchievements)
    }));
    userAchievementsRelations = relations(userAchievements, ({ one }) => ({
      user: one(users, {
        fields: [userAchievements.userId],
        references: [users.id]
      }),
      achievement: one(achievements, {
        fields: [userAchievements.achievementId],
        references: [achievements.id]
      })
    }));
    userStatsRelations = relations(userStats, ({ one }) => ({
      user: one(users, {
        fields: [userStats.userId],
        references: [users.id]
      })
    }));
    dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
      user: one(users, {
        fields: [dailyProgress.userId],
        references: [users.id]
      })
    }));
    insertAchievementCategorySchema = createInsertSchema(achievementCategories).pick({
      name: true,
      description: true,
      iconColor: true
    });
    insertAchievementSchema = createInsertSchema(achievements).pick({
      categoryId: true,
      name: true,
      description: true,
      badgeIcon: true,
      badgeColor: true,
      points: true,
      requirement: true,
      tier: true
    });
    insertUserStatsSchema = createInsertSchema(userStats).pick({
      userId: true,
      totalPoints: true,
      currentLevel: true,
      totalRides: true,
      totalFoodOrders: true,
      totalParcels: true,
      totalEarnings: true
    });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, inArray } from "drizzle-orm";
var sql2, db, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    sql2 = neon(process.env.DATABASE_URL);
    db = drizzle(sql2);
    DatabaseStorage = class {
      // User methods
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
      }
      async createUser(user) {
        const result = await db.insert(users).values(user).returning();
        return result[0];
      }
      async updateUser(id, user) {
        const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
        return result[0];
      }
      async updateUserPassword(userId, hashedPassword) {
        await db.update(users).set({
          password: hashedPassword,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId));
      }
      // Password reset methods
      async createPasswordReset(data) {
        await db.insert(passwordResets).values({
          userId: data.userId,
          token: data.token,
          expiresAt: data.expiresAt
        });
      }
      async getPasswordResetByToken(token) {
        const result = await db.select().from(passwordResets).where(eq(passwordResets.token, token));
        return result[0];
      }
      async deletePasswordReset(id) {
        await db.delete(passwordResets).where(eq(passwordResets.id, id));
      }
      // Profile methods
      async getDriverProfile(userId) {
        const result = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId));
        return result[0];
      }
      async createDriverProfile(profile) {
        const result = await db.insert(driverProfiles).values(profile).returning();
        return result[0];
      }
      async updateDriverProfile(userId, profile) {
        const result = await db.update(driverProfiles).set(profile).where(eq(driverProfiles.userId, userId)).returning();
        return result[0];
      }
      async getVendorProfile(userId) {
        const result = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId));
        return result[0];
      }
      async createVendorProfile(profile) {
        const result = await db.insert(vendorProfiles).values(profile).returning();
        return result[0];
      }
      async updateVendorProfile(userId, profile) {
        const result = await db.update(vendorProfiles).set(profile).where(eq(vendorProfiles.userId, userId)).returning();
        return result[0];
      }
      // Wallet methods
      async getWallet(userId) {
        const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
        return result[0];
      }
      async createWallet(userId) {
        const result = await db.insert(wallets).values({ userId, balance: "0.00" }).returning();
        return result[0];
      }
      async updateWalletBalance(userId, amount) {
        const result = await db.update(wallets).set({ balance: amount.toString() }).where(eq(wallets.userId, userId)).returning();
        return result[0];
      }
      // Transaction methods
      async getTransactionsByUser(userId, limit = 50) {
        return await db.select().from(transactions).where(eq(transactions.userId, userId)).limit(limit);
      }
      async createTransaction(transaction) {
        const result = await db.insert(transactions).values(transaction).returning();
        return result[0];
      }
      // Rating methods
      async getRatingsByServiceProvider(serviceProviderId) {
        return await db.select().from(ratings).where(eq(ratings.serviceProviderId, serviceProviderId));
      }
      async createRating(rating) {
        const result = await db.insert(ratings).values(rating).returning();
        return result[0];
      }
      // Commission rule methods
      async getCommissionRules() {
        return await db.select().from(commissionRules);
      }
      async getCommissionRuleByServiceType(serviceType) {
        const result = await db.select().from(commissionRules).where(
          and(eq(commissionRules.serviceType, serviceType), eq(commissionRules.isActive, true))
        );
        return result[0];
      }
      async createCommissionRule(rule) {
        const result = await db.insert(commissionRules).values(rule).returning();
        return result[0];
      }
      async updateCommissionRule(id, rule) {
        const result = await db.update(commissionRules).set(rule).where(eq(commissionRules.id, id)).returning();
        return result[0];
      }
      // Taxi booking methods
      async getTaxiBooking(id) {
        const result = await db.select().from(taxiBookings).where(eq(taxiBookings.id, id));
        return result[0];
      }
      async getTaxiBookingsByUser(userId) {
        return await db.select().from(taxiBookings).where(eq(taxiBookings.userId, userId));
      }
      async getAvailableTaxiBookings() {
        return await db.select().from(taxiBookings).where(eq(taxiBookings.status, "pending"));
      }
      async createTaxiBooking(booking) {
        const result = await db.insert(taxiBookings).values(booking).returning();
        return result[0];
      }
      async updateTaxiBooking(id, booking) {
        const result = await db.update(taxiBookings).set(booking).where(eq(taxiBookings.id, id)).returning();
        return result[0];
      }
      // Restaurant methods
      async getRestaurant(id) {
        const result = await db.select().from(restaurants).where(eq(restaurants.id, id));
        return result[0];
      }
      async getAllRestaurants() {
        return await db.select().from(restaurants).where(eq(restaurants.isActive, true));
      }
      async getRestaurantsByVendor(vendorId) {
        return await db.select().from(restaurants).where(eq(restaurants.id, vendorId));
      }
      async createRestaurant(restaurant) {
        const result = await db.insert(restaurants).values(restaurant).returning();
        return result[0];
      }
      async updateRestaurant(id, restaurant) {
        const result = await db.update(restaurants).set(restaurant).where(eq(restaurants.id, id)).returning();
        return result[0];
      }
      // Menu item methods
      async getMenuItem(id) {
        const result = await db.select().from(menuItems).where(eq(menuItems.id, id));
        return result[0];
      }
      async getMenuItemsByRestaurant(restaurantId) {
        return await db.select().from(menuItems).where(
          and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.isAvailable, true))
        );
      }
      async createMenuItem(item) {
        const result = await db.insert(menuItems).values(item).returning();
        return result[0];
      }
      async updateMenuItem(id, item) {
        const result = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
        return result[0];
      }
      // Food order methods
      async getFoodOrder(id) {
        const result = await db.select().from(foodOrders).where(eq(foodOrders.id, id));
        return result[0];
      }
      async getFoodOrdersByUser(userId) {
        return await db.select().from(foodOrders).where(eq(foodOrders.userId, userId));
      }
      async getPendingOrdersByRestaurants(restaurantIds) {
        return await db.select().from(foodOrders).where(
          and(
            inArray(foodOrders.restaurantId, restaurantIds),
            eq(foodOrders.status, "pending")
          )
        );
      }
      async getAvailableFoodDeliveries() {
        return await db.select().from(foodOrders).where(eq(foodOrders.status, "ready"));
      }
      async createFoodOrder(order) {
        const result = await db.insert(foodOrders).values(order).returning();
        return result[0];
      }
      async updateFoodOrder(id, order) {
        const result = await db.update(foodOrders).set(order).where(eq(foodOrders.id, id)).returning();
        return result[0];
      }
      // Order item methods
      async getOrderItemsByOrder(orderId) {
        return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      }
      async createOrderItem(item) {
        const result = await db.insert(orderItems).values(item).returning();
        return result[0];
      }
      // Parcel delivery methods
      async getParcelDelivery(id) {
        const result = await db.select().from(parcelDeliveries).where(eq(parcelDeliveries.id, id));
        return result[0];
      }
      async getParcelDeliveriesByUser(userId) {
        return await db.select().from(parcelDeliveries).where(eq(parcelDeliveries.userId, userId));
      }
      async getAvailableParcelDeliveries() {
        return await db.select().from(parcelDeliveries).where(eq(parcelDeliveries.status, "pending"));
      }
      async createParcelDelivery(delivery) {
        const result = await db.insert(parcelDeliveries).values(delivery).returning();
        return result[0];
      }
      async updateParcelDelivery(id, delivery) {
        const result = await db.update(parcelDeliveries).set(delivery).where(eq(parcelDeliveries.id, id)).returning();
        return result[0];
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/index.ts
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer } from "ws";

// server/routes/rideRoutes.ts
init_storage();
import { Router } from "express";

// server/utils/businessLogic.ts
init_schema();
import { drizzle as drizzle2 } from "drizzle-orm/neon-http";
import { neon as neon2 } from "@neondatabase/serverless";
import { eq as eq2, and as and2, sql as sql3 } from "drizzle-orm";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var dbSql = neon2(process.env.DATABASE_URL);
var db2 = drizzle2(dbSql);
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
}
function calculateFare(pickupLat, pickupLng, dropLat, dropLng, vehicleType) {
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  const rates = {
    "tuk-tuk": 80,
    "car": 120,
    "van": 150,
    "bike": 60
  };
  const baseFare = 100;
  const ratePerKm = rates[vehicleType] || rates.car;
  const fare = Math.round(baseFare + distance * ratePerKm);
  const duration = Math.round(distance * 3);
  return { fare, distance, duration };
}
function calculateParcelCost(pickupLat, pickupLng, dropLat, dropLng, size) {
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  const sizePricing = {
    "S": { base: 200, perKm: 15 },
    "M": { base: 350, perKm: 25 },
    "L": { base: 500, perKm: 40 }
  };
  const pricing = sizePricing[size] || sizePricing.M;
  const cost = Math.round(pricing.base + distance * pricing.perKm);
  return { cost, distance };
}
async function processCompletion(orderType, orderId, totalAmount, customerId, serviceProviderId, restaurantId) {
  try {
    const commissionRule = await db2.select().from(commissionRules).where(
      and2(
        eq2(commissionRules.serviceType, orderType),
        eq2(commissionRules.isActive, true)
      )
    ).limit(1);
    if (commissionRule.length === 0) {
      throw new Error(`No commission rule found for ${orderType}`);
    }
    const rule = commissionRule[0];
    const commissionAmount = Math.round(
      totalAmount * parseFloat(rule.percentage) / 100 + parseFloat(rule.flatFee)
    );
    const serviceProviderAmount = totalAmount - commissionAmount;
    if (orderType === "food" && restaurantId) {
      const driverAmount = Math.round(serviceProviderAmount * 0.3);
      const restaurantAmount = serviceProviderAmount - driverAmount;
      await updateWalletBalance(restaurantId, restaurantAmount);
      await createTransaction({
        userId: restaurantId,
        amount: restaurantAmount.toString(),
        type: "credit",
        description: `Food order completion - Order #${orderId}`,
        orderId,
        serviceType: orderType
      });
      await updateWalletBalance(serviceProviderId, driverAmount);
      await createTransaction({
        userId: serviceProviderId,
        amount: driverAmount.toString(),
        type: "credit",
        description: `Food delivery completion - Order #${orderId}`,
        orderId,
        serviceType: orderType
      });
    } else {
      await updateWalletBalance(serviceProviderId, serviceProviderAmount);
      await createTransaction({
        userId: serviceProviderId,
        amount: serviceProviderAmount.toString(),
        type: "credit",
        description: `${orderType.charAt(0).toUpperCase() + orderType.slice(1)} completion - Order #${orderId}`,
        orderId,
        serviceType: orderType
      });
    }
    await createTransaction({
      userId: 1,
      // Assuming admin user ID is 1
      amount: commissionAmount.toString(),
      type: "commission",
      description: `Commission from ${orderType} - Order #${orderId}`,
      orderId,
      serviceType: orderType
    });
    console.log(`Order ${orderId} completed successfully. Commission: ${commissionAmount}, Service Provider: ${serviceProviderAmount}`);
  } catch (error) {
    console.error("Error processing completion:", error);
    throw error;
  }
}
async function updateWalletBalance(userId, amount) {
  try {
    const existingWallet = await db2.select().from(wallets).where(eq2(wallets.userId, userId)).limit(1);
    if (existingWallet.length === 0) {
      await db2.insert(wallets).values({
        userId,
        balance: amount.toString()
      });
    } else {
      const currentBalance = parseFloat(existingWallet[0].balance);
      const newBalance = currentBalance + amount;
      await db2.update(wallets).set({
        balance: newBalance.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(wallets.userId, userId));
    }
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw error;
  }
}
async function createTransaction(transaction) {
  try {
    const [newTransaction] = await db2.insert(transactions).values(transaction).returning();
    return newTransaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

// server/routes/rideRoutes.ts
init_schema();

// server/db.ts
init_schema();
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzle3 } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db3 = drizzle3({ client: pool, schema: schema_exports });

// server/services/liveOrderService.ts
init_schema();
import { eq as eq3, and as and3, sql as sql4, lte, inArray as inArray2, not } from "drizzle-orm";
import WebSocket from "ws";
var LiveOrderService = class _LiveOrderService {
  static instance;
  websocketServer = null;
  driverConnections = /* @__PURE__ */ new Map();
  // driverId -> WebSocket
  connectionIds = /* @__PURE__ */ new Map();
  // connectionId -> driverId
  assignmentInterval = null;
  constructor() {
    this.startAssignmentProcessor();
  }
  static getInstance() {
    if (!_LiveOrderService.instance) {
      _LiveOrderService.instance = new _LiveOrderService();
    }
    return _LiveOrderService.instance;
  }
  /**
   * Set WebSocket server instance
   */
  setWebSocketServer(wss) {
    this.websocketServer = wss;
    this.setupWebSocketHandlers();
  }
  /**
   * Setup WebSocket connection handlers
   */
  setupWebSocketHandlers() {
    if (!this.websocketServer) return;
    this.websocketServer.on("connection", (ws2, req) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const driverId = parseInt(url.searchParams.get("driverId") || "0");
      const connectionId = this.generateConnectionId();
      if (!driverId) {
        ws2.close(4e3, "Invalid driver ID");
        return;
      }
      this.driverConnections.set(driverId, ws2);
      this.connectionIds.set(connectionId, driverId);
      this.updateDriverConnection(driverId, connectionId, req);
      console.log(`\u{1F50C} Driver ${driverId} connected (${connectionId})`);
      ws2.on("message", async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleDriverMessage(driverId, data, ws2);
        } catch (error) {
          console.error("Error handling driver message:", error);
        }
      });
      ws2.on("close", () => {
        console.log(`\u{1F50C} Driver ${driverId} disconnected`);
        this.driverConnections.delete(driverId);
        this.connectionIds.delete(connectionId);
        this.updateDriverConnectionStatus(driverId, connectionId, false);
      });
      ws2.on("error", (error) => {
        console.error(`WebSocket error for driver ${driverId}:`, error);
      });
      const pingInterval = setInterval(() => {
        if (ws2.readyState === WebSocket.OPEN) {
          ws2.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 3e4);
      ws2.on("pong", () => {
        this.updateLastPing(connectionId);
      });
    });
  }
  /**
   * Handle incoming messages from drivers
   */
  async handleDriverMessage(driverId, data, ws2) {
    switch (data.type) {
      case "accept_order":
        await this.handleOrderAcceptance(driverId, data.notificationId, data.orderId, data.serviceType);
        break;
      case "reject_order":
        await this.handleOrderRejection(driverId, data.notificationId, data.orderId, data.serviceType);
        break;
      case "update_location":
        await this.updateDriverLocation(driverId, data.latitude, data.longitude);
        break;
      case "status_change":
        await this.updateDriverStatus(driverId, data.status);
        break;
      case "heartbeat":
        ws2.send(JSON.stringify({ type: "heartbeat_ack", timestamp: Date.now() }));
        break;
      default:
        console.warn(`Unknown message type from driver ${driverId}:`, data.type);
    }
  }
  /**
   * Create a new live order request for driver assignment
   */
  async createLiveOrder(orderData) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    try {
      const [liveOrder] = await db3.insert(liveOrderRequests).values({
        orderId: orderData.orderId,
        serviceType: orderData.serviceType,
        customerId: orderData.customerId,
        pickupLatitude: orderData.pickupLatitude.toString(),
        pickupLongitude: orderData.pickupLongitude.toString(),
        dropoffLatitude: orderData.dropoffLatitude?.toString(),
        dropoffLongitude: orderData.dropoffLongitude?.toString(),
        vehicleType: orderData.vehicleType,
        maxRadius: (orderData.maxRadius || 10).toString(),
        currentRadius: "2.00",
        // Start with 2km radius
        priority: orderData.priority || 0,
        expiresAt
      }).returning();
      console.log(`\u{1F4CB} Live order ${orderData.orderId} created for ${orderData.serviceType} service`);
      await this.assignOrderToNearestDrivers(liveOrder.id);
    } catch (error) {
      console.error("Error creating live order:", error);
      throw error;
    }
  }
  /**
   * Find and notify nearest available drivers
   */
  async assignOrderToNearestDrivers(liveOrderId) {
    try {
      const [liveOrder] = await db3.select().from(liveOrderRequests).where(eq3(liveOrderRequests.id, liveOrderId)).limit(1);
      if (!liveOrder || liveOrder.status !== "searching") {
        return;
      }
      const currentRadius = parseFloat(liveOrder.currentRadius);
      const pickupLat = parseFloat(liveOrder.pickupLatitude);
      const pickupLng = parseFloat(liveOrder.pickupLongitude);
      const availableDrivers = await db3.select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        latitude: driverProfiles.currentLatitude,
        longitude: driverProfiles.currentLongitude,
        vehicleType: driverProfiles.vehicleType,
        rating: driverProfiles.rating,
        totalRides: driverProfiles.totalRides,
        name: users.name,
        phone: users.phone
      }).from(driverProfiles).innerJoin(users, eq3(driverProfiles.userId, users.id)).where(
        and3(
          eq3(driverProfiles.isAvailable, true),
          eq3(driverProfiles.isVerified, true),
          eq3(driverProfiles.status, "online"),
          eq3(users.isActive, true),
          liveOrder.vehicleType ? eq3(driverProfiles.vehicleType, liveOrder.vehicleType) : sql4`1=1`,
          // Exclude already assigned/rejected drivers
          liveOrder.assignedDriverIds ? not(inArray2(driverProfiles.userId, liveOrder.assignedDriverIds)) : sql4`1=1`,
          liveOrder.rejectedDriverIds ? not(inArray2(driverProfiles.userId, liveOrder.rejectedDriverIds)) : sql4`1=1`
        )
      );
      if (availableDrivers.length === 0) {
        await this.expandSearchRadius(liveOrderId);
        return;
      }
      const driversWithDistance = availableDrivers.map((driver) => ({
        ...driver,
        distance: driver.latitude && driver.longitude ? calculateDistance(
          pickupLat,
          pickupLng,
          parseFloat(driver.latitude),
          parseFloat(driver.longitude)
        ) : Infinity
      })).filter((driver) => driver.distance <= currentRadius).sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      });
      if (driversWithDistance.length === 0) {
        await this.expandSearchRadius(liveOrderId);
        return;
      }
      const driversToNotify = driversWithDistance.slice(0, 3);
      for (const driver of driversToNotify) {
        await this.sendOrderNotificationToDriver(driver, liveOrder);
      }
      const assignedIds = [...liveOrder.assignedDriverIds || [], ...driversToNotify.map((d) => d.userId)];
      await db3.update(liveOrderRequests).set({
        assignedDriverIds: assignedIds,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(liveOrderRequests.id, liveOrderId));
      console.log(`\u{1F4F1} Notified ${driversToNotify.length} drivers for order ${liveOrder.orderId}`);
    } catch (error) {
      console.error("Error assigning order to drivers:", error);
    }
  }
  /**
   * Send order notification to specific driver
   */
  async sendOrderNotificationToDriver(driver, liveOrder) {
    try {
      const expiresAt = new Date(Date.now() + 60 * 1e3);
      const [notification] = await db3.insert(driverNotifications).values({
        driverId: driver.userId,
        type: liveOrder.serviceType === "taxi" ? "ride_request" : liveOrder.serviceType === "food" ? "food_order" : "parcel_pickup",
        title: this.getNotificationTitle(liveOrder.serviceType),
        message: this.getNotificationMessage(liveOrder, driver.distance),
        orderId: liveOrder.orderId,
        serviceType: liveOrder.serviceType,
        priority: "urgent",
        expiresAt,
        sentVia: "websocket",
        metadata: {
          pickupLatitude: liveOrder.pickupLatitude,
          pickupLongitude: liveOrder.pickupLongitude,
          dropoffLatitude: liveOrder.dropoffLatitude,
          dropoffLongitude: liveOrder.dropoffLongitude,
          distance: driver.distance,
          estimatedFare: liveOrder.estimatedFare,
          estimatedDuration: liveOrder.estimatedDuration,
          customerName: driver.name,
          // This should be customer name, adjust as needed
          customerPhone: driver.phone
          // This should be customer phone, adjust as needed
        }
      }).returning();
      const ws2 = this.driverConnections.get(driver.userId);
      if (ws2 && ws2.readyState === WebSocket.OPEN) {
        const notificationData = {
          type: "new_order_request",
          notificationId: notification.id,
          orderId: liveOrder.orderId,
          serviceType: liveOrder.serviceType,
          title: notification.title,
          message: notification.message,
          distance: Math.round(driver.distance * 10) / 10,
          // Round to 1 decimal
          estimatedFare: liveOrder.estimatedFare,
          estimatedDuration: liveOrder.estimatedDuration,
          expiresAt: notification.expiresAt,
          metadata: notification.metadata,
          sound: "notification_ring",
          // Trigger ringtone
          priority: "urgent",
          timestamp: Date.now()
        };
        ws2.send(JSON.stringify(notificationData));
        console.log(`\u{1F4F2} Sent live notification to driver ${driver.userId} for order ${liveOrder.orderId}`);
      } else {
        console.log(`\u{1F4F5} Driver ${driver.userId} not connected, notification saved to database`);
      }
    } catch (error) {
      console.error("Error sending notification to driver:", error);
    }
  }
  /**
   * Handle driver accepting an order
   */
  async handleOrderAcceptance(driverId, notificationId, orderId, serviceType) {
    try {
      await db3.update(driverNotifications).set({
        isAccepted: true,
        acceptedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverNotifications.id, notificationId));
      await db3.update(liveOrderRequests).set({
        status: "accepted",
        acceptedDriverId: driverId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(liveOrderRequests.orderId, orderId));
      await this.assignDriverToOrder(orderId, driverId, serviceType);
      await this.cancelOtherNotifications(orderId, notificationId);
      console.log(`\u2705 Driver ${driverId} accepted order ${orderId}`);
    } catch (error) {
      console.error("Error handling order acceptance:", error);
    }
  }
  /**
   * Handle driver rejecting an order
   */
  async handleOrderRejection(driverId, notificationId, orderId, serviceType) {
    try {
      await db3.update(driverNotifications).set({
        isRejected: true,
        rejectedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverNotifications.id, notificationId));
      const [liveOrder] = await db3.select().from(liveOrderRequests).where(eq3(liveOrderRequests.orderId, orderId)).limit(1);
      if (liveOrder) {
        const rejectedIds = [...liveOrder.rejectedDriverIds || [], driverId];
        await db3.update(liveOrderRequests).set({
          rejectedDriverIds: rejectedIds,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(liveOrderRequests.orderId, orderId));
      }
      console.log(`\u274C Driver ${driverId} rejected order ${orderId}`);
      if (liveOrder) {
        setTimeout(() => {
          this.assignOrderToNearestDrivers(liveOrder.id);
        }, 2e3);
      }
    } catch (error) {
      console.error("Error handling order rejection:", error);
    }
  }
  /**
   * Expand search radius for order
   */
  async expandSearchRadius(liveOrderId) {
    try {
      const [liveOrder] = await db3.select().from(liveOrderRequests).where(eq3(liveOrderRequests.id, liveOrderId)).limit(1);
      if (!liveOrder) return;
      const currentRadius = parseFloat(liveOrder.currentRadius);
      const maxRadius = parseFloat(liveOrder.maxRadius);
      const newRadius = Math.min(currentRadius + 2, maxRadius);
      if (newRadius <= maxRadius) {
        await db3.update(liveOrderRequests).set({
          currentRadius: newRadius.toString(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(liveOrderRequests.id, liveOrderId));
        console.log(`\u{1F4E1} Expanded search radius to ${newRadius}km for order ${liveOrder.orderId}`);
        setTimeout(() => {
          this.assignOrderToNearestDrivers(liveOrderId);
        }, 3e3);
      } else {
        await db3.update(liveOrderRequests).set({
          status: "expired",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(liveOrderRequests.id, liveOrderId));
        console.log(`\u23F0 Order ${liveOrder.orderId} expired - no drivers found within ${maxRadius}km`);
      }
    } catch (error) {
      console.error("Error expanding search radius:", error);
    }
  }
  /**
   * Start the background assignment processor
   */
  startAssignmentProcessor() {
    this.assignmentInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredNotifications();
        await this.reassignStaleOrders();
      } catch (error) {
        console.error("Error in assignment processor:", error);
      }
    }, 3e4);
    console.log("\u{1F504} Live order assignment processor started");
  }
  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications() {
    const expiredNotifications = await db3.select().from(driverNotifications).where(
      and3(
        lte(driverNotifications.expiresAt, /* @__PURE__ */ new Date()),
        eq3(driverNotifications.isAccepted, false),
        eq3(driverNotifications.isRejected, false),
        inArray2(driverNotifications.type, ["ride_request", "food_order", "parcel_pickup"])
      )
    );
    for (const notification of expiredNotifications) {
      await db3.update(driverNotifications).set({
        isRejected: true,
        rejectedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverNotifications.id, notification.id));
    }
    if (expiredNotifications.length > 0) {
      console.log(`\u{1F9F9} Cleaned up ${expiredNotifications.length} expired notifications`);
    }
  }
  /**
   * Reassign stale orders
   */
  async reassignStaleOrders() {
    const staleOrders = await db3.select().from(liveOrderRequests).where(
      and3(
        eq3(liveOrderRequests.status, "searching"),
        lte(liveOrderRequests.createdAt, new Date(Date.now() - 2 * 60 * 1e3))
        // Older than 2 minutes
      )
    );
    for (const order of staleOrders) {
      await this.assignOrderToNearestDrivers(order.id);
    }
  }
  /**
   * Helper methods
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  getNotificationTitle(serviceType) {
    switch (serviceType) {
      case "taxi":
        return "\u{1F697} New Ride Request";
      case "food":
        return "\u{1F354} New Food Delivery";
      case "parcel":
        return "\u{1F4E6} New Parcel Pickup";
      default:
        return "\u{1F514} New Order Request";
    }
  }
  getNotificationMessage(liveOrder, distance) {
    const distanceStr = `${Math.round(distance * 10) / 10}km away`;
    switch (liveOrder.serviceType) {
      case "taxi":
        return `Pickup nearby - ${distanceStr}`;
      case "food":
        return `Food delivery request - ${distanceStr}`;
      case "parcel":
        return `Parcel pickup request - ${distanceStr}`;
      default:
        return `New service request - ${distanceStr}`;
    }
  }
  async updateDriverConnection(driverId, connectionId, req) {
    try {
      await db3.insert(driverConnections).values({
        driverId,
        connectionId,
        isActive: true,
        userAgent: req.headers["user-agent"] || "",
        ipAddress: req.socket.remoteAddress || ""
      }).onConflictDoUpdate({
        target: driverConnections.connectionId,
        set: {
          isActive: true,
          lastPing: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("Error updating driver connection:", error);
    }
  }
  async updateDriverConnectionStatus(driverId, connectionId, isActive) {
    try {
      await db3.update(driverConnections).set({
        isActive,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverConnections.connectionId, connectionId));
    } catch (error) {
      console.error("Error updating connection status:", error);
    }
  }
  async updateLastPing(connectionId) {
    try {
      await db3.update(driverConnections).set({
        lastPing: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverConnections.connectionId, connectionId));
    } catch (error) {
      console.error("Error updating last ping:", error);
    }
  }
  async updateDriverLocation(driverId, latitude, longitude) {
    try {
      await db3.update(driverProfiles).set({
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString(),
        lastLocationUpdate: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverProfiles.userId, driverId));
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  }
  async updateDriverStatus(driverId, status) {
    try {
      await db3.update(driverProfiles).set({
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(driverProfiles.userId, driverId));
    } catch (error) {
      console.error("Error updating driver status:", error);
    }
  }
  async assignDriverToOrder(orderId, driverId, serviceType) {
    try {
      const storage2 = await Promise.resolve().then(() => (init_storage(), storage_exports));
      switch (serviceType) {
        case "taxi":
          await storage2.storage.updateTaxiBooking(orderId, {
            driverId,
            status: "confirmed"
          });
          break;
        case "food":
          await storage2.storage.updateFoodOrder(orderId, {
            driverId,
            status: "confirmed"
          });
          break;
        case "parcel":
          await storage2.storage.updateParcelDelivery(orderId, {
            driverId,
            status: "confirmed"
          });
          break;
      }
    } catch (error) {
      console.error("Error assigning driver to order:", error);
    }
  }
  async cancelOtherNotifications(orderId, acceptedNotificationId) {
    try {
      await db3.update(driverNotifications).set({
        isRejected: true,
        rejectedAt: /* @__PURE__ */ new Date()
      }).where(
        and3(
          eq3(driverNotifications.orderId, orderId),
          not(eq3(driverNotifications.id, acceptedNotificationId)),
          eq3(driverNotifications.isAccepted, false),
          eq3(driverNotifications.isRejected, false)
        )
      );
    } catch (error) {
      console.error("Error cancelling other notifications:", error);
    }
  }
  /**
   * Get connected driver count
   */
  getConnectedDriverCount() {
    return this.driverConnections.size;
  }
  /**
   * Broadcast message to all connected drivers
   */
  broadcastToAllDrivers(message) {
    const messageStr = JSON.stringify(message);
    this.driverConnections.forEach((ws2, driverId) => {
      if (ws2.readyState === WebSocket.OPEN) {
        ws2.send(messageStr);
      }
    });
  }
  /**
   * Send message to specific driver
   */
  sendToDriver(driverId, message) {
    const ws2 = this.driverConnections.get(driverId);
    if (ws2 && ws2.readyState === WebSocket.OPEN) {
      ws2.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  /**
   * Shutdown the service
   */
  shutdown() {
    if (this.assignmentInterval) {
      clearInterval(this.assignmentInterval);
      this.assignmentInterval = null;
    }
    this.driverConnections.forEach((ws2) => {
      ws2.close();
    });
    this.driverConnections.clear();
    this.connectionIds.clear();
    console.log("\u{1F6D1} Live order service shutdown");
  }
};
var liveOrderService_default = LiveOrderService.getInstance();

// server/routes/rideRoutes.ts
var router = Router();
router.post("/request", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const rideData = insertTaxiBookingSchema.parse(req.body);
    const { fare, distance, duration } = calculateFare(
      parseFloat(rideData.pickupLatitude || "0"),
      parseFloat(rideData.pickupLongitude || "0"),
      parseFloat(rideData.dropoffLatitude || "0"),
      parseFloat(rideData.dropoffLongitude || "0"),
      rideData.vehicleType
    );
    const ride = await storage.createTaxiBooking({
      ...rideData,
      userId
    });
    const updatedRide = await storage.updateTaxiBooking(ride.id, {
      fare: fare.toString(),
      distance: distance.toString(),
      estimatedDuration: duration
    });
    try {
      await liveOrderService_default.createLiveOrder({
        orderId: ride.id,
        serviceType: "taxi",
        customerId: userId,
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
        priority: 1
      });
    } catch (error) {
      console.error("Error creating live order:", error);
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
    if (ride.userId !== userId && ride.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json({ ride });
  } catch (error) {
    console.error("Error getting ride status:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/:id/accept", async (req, res) => {
  try {
    const userId = req.session.userId;
    const rideId = parseInt(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
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
    const updatedRide = await storage.updateTaxiBooking(rideId, {
      driverId: userId,
      status: "confirmed"
    });
    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});
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
      status: "in_progress"
    });
    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error starting ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});
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
    const updatedRide = await storage.updateTaxiBooking(rideId, {
      status: "completed"
    });
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
    if (ride.userId !== userId && ride.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (ride.status === "completed" || ride.status === "cancelled") {
      return res.status(400).json({ message: "Ride cannot be cancelled" });
    }
    const updatedRide = await storage.updateTaxiBooking(rideId, {
      status: "cancelled"
    });
    res.json({ ride: updatedRide });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const rides2 = await storage.getTaxiBookingsByUser(userId);
    res.json({ rides: rides2 });
  } catch (error) {
    console.error("Error getting user rides:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/available", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
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
var rideRoutes_default = router;

// server/routes/foodRoutes.ts
init_storage();
import { Router as Router2 } from "express";
init_schema();
var router2 = Router2();
router2.get("/restaurants", async (req, res) => {
  try {
    const restaurants2 = await storage.getAllRestaurants();
    res.json({ restaurants: restaurants2 });
  } catch (error) {
    console.error("Error getting restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router2.get("/restaurants/:id", async (req, res) => {
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
router2.get("/restaurants/:id/menu", async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await storage.getRestaurant(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const menuItems2 = await storage.getMenuItemsByRestaurant(restaurantId);
    res.json({ restaurant, menuItems: menuItems2 });
  } catch (error) {
    console.error("Error getting restaurant menu:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router2.post("/orders", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { order, items } = req.body;
    const orderData = insertFoodOrderSchema.parse({
      ...order,
      userId
    });
    const validatedItems = items.map(
      (item) => insertOrderItemSchema.parse(item)
    );
    let totalAmount = 0;
    for (const item of validatedItems) {
      const menuItem = await storage.getMenuItem(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItemId} not found` });
      }
      totalAmount += parseFloat(menuItem.price) * item.quantity;
    }
    const createdOrder = await storage.createFoodOrder({
      ...orderData,
      totalAmount: totalAmount.toString()
    });
    const orderItems2 = [];
    for (const item of validatedItems) {
      const menuItem = await storage.getMenuItem(item.menuItemId);
      const orderItem = await storage.createOrderItem({
        ...item,
        orderId: createdOrder.id,
        price: menuItem.price
      });
      orderItems2.push(orderItem);
    }
    try {
      const restaurant = await storage.getRestaurant(createdOrder.restaurantId);
      await liveOrderService_default.createLiveOrder({
        orderId: createdOrder.id,
        serviceType: "food",
        customerId: userId,
        pickupLocation: restaurant?.address || "Restaurant location",
        pickupLatitude: restaurant?.latitude ? parseFloat(restaurant.latitude) : 6.9271,
        pickupLongitude: restaurant?.longitude ? parseFloat(restaurant.longitude) : 79.8612,
        dropoffLocation: orderData.deliveryAddress,
        dropoffLatitude: parseFloat(orderData.deliveryLatitude || "0"),
        dropoffLongitude: parseFloat(orderData.deliveryLongitude || "0"),
        estimatedFare: totalAmount,
        priority: 1
      });
    } catch (error) {
      console.error("Error creating live food order:", error);
    }
    res.json({ order: createdOrder, items: orderItems2 });
  } catch (error) {
    console.error("Error placing food order:", error);
    res.status(400).json({ message: "Invalid order data" });
  }
});
router2.get("/orders", async (req, res) => {
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
router2.get("/orders/:id", async (req, res) => {
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
router2.put("/orders/:id/status", async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "vendor" && user.role !== "driver" && user.role !== "admin") {
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
    const updatedOrder = await storage.updateFoodOrder(orderId, { status });
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
router2.put("/orders/:id/assign-driver", async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = parseInt(req.params.id);
    const { driverId } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "vendor" && user.role !== "admin") {
      return res.status(403).json({ message: "Vendor or admin access required" });
    }
    const order = await storage.getFoodOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const driver = await storage.getUser(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(400).json({ message: "Invalid driver" });
    }
    const updatedOrder = await storage.updateFoodOrder(orderId, {
      driverId,
      status: "ready"
    });
    res.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error assigning driver:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router2.get("/vendor/orders", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Vendor access required" });
    }
    const vendorRestaurants = await storage.getRestaurantsByVendor(userId);
    const restaurantIds = vendorRestaurants.map((r) => r.id);
    const pendingOrders = await storage.getPendingOrdersByRestaurants(restaurantIds);
    res.json({ orders: pendingOrders });
  } catch (error) {
    console.error("Error getting vendor orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router2.get("/driver/deliveries", async (req, res) => {
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
var foodRoutes_default = router2;

// server/routes/parcelRoutes.ts
init_storage();
import { Router as Router3 } from "express";
init_schema();
var router3 = Router3();
router3.post("/", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const parcelData = insertParcelDeliverySchema.parse({
      ...req.body,
      userId
    });
    const { cost, distance } = calculateParcelCost(
      parseFloat(parcelData.senderLatitude || "0"),
      parseFloat(parcelData.senderLongitude || "0"),
      parseFloat(parcelData.recipientLatitude || "0"),
      parseFloat(parcelData.recipientLongitude || "0"),
      parcelData.size
    );
    const parcel = await storage.createParcelDelivery({
      ...parcelData,
      cost: cost.toString()
    });
    try {
      await liveOrderService_default.createLiveOrder({
        orderId: parcel.id,
        serviceType: "parcel",
        customerId: userId,
        pickupLocation: parcelData.senderAddress,
        pickupLatitude: parseFloat(parcelData.senderLatitude || "0"),
        pickupLongitude: parseFloat(parcelData.senderLongitude || "0"),
        dropoffLocation: parcelData.recipientAddress,
        dropoffLatitude: parseFloat(parcelData.recipientLatitude || "0"),
        dropoffLongitude: parseFloat(parcelData.recipientLongitude || "0"),
        estimatedFare: cost,
        estimatedDistance: distance,
        priority: 1
      });
    } catch (error) {
      console.error("Error creating live parcel order:", error);
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
router3.post("/estimate", async (req, res) => {
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
router3.get("/", async (req, res) => {
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
router3.get("/:id/status", async (req, res) => {
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
    if (parcel.userId !== userId && parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json({ parcel });
  } catch (error) {
    console.error("Error getting parcel status:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router3.post("/:id/accept", async (req, res) => {
  try {
    const userId = req.session.userId;
    const parcelId = parseInt(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
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
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      driverId: userId,
      status: "confirmed"
    });
    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error accepting parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router3.post("/:id/pickup", async (req, res) => {
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
      pickupTime: /* @__PURE__ */ new Date()
    });
    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error picking up parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router3.post("/:id/transit", async (req, res) => {
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
      status: "in_transit"
    });
    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error updating parcel to transit:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router3.post("/:id/complete", async (req, res) => {
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
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      status: "delivered",
      deliveryTime: /* @__PURE__ */ new Date(),
      proofOfDeliveryUrl
    });
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
router3.post("/:id/proof", async (req, res) => {
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
      proofOfDeliveryUrl
    });
    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error uploading proof of delivery:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router3.post("/:id/cancel", async (req, res) => {
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
    if (parcel.userId !== userId && parcel.driverId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (parcel.status === "delivered" || parcel.status === "cancelled") {
      return res.status(400).json({ message: "Parcel cannot be cancelled" });
    }
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      status: "cancelled"
    });
    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error cancelling parcel:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router3.get("/available", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
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
router3.post("/:id/cod-collected", async (req, res) => {
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
    const updatedParcel = await storage.updateParcelDelivery(parcelId, {
      codAmount: codAmount || parcel.codAmount
    });
    res.json({ parcel: updatedParcel });
  } catch (error) {
    console.error("Error confirming COD collection:", error);
    res.status(500).json({ message: "Server error" });
  }
});
var parcelRoutes_default = router3;

// server/routes/commissionRoutes.ts
import { Router as Router4 } from "express";

// server/services/commissionService.ts
init_schema();
import { eq as eq4, and as and4, gte, sum, desc, sql as sql5 } from "drizzle-orm";

// server/services/emailService.ts
async function sendEmail(to, subject, message) {
  try {
    console.log("\u{1F4E7} Email sent:", {
      to,
      subject,
      message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// server/services/smsService.ts
async function sendSMS(to, message) {
  try {
    console.log("\u{1F4F1} SMS sent:", {
      to,
      message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

// server/services/commissionService.ts
var COMMISSION_RATE = 8;
var WEEKLY_REMINDER_LIMIT = 4;
var COMMISSION_THRESHOLD = 1e3;
var CommissionService = class {
  /**
   * Calculate and record commission for a completed order
   */
  async calculateCommission(driverId, orderId, orderAmount, serviceType) {
    const commissionAmount = orderAmount * COMMISSION_RATE / 100;
    const [commissionTransaction] = await db3.insert(commissionTransactions).values({
      driverId,
      orderId,
      serviceType,
      orderAmount: orderAmount.toString(),
      commissionAmount: commissionAmount.toString(),
      commissionRate: COMMISSION_RATE.toString(),
      isPaid: false
    }).returning();
    await this.updateDriverCommission(driverId, orderAmount, commissionAmount);
    return commissionTransaction;
  }
  /**
   * Update driver's total earnings and commission owed
   */
  async updateDriverCommission(driverId, orderAmount, commissionAmount) {
    const existingCommission = await db3.select().from(driverCommissions).where(eq4(driverCommissions.driverId, driverId)).limit(1);
    if (existingCommission.length === 0) {
      await db3.insert(driverCommissions).values({
        driverId,
        totalEarnings: orderAmount.toString(),
        commissionOwed: commissionAmount.toString(),
        commissionPaid: "0.00",
        weeklyStartDate: /* @__PURE__ */ new Date()
      });
    } else {
      const current = existingCommission[0];
      const newTotalEarnings = parseFloat(current.totalEarnings) + orderAmount;
      const newCommissionOwed = parseFloat(current.commissionOwed) + commissionAmount;
      await db3.update(driverCommissions).set({
        totalEarnings: newTotalEarnings.toString(),
        commissionOwed: newCommissionOwed.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(driverCommissions.driverId, driverId));
    }
  }
  /**
   * Get driver's commission status
   */
  async getDriverCommissionStatus(driverId) {
    const [commission] = await db3.select().from(driverCommissions).where(eq4(driverCommissions.driverId, driverId)).limit(1);
    if (!commission) {
      return {
        totalEarnings: 0,
        commissionOwed: 0,
        commissionPaid: 0,
        isBlocked: false,
        reminderCount: 0,
        shouldPayCommission: false
      };
    }
    const totalEarnings = parseFloat(commission.totalEarnings);
    const commissionOwed = parseFloat(commission.commissionOwed);
    const commissionPaid = parseFloat(commission.commissionPaid);
    return {
      totalEarnings,
      commissionOwed,
      commissionPaid,
      isBlocked: commission.isBlocked,
      reminderCount: commission.reminderCount,
      shouldPayCommission: commissionOwed >= COMMISSION_THRESHOLD,
      lastReminderSent: commission.lastReminderSent,
      weeklyStartDate: commission.weeklyStartDate
    };
  }
  /**
   * Send weekly reminders to drivers who owe commission
   */
  async sendWeeklyReminders() {
    const now = /* @__PURE__ */ new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const driversToRemind = await db3.select({
      driverId: driverCommissions.driverId,
      totalEarnings: driverCommissions.totalEarnings,
      commissionOwed: driverCommissions.commissionOwed,
      reminderCount: driverCommissions.reminderCount,
      lastReminderSent: driverCommissions.lastReminderSent,
      isBlocked: driverCommissions.isBlocked,
      email: users.email,
      phone: users.phone,
      name: users.name
    }).from(driverCommissions).innerJoin(users, eq4(driverCommissions.driverId, users.id)).where(
      and4(
        gte(driverCommissions.commissionOwed, COMMISSION_THRESHOLD.toString()),
        eq4(driverCommissions.isBlocked, false)
        // Either never sent reminder or sent more than a week ago
        // or(
        //   isNull(driverCommissions.lastReminderSent),
        //   lte(driverCommissions.lastReminderSent, oneWeekAgo)
        // )
      )
    );
    const results = [];
    for (const driver of driversToRemind) {
      const commissionOwed = parseFloat(driver.commissionOwed);
      if (driver.isBlocked || driver.lastReminderSent && driver.lastReminderSent > oneWeekAgo || commissionOwed < COMMISSION_THRESHOLD) {
        continue;
      }
      const newReminderCount = driver.reminderCount + 1;
      const shouldBlock = newReminderCount >= WEEKLY_REMINDER_LIMIT && commissionOwed >= COMMISSION_THRESHOLD;
      try {
        await this.sendCommissionReminder(driver, newReminderCount);
        await db3.update(driverCommissions).set({
          reminderCount: newReminderCount,
          lastReminderSent: now,
          isBlocked: shouldBlock,
          blockedAt: shouldBlock ? now : null,
          updatedAt: now
        }).where(eq4(driverCommissions.driverId, driver.driverId));
        if (shouldBlock) {
          await db3.update(users).set({ isActive: false }).where(eq4(users.id, driver.driverId));
          await this.sendBlockingNotification(driver);
        }
        results.push({
          driverId: driver.driverId,
          name: driver.name,
          remindersSent: newReminderCount,
          blocked: shouldBlock,
          commissionOwed: driver.commissionOwed
        });
      } catch (error) {
        console.error(`Failed to send reminder to driver ${driver.driverId}:`, error);
        results.push({
          driverId: driver.driverId,
          name: driver.name,
          error: "Failed to send reminder",
          blocked: false,
          commissionOwed: driver.commissionOwed
        });
      }
    }
    return results;
  }
  /**
   * Send commission reminder to driver
   */
  async sendCommissionReminder(driver, reminderCount) {
    const commissionOwed = parseFloat(driver.commissionOwed);
    const title = `Commission Payment Reminder - Week ${reminderCount}`;
    const message = `Dear ${driver.name}, you have an outstanding commission of LKR ${commissionOwed.toFixed(2)} to pay. Please settle this amount to continue using our platform. ${reminderCount >= 3 ? "Your account will be blocked if payment is not received within 1 week." : ""}`;
    await db3.insert(driverNotifications).values({
      driverId: driver.driverId,
      type: "commission_reminder",
      title,
      message,
      sentVia: "email,sms,in_app",
      metadata: { reminderCount, commissionOwed: driver.commissionOwed }
    });
    if (driver.email) {
      await sendEmail(driver.email, title, message);
    }
    if (driver.phone) {
      await sendSMS(driver.phone, message);
    }
  }
  /**
   * Send blocking notification to driver
   */
  async sendBlockingNotification(driver) {
    const title = "Account Blocked - Commission Payment Required";
    const message = `Dear ${driver.name}, your account has been blocked due to unpaid commission of LKR ${parseFloat(driver.commissionOwed).toFixed(2)}. Please contact admin to settle payment and reactivate your account.`;
    await db3.insert(driverNotifications).values({
      driverId: driver.driverId,
      type: "account_blocked",
      title,
      message,
      sentVia: "email,sms,in_app",
      metadata: { commissionOwed: driver.commissionOwed, blockedAt: (/* @__PURE__ */ new Date()).toISOString() }
    });
    if (driver.email) {
      await sendEmail(driver.email, title, message);
    }
    if (driver.phone) {
      await sendSMS(driver.phone, message);
    }
  }
  /**
   * Process commission payment and unblock driver
   */
  async processCommissionPayment(driverId, paidAmount, adminId) {
    const [commission] = await db3.select().from(driverCommissions).where(eq4(driverCommissions.driverId, driverId)).limit(1);
    if (!commission) {
      throw new Error("Driver commission record not found");
    }
    const commissionOwed = parseFloat(commission.commissionOwed);
    const commissionPaid = parseFloat(commission.commissionPaid);
    if (paidAmount > commissionOwed) {
      throw new Error("Payment amount exceeds commission owed");
    }
    const newCommissionPaid = commissionPaid + paidAmount;
    const newCommissionOwed = commissionOwed - paidAmount;
    const isFullyPaid = newCommissionOwed <= 0;
    await db3.update(driverCommissions).set({
      commissionPaid: newCommissionPaid.toString(),
      commissionOwed: Math.max(0, newCommissionOwed).toString(),
      isBlocked: false,
      unblockedAt: isFullyPaid ? /* @__PURE__ */ new Date() : null,
      reminderCount: isFullyPaid ? 0 : commission.reminderCount,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(driverCommissions.driverId, driverId));
    if (isFullyPaid) {
      await db3.update(users).set({ isActive: true }).where(eq4(users.id, driverId));
      const [driver] = await db3.select({ name: users.name, email: users.email, phone: users.phone }).from(users).where(eq4(users.id, driverId));
      if (driver) {
        await this.sendUnblockingNotification(driverId, driver, paidAmount);
      }
    }
    await db3.update(commissionTransactions).set({ isPaid: true, paidAt: /* @__PURE__ */ new Date() }).where(
      and4(
        eq4(commissionTransactions.driverId, driverId),
        eq4(commissionTransactions.isPaid, false)
      )
    );
    return {
      driverId,
      paidAmount,
      newCommissionOwed: Math.max(0, newCommissionOwed),
      newCommissionPaid,
      isFullyPaid,
      unblockedAt: isFullyPaid ? /* @__PURE__ */ new Date() : null
    };
  }
  /**
   * Send unblocking notification to driver
   */
  async sendUnblockingNotification(driverId, driver, paidAmount) {
    const title = "Account Reactivated - Commission Payment Received";
    const message = `Dear ${driver.name}, thank you for your commission payment of LKR ${paidAmount.toFixed(2)}. Your account has been reactivated and you can continue using our platform.`;
    await db3.insert(driverNotifications).values({
      driverId,
      type: "account_unblocked",
      title,
      message,
      sentVia: "email,sms,in_app",
      metadata: { paidAmount: paidAmount.toString(), unblockedAt: (/* @__PURE__ */ new Date()).toISOString() }
    });
    if (driver.email) {
      await sendEmail(driver.email, title, message);
    }
    if (driver.phone) {
      await sendSMS(driver.phone, message);
    }
  }
  /**
   * Get all drivers with commission details (for admin dashboard)
   */
  async getAllDriverCommissions() {
    return await db3.select({
      driverId: driverCommissions.driverId,
      driverName: users.name,
      email: users.email,
      phone: users.phone,
      totalEarnings: driverCommissions.totalEarnings,
      commissionOwed: driverCommissions.commissionOwed,
      commissionPaid: driverCommissions.commissionPaid,
      reminderCount: driverCommissions.reminderCount,
      lastReminderSent: driverCommissions.lastReminderSent,
      isBlocked: driverCommissions.isBlocked,
      blockedAt: driverCommissions.blockedAt,
      unblockedAt: driverCommissions.unblockedAt,
      weeklyStartDate: driverCommissions.weeklyStartDate,
      isActive: users.isActive
    }).from(driverCommissions).innerJoin(users, eq4(driverCommissions.driverId, users.id)).orderBy(desc(driverCommissions.commissionOwed));
  }
  /**
   * Get commission transaction history for a driver
   */
  async getDriverCommissionHistory(driverId) {
    return await db3.select().from(commissionTransactions).where(eq4(commissionTransactions.driverId, driverId)).orderBy(desc(commissionTransactions.createdAt));
  }
  /**
   * Get commission statistics for admin dashboard
   */
  async getCommissionStats() {
    try {
      const totalDrivers = await db3.select().from(driverProfiles);
      const activeDriversCount = totalDrivers.filter((d) => !d.isBlocked).length;
      const blockedDriversCount = totalDrivers.filter((d) => d.isBlocked).length;
      const commissionSummary = await db3.select({
        totalOwed: sum(driverCommissions.commissionOwed),
        totalPaid: sum(driverCommissions.commissionPaid)
      }).from(driverCommissions);
      return {
        totalDrivers: totalDrivers.length,
        activeDrivers: activeDriversCount,
        blockedDrivers: blockedDriversCount,
        totalCommissionOwed: `LKR ${commissionSummary[0]?.totalOwed || "0.00"}`,
        totalCommissionPaid: `LKR ${commissionSummary[0]?.totalPaid || "0.00"}`,
        pendingReminders: await this.getPendingRemindersCount(),
        lastProcessedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("Error fetching commission stats:", error);
      throw error;
    }
  }
  /**
   * Get all drivers with commission data
   */
  async getAllDriversCommissions() {
    try {
      const driversWithCommissions = await db3.select({
        driverId: driverCommissions.driverId,
        driverName: users.firstName,
        email: users.email,
        phone: driverProfiles.phoneNumber,
        totalEarnings: driverCommissions.totalEarnings,
        commissionOwed: driverCommissions.commissionOwed,
        commissionPaid: driverCommissions.commissionPaid,
        reminderCount: driverCommissions.reminderCount,
        lastReminderSent: driverCommissions.lastReminderSent,
        isBlocked: driverProfiles.isBlocked,
        weeklyStartDate: driverCommissions.weeklyStartDate,
        isActive: driverProfiles.isActive
      }).from(driverCommissions).leftJoin(driverProfiles, eq4(driverCommissions.driverId, driverProfiles.driverId)).leftJoin(users, eq4(driverProfiles.userId, users.id)).orderBy(desc(driverCommissions.commissionOwed));
      return driversWithCommissions;
    } catch (error) {
      console.error("Error fetching all drivers commissions:", error);
      throw error;
    }
  }
  /**
   * Get driver commission data
   */
  async getDriverCommission(driverId) {
    try {
      const [commission] = await db3.select().from(driverCommissions).where(eq4(driverCommissions.driverId, driverId)).limit(1);
      if (!commission) {
        return {
          driverId,
          totalEarnings: 0,
          commissionOwed: 0,
          commissionPaid: 0,
          reminderCount: 0,
          isBlocked: false,
          shouldPayCommission: false,
          weeklyStartDate: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const totalEarnings = parseFloat(commission.totalEarnings);
      const commissionOwed = parseFloat(commission.commissionOwed);
      const shouldPayCommission = totalEarnings > COMMISSION_THRESHOLD && commissionOwed > 0;
      return {
        driverId,
        totalEarnings,
        commissionOwed,
        commissionPaid: parseFloat(commission.commissionPaid),
        reminderCount: commission.reminderCount,
        isBlocked: commission.isBlocked,
        shouldPayCommission,
        lastReminderSent: commission.lastReminderSent?.toISOString(),
        weeklyStartDate: commission.weeklyStartDate.toISOString()
      };
    } catch (error) {
      console.error("Error fetching driver commission:", error);
      throw error;
    }
  }
  /**
   * Send reminder to specific driver
   */
  async sendReminderToDriver(driverId) {
    try {
      const [driverInfo] = await db3.select({
        name: users.firstName,
        email: users.email,
        phone: driverProfiles.phoneNumber
      }).from(driverProfiles).leftJoin(users, eq4(driverProfiles.userId, users.id)).where(eq4(driverProfiles.driverId, driverId)).limit(1);
      if (!driverInfo) {
        throw new Error(`Driver ${driverId} not found`);
      }
      const smsResult = await sendSMS(driverInfo.phone, "Commission payment reminder: Please pay your outstanding commission to avoid account suspension.");
      const emailResult = await sendEmail(driverInfo.email, "Commission Payment Reminder", "Please pay your outstanding commission amount.");
      await db3.update(driverCommissions).set({
        reminderCount: sql5`${driverCommissions.reminderCount} + 1`,
        lastReminderSent: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(driverCommissions.driverId, driverId));
      return {
        success: true,
        driverId,
        name: driverInfo.name,
        smsResult,
        emailResult,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("Error sending reminder:", error);
      throw error;
    }
  }
  /**
   * Unlock blocked driver
   */
  async unlockDriver(driverId) {
    try {
      await db3.update(driverProfiles).set({
        isBlocked: false,
        blockedAt: null,
        unblockedAt: /* @__PURE__ */ new Date(),
        isActive: true
      }).where(eq4(driverProfiles.driverId, driverId));
      await db3.update(driverCommissions).set({
        reminderCount: 0,
        lastReminderSent: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(driverCommissions.driverId, driverId));
      return {
        success: true,
        driverId,
        unblockedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("Error unlocking driver:", error);
      throw error;
    }
  }
  /**
   * Get payment history for driver
   */
  async getPaymentHistory(driverId) {
    try {
      return [];
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  }
  /**
   * Record commission payment
   */
  async recordPayment(driverId, amount, method) {
    try {
      await db3.update(driverCommissions).set({
        commissionPaid: sql5`${driverCommissions.commissionPaid} + ${amount}`,
        commissionOwed: sql5`${driverCommissions.commissionOwed} - ${amount}`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(driverCommissions.driverId, driverId));
      return {
        id: Date.now(),
        driverId,
        amount,
        method,
        paidAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "completed"
      };
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  }
  async getPendingRemindersCount() {
    try {
      const pending = await db3.select().from(driverCommissions).where(and4(
        eq4(driverCommissions.isBlocked, false),
        gte(driverCommissions.commissionOwed, COMMISSION_THRESHOLD.toString())
      ));
      return pending.length;
    } catch (error) {
      console.error("Error counting pending reminders:", error);
      return 0;
    }
  }
};
var commissionService = new CommissionService();

// server/routes/commissionRoutes.ts
var router4 = Router4();
router4.get("/driver/:driverId", async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const commission = await commissionService.getDriverCommission(driverId);
    res.json(commission);
  } catch (error) {
    console.error("Error fetching driver commission:", error);
    res.status(500).json({
      error: "Failed to fetch driver commission",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.get("/admin/overview", async (req, res) => {
  try {
    const driversWithCommissions = [
      {
        driverId: 1,
        driverName: "Kamal Silva",
        email: "kamal@runpick.com",
        phone: "+94771234567",
        totalEarnings: "LKR 15,430",
        commissionOwed: "LKR 1,234.40",
        // Above LKR 1000 threshold - triggers reminders
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 2,
        // Getting reminders because commission owed >= LKR 1000
        lastReminderSent: "2025-08-10",
        isBlocked: false,
        weeklyStartDate: "2025-08-05",
        isActive: true,
        servicesUsed: ["Taxi", "Food Delivery"],
        status: "Commission Due - Above Threshold"
      },
      {
        driverId: 2,
        driverName: "Nimal Perera",
        email: "nimal@runpick.com",
        phone: "+94777654321",
        totalEarnings: "LKR 8,750",
        commissionOwed: "LKR 620.00",
        // Below LKR 1000 threshold - NO reminders sent
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 0,
        // No reminders because commission < LKR 1000
        lastReminderSent: null,
        isBlocked: false,
        weeklyStartDate: "2025-08-05",
        isActive: true,
        servicesUsed: ["Taxi", "Parcel"],
        status: "Below Threshold - Can Pay Voluntarily"
      },
      {
        driverId: 3,
        driverName: "Sunil Fernando",
        email: "sunil@runpick.com",
        phone: "+94763456789",
        totalEarnings: "LKR 22,100",
        commissionOwed: "LKR 1,688.00",
        // Above LKR 1000 threshold - BLOCKED after 4 reminders
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 4,
        // BLOCKED because commission >= LKR 1000 AND 4 reminders sent
        lastReminderSent: "2025-08-15",
        isBlocked: true,
        blockedAt: "2025-08-16",
        weeklyStartDate: "2025-07-22",
        isActive: false,
        servicesUsed: ["Taxi", "Food Delivery", "Parcel"],
        status: "BLOCKED - Commission Unpaid"
      },
      {
        driverId: 4,
        driverName: "Priya Jayawardena",
        email: "priya@runpick.com",
        phone: "+94719876543",
        totalEarnings: "LKR 12,890",
        commissionOwed: "LKR 951.20",
        // Below LKR 1000 threshold - NO reminders sent
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 0,
        // No reminders because commission < LKR 1000
        lastReminderSent: null,
        isBlocked: false,
        weeklyStartDate: "2025-08-12",
        isActive: true,
        servicesUsed: ["Food Delivery", "Supermarket"],
        status: "Below Threshold - Can Pay Voluntarily"
      },
      {
        driverId: 5,
        driverName: "Rohan Mendis",
        email: "rohan@runpick.com",
        phone: "+94702345678",
        totalEarnings: "LKR 950",
        commissionOwed: "LKR 0.00",
        // Below LKR 1000 earnings - no commission
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 0,
        lastReminderSent: null,
        isBlocked: false,
        weeklyStartDate: "2025-08-14",
        isActive: true,
        servicesUsed: ["Taxi"],
        status: "Below Minimum Earnings - No Commission"
      },
      {
        driverId: 6,
        driverName: "Saman Bandara",
        email: "saman@runpick.com",
        phone: "+94771234572",
        totalEarnings: "LKR 18,500",
        commissionOwed: "LKR 1,400.00",
        // Above LKR 1000 threshold - triggers reminders
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 3,
        // Getting reminders because commission owed >= LKR 1000
        lastReminderSent: "2025-08-16",
        isBlocked: false,
        weeklyStartDate: "2025-07-21",
        isActive: true,
        servicesUsed: ["Taxi", "Food", "Parcel"],
        status: "Commission Due - Critical (3/4 Reminders)"
      }
    ];
    res.json(driversWithCommissions);
  } catch (error) {
    console.error("Error fetching commission overview:", error);
    res.status(500).json({
      error: "Failed to fetch commission overview",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.post("/admin/unlock/:driverId", async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const result = await commissionService.unlockDriver(driverId);
    res.json({
      success: true,
      message: `Driver ${driverId} has been unlocked`,
      result
    });
  } catch (error) {
    console.error("Error unlocking driver:", error);
    res.status(500).json({
      error: "Failed to unlock driver",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.post("/admin/send-reminder/:driverId", async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const result = await commissionService.sendReminderToDriver(driverId);
    res.json({
      success: true,
      message: `Reminder sent to driver ${driverId}`,
      result
    });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({
      error: "Failed to send reminder",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.post("/calculate", async (req, res) => {
  try {
    const { driverId, amount } = req.body;
    if (!driverId || !amount) {
      return res.status(400).json({
        error: "Missing required fields: driverId and amount"
      });
    }
    const commission = await commissionService.calculateCommission(driverId, amount);
    res.json(commission);
  } catch (error) {
    console.error("Error calculating commission:", error);
    res.status(500).json({
      error: "Failed to calculate commission",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.get("/payments/:driverId", async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const payments = await commissionService.getPaymentHistory(driverId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      error: "Failed to fetch payment history",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.post("/payments", async (req, res) => {
  try {
    const { driverId, amount, paymentMethod } = req.body;
    if (!driverId || !amount || !paymentMethod) {
      return res.status(400).json({
        error: "Missing required fields: driverId, amount, and paymentMethod"
      });
    }
    const payment = await commissionService.recordPayment(driverId, amount, paymentMethod);
    res.json({
      success: true,
      message: "Payment recorded successfully",
      payment
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({
      error: "Failed to record payment",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.get("/admin/stats", async (req, res) => {
  try {
    const stats = await commissionService.getCommissionStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching commission stats:", error);
    res.status(500).json({
      error: "Failed to fetch commission statistics",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var commissionRoutes_default = router4;

// server/routes/recommendationRoutes.ts
import { Router as Router5 } from "express";

// server/services/locationRecommendationService.ts
init_schema();
import { eq as eq5, and as and5, gte as gte2 } from "drizzle-orm";
var LocationRecommendationService = class {
  /**
   * Generate comprehensive location-based service recommendations
   */
  async generateRecommendations(userLatitude, userLongitude, userId) {
    try {
      const results = [];
      const taxiRecommendations = await this.getTaxiRecommendations(userLatitude, userLongitude);
      if (taxiRecommendations.recommendations.length > 0) {
        results.push(taxiRecommendations);
      }
      const foodRecommendations = await this.getFoodRecommendations(userLatitude, userLongitude);
      if (foodRecommendations.recommendations.length > 0) {
        results.push(foodRecommendations);
      }
      const parcelRecommendations = await this.getParcelRecommendations(userLatitude, userLongitude);
      if (parcelRecommendations.recommendations.length > 0) {
        results.push(parcelRecommendations);
      }
      if (userId) {
        await this.storeRecommendations(userId, userLatitude, userLongitude, results);
      }
      return results;
    } catch (error) {
      console.error("Error generating location recommendations:", error);
      return [];
    }
  }
  /**
   * Get taxi service recommendations based on nearby drivers
   */
  async getTaxiRecommendations(userLatitude, userLongitude) {
    const nearbyDrivers = await db3.select({
      id: driverProfiles.id,
      userId: driverProfiles.userId,
      vehicleType: driverProfiles.vehicleType,
      vehicleModel: driverProfiles.vehicleModel,
      vehicleColor: driverProfiles.vehicleColor,
      rating: driverProfiles.rating,
      currentLatitude: driverProfiles.currentLatitude,
      currentLongitude: driverProfiles.currentLongitude,
      status: driverProfiles.status,
      isAvailable: driverProfiles.isAvailable
    }).from(driverProfiles).where(
      and5(
        eq5(driverProfiles.isAvailable, true),
        eq5(driverProfiles.status, "online")
      )
    ).limit(20);
    const recommendations = nearbyDrivers.map((driver) => {
      if (!driver.currentLatitude || !driver.currentLongitude) return null;
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        parseFloat(driver.currentLatitude),
        parseFloat(driver.currentLongitude)
      );
      return {
        id: driver.id,
        name: `${driver.vehicleType} - ${driver.vehicleModel || "Available"}`,
        type: "taxi",
        distance,
        rating: parseFloat(driver.rating || "0"),
        estimatedTime: Math.round(distance * 3),
        // 3 minutes per km
        metadata: {
          driverId: driver.userId,
          vehicleType: driver.vehicleType,
          vehicleModel: driver.vehicleModel,
          vehicleColor: driver.vehicleColor,
          coordinates: {
            lat: parseFloat(driver.currentLatitude),
            lng: parseFloat(driver.currentLongitude)
          }
        }
      };
    }).filter(Boolean).filter((rec) => rec.distance <= 15).sort((a, b) => a.distance - b.distance).slice(0, 5);
    const avgDistance = recommendations.length > 0 ? recommendations.reduce((sum2, rec) => sum2 + rec.distance, 0) / recommendations.length : 0;
    const confidence = this.calculateConfidence(recommendations.length, avgDistance, "taxi");
    return {
      serviceType: "taxi",
      recommendations,
      confidence,
      distance: avgDistance
    };
  }
  /**
   * Get food delivery recommendations based on nearby restaurants
   */
  async getFoodRecommendations(userLatitude, userLongitude) {
    const nearbyRestaurants = await db3.select({
      id: restaurants.id,
      name: restaurants.name,
      description: restaurants.description,
      address: restaurants.address,
      latitude: restaurants.latitude,
      longitude: restaurants.longitude,
      cuisine: restaurants.cuisine,
      rating: restaurants.rating,
      deliveryTime: restaurants.deliveryTime,
      isActive: restaurants.isActive
    }).from(restaurants).where(eq5(restaurants.isActive, true)).limit(50);
    const recommendations = nearbyRestaurants.map((restaurant) => {
      if (!restaurant.latitude || !restaurant.longitude) return null;
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        parseFloat(restaurant.latitude),
        parseFloat(restaurant.longitude)
      );
      return {
        id: restaurant.id,
        name: restaurant.name,
        type: "restaurant",
        distance,
        rating: parseFloat(restaurant.rating || "0"),
        estimatedTime: (restaurant.deliveryTime || 30) + Math.round(distance * 2),
        // Delivery time + travel
        metadata: {
          cuisine: restaurant.cuisine,
          address: restaurant.address,
          description: restaurant.description,
          baseDeliveryTime: restaurant.deliveryTime,
          coordinates: {
            lat: parseFloat(restaurant.latitude),
            lng: parseFloat(restaurant.longitude)
          }
        }
      };
    }).filter(Boolean).filter((rec) => rec.distance <= 10).sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      return ratingDiff !== 0 ? ratingDiff : a.distance - b.distance;
    }).slice(0, 8);
    const avgDistance = recommendations.length > 0 ? recommendations.reduce((sum2, rec) => sum2 + rec.distance, 0) / recommendations.length : 0;
    const confidence = this.calculateConfidence(recommendations.length, avgDistance, "food");
    return {
      serviceType: "food",
      recommendations,
      confidence,
      distance: avgDistance
    };
  }
  /**
   * Get parcel delivery recommendations based on available drivers
   */
  async getParcelRecommendations(userLatitude, userLongitude) {
    const parcelDrivers = await db3.select({
      id: driverProfiles.id,
      userId: driverProfiles.userId,
      vehicleType: driverProfiles.vehicleType,
      vehicleModel: driverProfiles.vehicleModel,
      rating: driverProfiles.rating,
      currentLatitude: driverProfiles.currentLatitude,
      currentLongitude: driverProfiles.currentLongitude,
      status: driverProfiles.status,
      isAvailable: driverProfiles.isAvailable
    }).from(driverProfiles).where(
      and5(
        eq5(driverProfiles.isAvailable, true),
        eq5(driverProfiles.status, "online")
      )
    ).limit(15);
    const recommendations = parcelDrivers.map((driver) => {
      if (!driver.currentLatitude || !driver.currentLongitude) return null;
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        parseFloat(driver.currentLatitude),
        parseFloat(driver.currentLongitude)
      );
      const capacity = this.getVehicleCapacity(driver.vehicleType);
      return {
        id: driver.id,
        name: `${driver.vehicleType} - ${capacity} capacity`,
        type: "parcel",
        distance,
        rating: parseFloat(driver.rating || "0"),
        estimatedTime: Math.round(distance * 2.5),
        // Slightly faster than taxi
        metadata: {
          driverId: driver.userId,
          vehicleType: driver.vehicleType,
          vehicleModel: driver.vehicleModel,
          capacity,
          coordinates: {
            lat: parseFloat(driver.currentLatitude),
            lng: parseFloat(driver.currentLongitude)
          }
        }
      };
    }).filter(Boolean).filter((rec) => rec.distance <= 20).sort((a, b) => a.distance - b.distance).slice(0, 6);
    const avgDistance = recommendations.length > 0 ? recommendations.reduce((sum2, rec) => sum2 + rec.distance, 0) / recommendations.length : 0;
    const confidence = this.calculateConfidence(recommendations.length, avgDistance, "parcel");
    return {
      serviceType: "parcel",
      recommendations,
      confidence,
      distance: avgDistance
    };
  }
  /**
   * Calculate confidence score based on availability and distance
   */
  calculateConfidence(count, avgDistance, serviceType) {
    let confidence = 0;
    if (count >= 5) confidence += 0.4;
    else if (count >= 3) confidence += 0.3;
    else if (count >= 1) confidence += 0.2;
    const distanceThresholds = {
      taxi: 10,
      food: 5,
      parcel: 15
    };
    const threshold = distanceThresholds[serviceType];
    if (avgDistance <= threshold * 0.5) confidence += 0.4;
    else if (avgDistance <= threshold * 0.75) confidence += 0.3;
    else if (avgDistance <= threshold) confidence += 0.2;
    confidence += 0.2;
    return Math.min(confidence, 1);
  }
  /**
   * Get vehicle capacity description
   */
  getVehicleCapacity(vehicleType) {
    const capacities = {
      "bike": "Small packages",
      "tuk_tuk": "Medium packages",
      "car": "Large packages",
      "van": "Bulk delivery",
      "truck": "Commercial delivery"
    };
    return capacities[vehicleType] || "Standard";
  }
  /**
   * Store recommendations for analytics and caching
   */
  async storeRecommendations(userId, userLatitude, userLongitude, recommendations) {
    try {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1e3);
      for (const rec of recommendations) {
        await db3.insert(locationRecommendations).values({
          userId,
          userLatitude: userLatitude.toString(),
          userLongitude: userLongitude.toString(),
          serviceType: rec.serviceType,
          recommendedServices: rec.recommendations,
          distanceKm: rec.distance.toString(),
          confidence: rec.confidence.toString(),
          expiresAt
        });
      }
    } catch (error) {
      console.error("Error storing recommendations:", error);
    }
  }
  /**
   * Get cached recommendations if available and not expired
   */
  async getCachedRecommendations(userId, userLatitude, userLongitude, maxAgeMinutes = 30) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1e3);
    try {
      return await db3.select().from(locationRecommendations).where(
        and5(
          eq5(locationRecommendations.userId, userId),
          gte2(locationRecommendations.createdAt, cutoff),
          gte2(locationRecommendations.expiresAt, /* @__PURE__ */ new Date())
        )
      ).orderBy(locationRecommendations.createdAt);
    } catch (error) {
      console.error("Error getting cached recommendations:", error);
      return [];
    }
  }
  /**
   * Mark recommendations as viewed for analytics
   */
  async markRecommendationsViewed(recommendationIds) {
    try {
      for (const id of recommendationIds) {
        await db3.update(locationRecommendations).set({ isViewed: true }).where(eq5(locationRecommendations.id, id));
      }
    } catch (error) {
      console.error("Error marking recommendations as viewed:", error);
    }
  }
};
var locationRecommendationService = new LocationRecommendationService();

// server/routes/recommendationRoutes.ts
import { z } from "zod";
var router5 = Router5();
var locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  userId: z.number().optional()
});
var markViewedSchema = z.object({
  recommendationIds: z.array(z.number())
});
router5.get("/location", async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.query;
    const validatedData = locationSchema.parse({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      userId: userId ? parseInt(userId) : void 0
    });
    let recommendations;
    if (validatedData.userId) {
      const cached = await locationRecommendationService.getCachedRecommendations(
        validatedData.userId,
        validatedData.latitude,
        validatedData.longitude,
        15
        // 15 minutes cache
      );
      if (cached.length > 0) {
        recommendations = cached.map((rec) => ({
          id: rec.id,
          serviceType: rec.serviceType,
          recommendations: rec.recommendedServices,
          confidence: parseFloat(rec.confidence || "0"),
          distance: parseFloat(rec.distanceKm || "0"),
          cached: true,
          createdAt: rec.createdAt
        }));
        return res.json({
          success: true,
          recommendations,
          cached: true,
          location: {
            latitude: validatedData.latitude,
            longitude: validatedData.longitude
          }
        });
      }
    }
    recommendations = await locationRecommendationService.generateRecommendations(
      validatedData.latitude,
      validatedData.longitude,
      validatedData.userId
    );
    res.json({
      success: true,
      recommendations,
      cached: false,
      location: {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude
      },
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error getting location recommendations:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input parameters",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to get location recommendations",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router5.post("/mark-viewed", async (req, res) => {
  try {
    const validatedData = markViewedSchema.parse(req.body);
    await locationRecommendationService.markRecommendationsViewed(
      validatedData.recommendationIds
    );
    res.json({
      success: true,
      message: "Recommendations marked as viewed",
      markedCount: validatedData.recommendationIds.length
    });
  } catch (error) {
    console.error("Error marking recommendations as viewed:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input parameters",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to mark recommendations as viewed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router5.get("/demo", async (req, res) => {
  try {
    const demoLocation = {
      latitude: 6.9271,
      longitude: 79.8612
    };
    const recommendations = await locationRecommendationService.generateRecommendations(
      demoLocation.latitude,
      demoLocation.longitude
    );
    res.json({
      success: true,
      recommendations,
      demo: true,
      location: {
        ...demoLocation,
        name: "Colombo, Sri Lanka (Demo)"
      },
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error getting demo recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get demo recommendations",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var recommendationRoutes_default = router5;

// server/routes/searchRoutes.ts
import { Router as Router6 } from "express";
init_schema();
import { like, or } from "drizzle-orm";
var router6 = Router6();
router6.get("/", async (req, res) => {
  try {
    const { q, location, filter } = req.query;
    if (!q || typeof q !== "string" || q.length < 2) {
      return res.json([]);
    }
    const searchQuery = q.toLowerCase();
    const results = [];
    if (!filter || filter === "food") {
      try {
        const restaurantResults = await db3.select().from(restaurants).where(
          or(
            like(restaurants.name, `%${searchQuery}%`),
            like(restaurants.description, `%${searchQuery}%`),
            like(restaurants.cuisine, `%${searchQuery}%`)
          )
        ).limit(5);
        restaurantResults.forEach((restaurant) => {
          results.push({
            id: `restaurant-${restaurant.id}`,
            type: "restaurant",
            title: restaurant.name,
            subtitle: restaurant.cuisine || "Restaurant",
            description: restaurant.description,
            distance: restaurant.latitude && restaurant.longitude ? Math.random() * 10 + 1 : void 0,
            // Mock distance calculation
            rating: restaurant.rating ? parseFloat(restaurant.rating) : void 0,
            estimatedTime: restaurant.deliveryTime || Math.floor(Math.random() * 30 + 15),
            price: "LKR 500-1500",
            tags: [restaurant.cuisine].filter(Boolean),
            metadata: {
              restaurantId: restaurant.id,
              cuisine: restaurant.cuisine,
              address: restaurant.address
            }
          });
        });
      } catch (error) {
        console.error("Error searching restaurants:", error);
      }
    }
    if (!filter || filter === "taxi") {
      const taxiResults = [
        {
          id: "taxi-1",
          type: "taxi",
          title: "Nearby Taxi",
          subtitle: "3 min away",
          description: "Blue Toyota Prius - Kasun",
          distance: 0.8,
          rating: 4.8,
          estimatedTime: 3,
          price: "LKR 120/km",
          tags: ["Available Now", "AC"],
          metadata: { vehicleType: "car", driverId: 1 }
        },
        {
          id: "taxi-2",
          type: "taxi",
          title: "Tuk-Tuk Ride",
          subtitle: "5 min away",
          description: "Three-wheeler - Ravi",
          distance: 1.2,
          rating: 4.5,
          estimatedTime: 5,
          price: "LKR 80/km",
          tags: ["Economy", "Quick"],
          metadata: { vehicleType: "tuktuk", driverId: 2 }
        }
      ].filter(
        (result) => result.title.toLowerCase().includes(searchQuery) || result.description.toLowerCase().includes(searchQuery) || result.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
      );
      results.push(...taxiResults);
    }
    if (!filter || filter === "parcel") {
      const parcelResults = [
        {
          id: "parcel-1",
          type: "driver",
          title: "Parcel Delivery",
          subtitle: "Available for pickup",
          description: "Van available for large packages",
          distance: 1.5,
          rating: 4.6,
          estimatedTime: 5,
          price: "From LKR 200",
          tags: ["Large Capacity"],
          metadata: { vehicleType: "van", service: "parcel" }
        }
      ].filter(
        (result) => result.title.toLowerCase().includes(searchQuery) || result.description.toLowerCase().includes(searchQuery) || result.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
      );
      results.push(...parcelResults);
    }
    results.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase().includes(searchQuery) ? 1 : 0;
      const bExactMatch = b.title.toLowerCase().includes(searchQuery) ? 1 : 0;
      if (aExactMatch !== bExactMatch) {
        return bExactMatch - aExactMatch;
      }
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return 0;
    });
    res.json(results.slice(0, 10));
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});
router6.get("/trending", async (req, res) => {
  try {
    const trending = [
      "Taxi to airport",
      "Pizza delivery",
      "Parcel to Kandy",
      "Kottu near me",
      "Chinese food",
      "Tuk-tuk ride",
      "Package delivery",
      "Seafood restaurant"
    ];
    res.json(trending);
  } catch (error) {
    console.error("Error fetching trending searches:", error);
    res.status(500).json({ error: "Failed to fetch trending searches" });
  }
});
var searchRoutes_default = router6;

// server/routes/authRoutes.ts
init_storage();
init_schema();
import { Router as Router7 } from "express";
import bcrypt from "bcrypt";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
import { z as z2 } from "zod";
var router7 = Router7();
var loginSchema = z2.object({
  email: z2.string().email("Invalid email format"),
  password: z2.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = createInsertSchema2(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true
}).extend({
  password: z2.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z2.string(),
  adminSecret: z2.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => {
  if (data.role === "admin") {
    return data.adminSecret === "2025_RUNPICK_ADMIN";
  }
  return true;
}, {
  message: "Invalid admin secret code",
  path: ["adminSecret"]
});
var forgotPasswordSchema = z2.object({
  email: z2.string().email("Invalid email format")
});
var resetPasswordSchema = z2.object({
  token: z2.string().min(1, "Reset token is required"),
  password: z2.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z2.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
router7.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    req.session.userId = user.id;
    req.session.userRole = user.role;
    console.log("Login successful - Setting session:", user.id, user.role);
    console.log("Session ID:", req.sessionID);
    console.log("Session after setting:", req.session);
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save error:", saveErr);
        return res.status(500).json({ message: "Session save error" });
      }
      console.log("\u2705 Session saved successfully:", {
        userId: req.session.userId,
        userRole: req.session.userRole,
        sessionId: req.sessionID
      });
      const { password: _, ...userWithoutPassword2 } = user;
      res.json({
        user: userWithoutPassword2,
        message: "Login successful",
        sessionId: req.sessionID
        // Include session ID for debugging
      });
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router7.post("/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { confirmPassword, adminSecret, ...userData } = validatedData;
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || "customer"
    });
    req.session.userId = newUser.id;
    req.session.userRole = newUser.role;
    console.log("Registration successful - Setting session:", newUser.id, newUser.role);
    console.log("Session ID:", req.sessionID);
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save error:", saveErr);
        return res.status(500).json({ message: "Session save error" });
      }
      console.log("\u2705 Registration session saved successfully:", {
        userId: req.session.userId,
        userRole: req.session.userRole,
        sessionId: req.sessionID
      });
      const { password: _, ...userWithoutPassword2 } = newUser;
      res.json({
        user: userWithoutPassword2,
        message: "Registration successful",
        sessionId: req.sessionID
        // Include session ID for debugging
      });
    });
    res.status(201).json({
      user: userWithoutPassword,
      message: "Registration successful"
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router7.post("/forgot-password", async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetExpires = new Date(Date.now() + 36e5);
    await storage.createPasswordReset({
      userId: user.id,
      token: resetToken,
      expiresAt: resetExpires
    });
    console.log(`Password reset token for ${email}: ${resetToken}`);
    res.json({
      message: "If the email exists, a reset link has been sent",
      // In development, return token for testing
      ...process.env.NODE_ENV === "development" && { resetToken }
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router7.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const resetRecord = await storage.getPasswordResetByToken(token);
    if (!resetRecord || resetRecord.expiresAt < /* @__PURE__ */ new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await storage.updateUserPassword(resetRecord.userId, hashedPassword);
    await storage.deletePasswordReset(resetRecord.id);
    res.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router7.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("runpick.sid");
    res.json({ message: "Logout successful" });
  });
});
router7.get("/user", async (req, res) => {
  try {
    console.log("Full session object:", req.session);
    console.log("Session check - userId:", req.session.userId, "userRole:", req.session.userRole);
    console.log("Session ID:", req.sessionID);
    if (!req.session.userId) {
      console.log("No session userId found");
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      console.log("User not found with ID:", req.session.userId);
      return res.status(401).json({ message: "User not found" });
    }
    console.log("User found:", user.username, "role:", user.role);
    const { password: _, ...userWithoutPassword2 } = user;
    res.json(userWithoutPassword2);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
var authRoutes_default = router7;

// server/routes/achievementRoutes.ts
import { Router as Router8 } from "express";
import { z as z3 } from "zod";

// server/services/achievementService.ts
init_schema();
import { eq as eq7, and as and7, sql as sql8, desc as desc3 } from "drizzle-orm";
var AchievementService = class {
  // Initialize user stats when they first register
  async initializeUserStats(userId) {
    const existingStats = await db3.select().from(userStats).where(eq7(userStats.userId, userId)).limit(1);
    if (existingStats.length > 0) {
      return existingStats[0];
    }
    const [newStats] = await db3.insert(userStats).values({
      userId,
      totalPoints: 0,
      currentLevel: 1,
      totalRides: 0,
      totalFoodOrders: 0,
      totalParcels: 0,
      totalEarnings: 0,
      perfectRatingCount: 0,
      streakDays: 0,
      longestStreak: 0
    }).returning();
    await this.initializeUserAchievements(userId);
    return newStats;
  }
  // Initialize all achievements for a user
  async initializeUserAchievements(userId) {
    const allAchievements = await db3.select().from(achievements).where(eq7(achievements.isActive, true));
    const userAchievementData = allAchievements.map((achievement) => {
      const requirement = achievement.requirement;
      return {
        userId,
        achievementId: achievement.id,
        progress: 0,
        maxProgress: requirement.target || 1,
        isCompleted: false,
        pointsEarned: 0
      };
    });
    if (userAchievementData.length > 0) {
      await db3.insert(userAchievements).values(userAchievementData).onConflictDoNothing();
    }
  }
  // Update user stats and check for achievements
  async updateUserStats(userId, updates) {
    const currentStats = await this.getUserStats(userId);
    const updatedStats = {
      ...currentStats,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const newLevel = this.calculateLevel(updatedStats.totalPoints);
    updatedStats.currentLevel = newLevel;
    await db3.update(userStats).set(updatedStats).where(eq7(userStats.userId, userId));
    await this.checkAchievementProgress(userId, updatedStats);
  }
  // Calculate user level based on points
  calculateLevel(totalPoints) {
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }
  // Check and update achievement progress
  async checkAchievementProgress(userId, currentStats) {
    const unlockedAchievements = [];
    const userActiveAchievements = await db3.select({
      userAchievement: userAchievements,
      achievement: achievements
    }).from(userAchievements).innerJoin(achievements, eq7(userAchievements.achievementId, achievements.id)).where(
      and7(
        eq7(userAchievements.userId, userId),
        eq7(userAchievements.isCompleted, false),
        eq7(achievements.isActive, true)
      )
    );
    for (const { userAchievement, achievement } of userActiveAchievements) {
      const requirement = achievement.requirement;
      let newProgress = 0;
      switch (requirement.type) {
        case "ride_count":
          newProgress = Math.min(currentStats.totalRides, requirement.target);
          break;
        case "food_order_count":
          newProgress = Math.min(currentStats.totalFoodOrders, requirement.target);
          break;
        case "parcel_count":
          newProgress = Math.min(currentStats.totalParcels, requirement.target);
          break;
        case "total_points":
          newProgress = Math.min(currentStats.totalPoints, requirement.target);
          break;
        case "perfect_ratings":
          newProgress = Math.min(currentStats.perfectRatingCount, requirement.target);
          break;
        case "streak_days":
          newProgress = Math.min(currentStats.streakDays, requirement.target);
          break;
        case "level_reached":
          newProgress = Math.min(currentStats.currentLevel, requirement.target);
          break;
        case "earnings_amount":
          newProgress = Math.min(currentStats.totalEarnings, requirement.target);
          break;
        default:
          continue;
      }
      if (newProgress !== userAchievement.progress) {
        const isNowCompleted = newProgress >= requirement.target;
        const pointsToAward = isNowCompleted && !userAchievement.isCompleted ? achievement.points : 0;
        const [updatedUserAchievement] = await db3.update(userAchievements).set({
          progress: newProgress,
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? /* @__PURE__ */ new Date() : userAchievement.completedAt,
          pointsEarned: userAchievement.pointsEarned + pointsToAward,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq7(userAchievements.id, userAchievement.id)).returning();
        if (isNowCompleted && !userAchievement.isCompleted) {
          await this.awardPoints(userId, pointsToAward);
          unlockedAchievements.push(updatedUserAchievement);
        }
      }
    }
    return unlockedAchievements;
  }
  // Award points to user
  async awardPoints(userId, points) {
    await db3.update(userStats).set({
      totalPoints: sql8`${userStats.totalPoints} + ${points}`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(userStats.userId, userId));
  }
  // Get user stats
  async getUserStats(userId) {
    const [stats] = await db3.select().from(userStats).where(eq7(userStats.userId, userId)).limit(1);
    if (!stats) {
      return await this.initializeUserStats(userId);
    }
    return stats;
  }
  // Get user achievements with progress
  async getUserAchievements(userId) {
    return await db3.select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      achievementId: userAchievements.achievementId,
      progress: userAchievements.progress,
      maxProgress: userAchievements.maxProgress,
      isCompleted: userAchievements.isCompleted,
      completedAt: userAchievements.completedAt,
      pointsEarned: userAchievements.pointsEarned,
      createdAt: userAchievements.createdAt,
      updatedAt: userAchievements.updatedAt,
      achievement: achievements
    }).from(userAchievements).innerJoin(achievements, eq7(userAchievements.achievementId, achievements.id)).where(eq7(userAchievements.userId, userId)).orderBy(desc3(userAchievements.isCompleted), desc3(userAchievements.progress));
  }
  // Get recent achievements (completed)
  async getRecentAchievements(userId, limit = 5) {
    return await db3.select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      achievementId: userAchievements.achievementId,
      progress: userAchievements.progress,
      maxProgress: userAchievements.maxProgress,
      isCompleted: userAchievements.isCompleted,
      completedAt: userAchievements.completedAt,
      pointsEarned: userAchievements.pointsEarned,
      createdAt: userAchievements.createdAt,
      updatedAt: userAchievements.updatedAt,
      achievement: achievements
    }).from(userAchievements).innerJoin(achievements, eq7(userAchievements.achievementId, achievements.id)).where(
      and7(
        eq7(userAchievements.userId, userId),
        eq7(userAchievements.isCompleted, true)
      )
    ).orderBy(desc3(userAchievements.completedAt)).limit(limit);
  }
  // Increment specific stats (called when user completes actions)
  async incrementRideCount(userId) {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalRides: stats.totalRides + 1
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalRides: stats.totalRides + 1 });
  }
  async incrementFoodOrderCount(userId) {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalFoodOrders: stats.totalFoodOrders + 1
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalFoodOrders: stats.totalFoodOrders + 1 });
  }
  async incrementParcelCount(userId) {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalParcels: stats.totalParcels + 1
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalParcels: stats.totalParcels + 1 });
  }
  async addEarnings(userId, amount) {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalEarnings: stats.totalEarnings + amount
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalEarnings: stats.totalEarnings + amount });
  }
  async incrementPerfectRating(userId) {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      perfectRatingCount: stats.perfectRatingCount + 1
    });
    return await this.checkAchievementProgress(userId, { ...stats, perfectRatingCount: stats.perfectRatingCount + 1 });
  }
  // Get leaderboard
  async getLeaderboard(limit = 10) {
    return await db3.select({
      id: userStats.id,
      userId: userStats.userId,
      totalPoints: userStats.totalPoints,
      currentLevel: userStats.currentLevel,
      totalRides: userStats.totalRides,
      totalFoodOrders: userStats.totalFoodOrders,
      totalParcels: userStats.totalParcels,
      totalEarnings: userStats.totalEarnings,
      perfectRatingCount: userStats.perfectRatingCount,
      streakDays: userStats.streakDays,
      longestStreak: userStats.longestStreak,
      createdAt: userStats.createdAt,
      updatedAt: userStats.updatedAt,
      user: {
        username: users.username,
        role: users.role
      }
    }).from(userStats).innerJoin(users, eq7(userStats.userId, users.id)).orderBy(desc3(userStats.totalPoints), desc3(userStats.currentLevel)).limit(limit);
  }
};
var achievementService = new AchievementService();

// server/seedData/achievementSeeds.ts
init_schema();
async function seedAchievements() {
  try {
    console.log("\u{1F3C6} Seeding achievement system...");
    const existingAchievements = await db3.select().from(achievements).limit(1);
    if (existingAchievements.length > 0) {
      console.log("\u2705 Achievements already seeded");
      return;
    }
    const categories = await db3.insert(achievementCategories).values([
      {
        name: "Transportation",
        description: "Achievements related to taxi rides and transportation",
        iconColor: "#3B82F6"
      },
      {
        name: "Food Delivery",
        description: "Achievements related to food orders and delivery",
        iconColor: "#F59E0B"
      },
      {
        name: "Parcel Service",
        description: "Achievements related to parcel delivery",
        iconColor: "#10B981"
      },
      {
        name: "Social & Community",
        description: "Achievements related to social interactions and community",
        iconColor: "#8B5CF6"
      },
      {
        name: "Milestones",
        description: "Major milestone achievements",
        iconColor: "#EF4444"
      },
      {
        name: "Excellence",
        description: "Achievements for exceptional performance",
        iconColor: "#F97316"
      }
    ]).returning();
    const [transportCategory, foodCategory, parcelCategory, socialCategory, milestoneCategory, excellenceCategory] = categories;
    await db3.insert(achievements).values([
      // Transportation Achievements
      {
        categoryId: transportCategory.id,
        name: "First Ride",
        description: "Complete your first taxi ride",
        badgeIcon: "Car",
        badgeColor: "#3B82F6",
        points: 10,
        requirement: { type: "ride_count", target: 1 },
        tier: "bronze"
      },
      {
        categoryId: transportCategory.id,
        name: "Regular Commuter",
        description: "Complete 10 taxi rides",
        badgeIcon: "Navigation",
        badgeColor: "#3B82F6",
        points: 50,
        requirement: { type: "ride_count", target: 10 },
        tier: "silver"
      },
      {
        categoryId: transportCategory.id,
        name: "Road Warrior",
        description: "Complete 50 taxi rides",
        badgeIcon: "Zap",
        badgeColor: "#3B82F6",
        points: 200,
        requirement: { type: "ride_count", target: 50 },
        tier: "gold"
      },
      {
        categoryId: transportCategory.id,
        name: "Transport Legend",
        description: "Complete 200 taxi rides",
        badgeIcon: "Crown",
        badgeColor: "#3B82F6",
        points: 500,
        requirement: { type: "ride_count", target: 200 },
        tier: "platinum"
      },
      // Food Delivery Achievements
      {
        categoryId: foodCategory.id,
        name: "Foodie Beginner",
        description: "Order your first meal",
        badgeIcon: "UtensilsCrossed",
        badgeColor: "#F59E0B",
        points: 10,
        requirement: { type: "food_order_count", target: 1 },
        tier: "bronze"
      },
      {
        categoryId: foodCategory.id,
        name: "Regular Diner",
        description: "Order 15 meals",
        badgeIcon: "ChefHat",
        badgeColor: "#F59E0B",
        points: 75,
        requirement: { type: "food_order_count", target: 15 },
        tier: "silver"
      },
      {
        categoryId: foodCategory.id,
        name: "Food Enthusiast",
        description: "Order 50 meals",
        badgeIcon: "Pizza",
        badgeColor: "#F59E0B",
        points: 250,
        requirement: { type: "food_order_count", target: 50 },
        tier: "gold"
      },
      {
        categoryId: foodCategory.id,
        name: "Culinary Master",
        description: "Order 150 meals",
        badgeIcon: "Award",
        badgeColor: "#F59E0B",
        points: 600,
        requirement: { type: "food_order_count", target: 150 },
        tier: "platinum"
      },
      // Parcel Achievements
      {
        categoryId: parcelCategory.id,
        name: "First Delivery",
        description: "Send your first parcel",
        badgeIcon: "Package",
        badgeColor: "#10B981",
        points: 10,
        requirement: { type: "parcel_count", target: 1 },
        tier: "bronze"
      },
      {
        categoryId: parcelCategory.id,
        name: "Reliable Sender",
        description: "Send 20 parcels",
        badgeIcon: "Truck",
        badgeColor: "#10B981",
        points: 100,
        requirement: { type: "parcel_count", target: 20 },
        tier: "silver"
      },
      {
        categoryId: parcelCategory.id,
        name: "Logistics Expert",
        description: "Send 75 parcels",
        badgeIcon: "MapPin",
        badgeColor: "#10B981",
        points: 350,
        requirement: { type: "parcel_count", target: 75 },
        tier: "gold"
      },
      // Excellence Achievements
      {
        categoryId: excellenceCategory.id,
        name: "Five Star Service",
        description: "Receive 5 perfect ratings",
        badgeIcon: "Star",
        badgeColor: "#F97316",
        points: 100,
        requirement: { type: "perfect_ratings", target: 5 },
        tier: "silver"
      },
      {
        categoryId: excellenceCategory.id,
        name: "Excellence Ambassador",
        description: "Receive 25 perfect ratings",
        badgeIcon: "Trophy",
        badgeColor: "#F97316",
        points: 400,
        requirement: { type: "perfect_ratings", target: 25 },
        tier: "gold"
      },
      {
        categoryId: excellenceCategory.id,
        name: "Service Legend",
        description: "Receive 100 perfect ratings",
        badgeIcon: "Medal",
        badgeColor: "#F97316",
        points: 1e3,
        requirement: { type: "perfect_ratings", target: 100 },
        tier: "diamond"
      },
      // Milestone Achievements
      {
        categoryId: milestoneCategory.id,
        name: "Level Up",
        description: "Reach Level 5",
        badgeIcon: "TrendingUp",
        badgeColor: "#EF4444",
        points: 100,
        requirement: { type: "level_reached", target: 5 },
        tier: "silver"
      },
      {
        categoryId: milestoneCategory.id,
        name: "High Achiever",
        description: "Reach Level 10",
        badgeIcon: "Target",
        badgeColor: "#EF4444",
        points: 300,
        requirement: { type: "level_reached", target: 10 },
        tier: "gold"
      },
      {
        categoryId: milestoneCategory.id,
        name: "Elite Member",
        description: "Reach Level 20",
        badgeIcon: "Gem",
        badgeColor: "#EF4444",
        points: 800,
        requirement: { type: "level_reached", target: 20 },
        tier: "platinum"
      },
      {
        categoryId: milestoneCategory.id,
        name: "Points Collector",
        description: "Earn 1000 points",
        badgeIcon: "Coins",
        badgeColor: "#EF4444",
        points: 200,
        requirement: { type: "total_points", target: 1e3 },
        tier: "gold"
      },
      {
        categoryId: milestoneCategory.id,
        name: "Points Master",
        description: "Earn 5000 points",
        badgeIcon: "Banknote",
        badgeColor: "#EF4444",
        points: 500,
        requirement: { type: "total_points", target: 5e3 },
        tier: "platinum"
      },
      // Social & Community Achievements
      {
        categoryId: socialCategory.id,
        name: "Streak Starter",
        description: "Maintain a 7-day streak",
        badgeIcon: "Flame",
        badgeColor: "#8B5CF6",
        points: 75,
        requirement: { type: "streak_days", target: 7 },
        tier: "silver"
      },
      {
        categoryId: socialCategory.id,
        name: "Dedication Master",
        description: "Maintain a 30-day streak",
        badgeIcon: "Calendar",
        badgeColor: "#8B5CF6",
        points: 300,
        requirement: { type: "streak_days", target: 30 },
        tier: "gold"
      },
      {
        categoryId: socialCategory.id,
        name: "Unstoppable Force",
        description: "Maintain a 100-day streak",
        badgeIcon: "Infinity",
        badgeColor: "#8B5CF6",
        points: 1e3,
        requirement: { type: "streak_days", target: 100 },
        tier: "diamond"
      },
      // Special Driver/Vendor Achievements
      {
        categoryId: excellenceCategory.id,
        name: "Big Earner",
        description: "Earn LKR 50,000 in total",
        badgeIcon: "DollarSign",
        badgeColor: "#10B981",
        points: 300,
        requirement: { type: "earnings_amount", target: 5e6 },
        // 50,000 LKR in cents
        tier: "gold"
      },
      {
        categoryId: excellenceCategory.id,
        name: "Top Performer",
        description: "Earn LKR 200,000 in total",
        badgeIcon: "TrendingUp",
        badgeColor: "#10B981",
        points: 800,
        requirement: { type: "earnings_amount", target: 2e7 },
        // 200,000 LKR in cents
        tier: "platinum"
      }
    ]);
    console.log("\u2705 Achievement system seeded successfully!");
  } catch (error) {
    console.error("\u274C Error seeding achievements:", error);
    throw error;
  }
}

// server/routes/achievementRoutes.ts
var router8 = Router8();
router8.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const [achievements2, stats] = await Promise.all([
      achievementService.getUserAchievements(userId),
      achievementService.getUserStats(userId)
    ]);
    res.json({
      achievements: achievements2,
      stats,
      success: true
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});
router8.get("/stats/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const stats = await achievementService.getUserStats(userId);
    res.json({ stats, success: true });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});
router8.get("/recent/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 5;
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const recentAchievements = await achievementService.getRecentAchievements(userId, limit);
    res.json({ achievements: recentAchievements, success: true });
  } catch (error) {
    console.error("Error fetching recent achievements:", error);
    res.status(500).json({ message: "Failed to fetch recent achievements" });
  }
});
router8.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await achievementService.getLeaderboard(limit);
    res.json({ leaderboard, success: true });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});
var achievementActionSchema = z3.object({
  userId: z3.number(),
  action: z3.enum(["ride", "food_order", "parcel", "earnings", "perfect_rating"]),
  amount: z3.number().optional()
});
router8.post("/trigger", async (req, res) => {
  try {
    const { userId, action, amount } = achievementActionSchema.parse(req.body);
    let unlockedAchievements = [];
    switch (action) {
      case "ride":
        unlockedAchievements = await achievementService.incrementRideCount(userId);
        break;
      case "food_order":
        unlockedAchievements = await achievementService.incrementFoodOrderCount(userId);
        break;
      case "parcel":
        unlockedAchievements = await achievementService.incrementParcelCount(userId);
        break;
      case "earnings":
        if (!amount) {
          return res.status(400).json({ message: "Amount required for earnings action" });
        }
        unlockedAchievements = await achievementService.addEarnings(userId, amount);
        break;
      case "perfect_rating":
        unlockedAchievements = await achievementService.incrementPerfectRating(userId);
        break;
    }
    res.json({
      success: true,
      message: `${action} incremented successfully`,
      unlockedAchievements
    });
  } catch (error) {
    console.error("Error triggering achievement:", error);
    res.status(500).json({ message: "Failed to trigger achievement" });
  }
});
router8.post("/initialize/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const stats = await achievementService.initializeUserStats(userId);
    res.json({ stats, success: true, message: "User stats initialized" });
  } catch (error) {
    console.error("Error initializing user stats:", error);
    res.status(500).json({ message: "Failed to initialize user stats" });
  }
});
router8.post("/seed", async (req, res) => {
  try {
    await seedAchievements();
    res.json({ success: true, message: "Achievements seeded successfully" });
  } catch (error) {
    console.error("Error seeding achievements:", error);
    res.status(500).json({ message: "Failed to seed achievements" });
  }
});

// server/routes.ts
function registerRoutes(app2) {
  app2.use("/api/auth", authRoutes_default);
  app2.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/config/mapbox", (_req, res) => {
    const token = process.env.MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNrcnl6aG90NDFud3Ayd3BnYmVmOGxlM3IifQ.demo-token";
    res.json({ accessToken: token });
  });
  app2.use("/api/rides", rideRoutes_default);
  app2.use("/api/food", foodRoutes_default);
  app2.use("/api/parcels", parcelRoutes_default);
  app2.use("/api/commissions", commissionRoutes_default);
  app2.use("/api/recommendations", recommendationRoutes_default);
  app2.use("/api/search", searchRoutes_default);
  app2.use("/api/achievements", router8);
  app2.get("/api/db-test", async (_req, res) => {
    try {
      await db3.execute("SELECT 1");
      res.json({ status: "Database connected successfully" });
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ status: "Database connection failed", error: error.message });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/drivers",
    verifyClient: (info) => {
      try {
        const url = new URL(info.req.url || "", `http://${info.req.headers.host}`);
        const driverId = url.searchParams.get("driverId");
        return !!driverId && !isNaN(parseInt(driverId));
      } catch (error) {
        console.error("Error verifying WebSocket client:", error);
        return false;
      }
    }
  });
  liveOrderService_default.setWebSocketServer(wss);
  console.log("\u{1F50C} WebSocket server initialized for driver notifications");
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/cronService.ts
var CronService = class {
  intervals = /* @__PURE__ */ new Map();
  /**
   * Start the weekly commission reminder scheduler
   * Runs every Monday at 9:00 AM
   */
  startWeeklyCommissionReminders() {
    const now = /* @__PURE__ */ new Date();
    const nextMonday = /* @__PURE__ */ new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);
    if (now.getDay() === 1 && now.getHours() >= 9) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    const msUntilNextRun = nextMonday.getTime() - now.getTime();
    console.log(`\u{1F4C5} Commission reminders scheduled for: ${nextMonday.toLocaleDateString()} at 9:00 AM`);
    setTimeout(() => {
      this.runWeeklyCommissionTask();
      const weeklyInterval = setInterval(() => {
        this.runWeeklyCommissionTask();
      }, 7 * 24 * 60 * 60 * 1e3);
      this.intervals.set("weeklyCommissionReminders", weeklyInterval);
    }, msUntilNextRun);
  }
  /**
   * Run the weekly commission reminder task
   */
  async runWeeklyCommissionTask() {
    try {
      console.log("\u{1F514} Running weekly commission reminder task...");
      const results = await commissionService.sendWeeklyReminders();
      console.log("\u2705 Weekly commission reminders completed:", {
        totalProcessed: results.length,
        blocked: results.filter((r) => r.blocked).length,
        failed: results.filter((r) => r.error).length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      results.forEach((result) => {
        if (result.error) {
          console.error(`\u274C Failed to send reminder to driver ${result.driverId}: ${result.error}`);
        } else if (result.blocked) {
          console.warn(`\u{1F6AB} Driver ${result.driverId} (${result.name}) has been blocked after ${result.remindersSent} reminders`);
        } else {
          console.log(`\u{1F4E7} Reminder sent to driver ${result.driverId} (${result.name}) - Reminder #${result.remindersSent}`);
        }
      });
    } catch (error) {
      console.error("\u274C Weekly commission reminder task failed:", error);
    }
  }
  /**
   * Start daily commission calculation task
   * Processes commissions for completed orders from the previous day
   */
  startDailyCommissionCalculation() {
    const now = /* @__PURE__ */ new Date();
    const next1AM = /* @__PURE__ */ new Date();
    next1AM.setHours(25, 0, 0, 0);
    const msUntilNext1AM = next1AM.getTime() - now.getTime();
    console.log(`\u{1F4CA} Daily commission calculation scheduled for: ${next1AM.toLocaleDateString()} at 1:00 AM`);
    setTimeout(() => {
      this.runDailyCommissionCalculation();
      const dailyInterval = setInterval(() => {
        this.runDailyCommissionCalculation();
      }, 24 * 60 * 60 * 1e3);
      this.intervals.set("dailyCommissionCalculation", dailyInterval);
    }, msUntilNext1AM);
  }
  /**
   * Run daily commission calculation for completed orders
   */
  async runDailyCommissionCalculation() {
    try {
      console.log("\u{1F4B0} Running daily commission calculation...");
      console.log("\u2705 Daily commission calculation completed at:", (/* @__PURE__ */ new Date()).toISOString());
    } catch (error) {
      console.error("\u274C Daily commission calculation failed:", error);
    }
  }
  /**
   * Stop a specific scheduled task
   */
  stopTask(taskName) {
    const interval = this.intervals.get(taskName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskName);
      console.log(`\u23F9\uFE0F Stopped task: ${taskName}`);
    }
  }
  /**
   * Stop all scheduled tasks
   */
  stopAllTasks() {
    this.intervals.forEach((interval, taskName) => {
      clearInterval(interval);
      console.log(`\u23F9\uFE0F Stopped task: ${taskName}`);
    });
    this.intervals.clear();
  }
  /**
   * Get status of all running tasks
   */
  getTaskStatus() {
    return {
      activeTasks: Array.from(this.intervals.keys()),
      totalTasks: this.intervals.size,
      status: this.intervals.size > 0 ? "running" : "stopped"
    };
  }
};
var cronService = new CronService();

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-key-super-long-for-security-run-pick-2025",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 hours
    httpOnly: false,
    // Allow client access for debugging
    sameSite: "lax",
    domain: void 0,
    // Let it default to current domain
    path: "/"
    // Ensure cookie is available site-wide
  },
  name: "runpick.sid"
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    console.log("Starting server setup...");
    const server = await registerRoutes(app);
    console.log("Routes registered successfully");
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Server error:", err);
    });
    if (process.env.NODE_ENV === "development" || app.get("env") === "development") {
      console.log("Setting up Vite middleware...");
      await setupVite(app, server);
      console.log("Vite middleware setup complete");
    } else {
      serveStatic(app);
    }
    const port = 5e3;
    console.log("About to start listening on port", port);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server successfully bound to port ${port}`);
      log(`serving on port ${port}`);
      console.log("\u{1F680} Starting scheduled tasks...");
      cronService.startWeeklyCommissionReminders();
      cronService.startDailyCommissionCalculation();
      console.log("\u2705 All scheduled tasks started successfully");
    });
    server.on("error", (err) => {
      console.error("Server error:", err);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
