import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, inArray } from "drizzle-orm";
import {
  users,
  driverProfiles,
  vendorProfiles,
  wallets,
  transactions,
  ratings,
  commissionRules,
  taxiBookings,
  lorryBookings,
  restaurants,
  menuItems,
  foodOrders,
  orderItems,
  parcelDeliveries,
  passwordResets,
  chatRooms,
  chatMessages,
  type User,
  type InsertUser,
  type DriverProfile,
  type InsertDriverProfile,
  type VendorProfile,
  type InsertVendorProfile,
  type Wallet,
  type Transaction,
  type InsertTransaction,
  type Rating,
  type InsertRating,
  type CommissionRule,
  type InsertCommissionRule,
  type TaxiBooking,
  type InsertTaxiBooking,
  type LorryBooking,
  type InsertLorryBooking,
  type Restaurant,
  type InsertRestaurant,
  type MenuItem,
  type InsertMenuItem,
  type FoodOrder,
  type InsertFoodOrder,
  type OrderItem,
  type InsertOrderItem,
  type ParcelDelivery,
  type InsertParcelDelivery,
  type PasswordReset,
  type InsertPasswordReset,
  type ChatRoom,
  type ChatMessage,
  type InsertChatRoom,
  type InsertChatMessage,
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  
  // Password reset methods
  createPasswordReset(data: { userId: number; token: string; expiresAt: Date }): Promise<void>;
  getPasswordResetByToken(token: string): Promise<{ id: number; userId: number; expiresAt: Date } | undefined>;
  deletePasswordReset(id: number): Promise<void>;
  
  // Profile methods
  getDriverProfile(userId: number): Promise<DriverProfile | undefined>;
  createDriverProfile(profile: InsertDriverProfile): Promise<DriverProfile>;
  updateDriverProfile(userId: number, profile: Partial<InsertDriverProfile>): Promise<DriverProfile | undefined>;
  
  getVendorProfile(userId: number): Promise<VendorProfile | undefined>;
  createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile>;
  updateVendorProfile(userId: number, profile: Partial<InsertVendorProfile>): Promise<VendorProfile | undefined>;
  
  // Wallet methods
  getWallet(userId: number): Promise<Wallet | undefined>;
  createWallet(userId: number): Promise<Wallet>;
  updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined>;
  
  // Transaction methods
  getTransactionsByUser(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Rating methods
  getRatingsByServiceProvider(serviceProviderId: number): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  
  // Commission rule methods
  getCommissionRules(): Promise<CommissionRule[]>;
  getCommissionRuleByServiceType(serviceType: string): Promise<CommissionRule | undefined>;
  createCommissionRule(rule: InsertCommissionRule): Promise<CommissionRule>;
  updateCommissionRule(id: number, rule: Partial<InsertCommissionRule>): Promise<CommissionRule | undefined>;
  
  // Taxi booking methods
  getTaxiBooking(id: number): Promise<TaxiBooking | undefined>;
  getTaxiBookingsByUser(userId: number): Promise<TaxiBooking[]>;
  getAvailableTaxiBookings(): Promise<TaxiBooking[]>;
  createTaxiBooking(booking: InsertTaxiBooking): Promise<TaxiBooking>;
  updateTaxiBooking(id: number, booking: Partial<TaxiBooking>): Promise<TaxiBooking | undefined>;
  
  // Lorry booking methods
  getLorryBooking(id: number): Promise<LorryBooking | undefined>;
  getUserLorryBookings(userId: number): Promise<LorryBooking[]>;
  getAvailableLorryBookings(): Promise<LorryBooking[]>;
  createLorryBooking(booking: InsertLorryBooking): Promise<LorryBooking>;
  updateLorryBooking(id: number, booking: Partial<LorryBooking>): Promise<LorryBooking | undefined>;
  
  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurantsNearLocation(latitude: number, longitude: number, maxRadius: number): Promise<Restaurant[]>;
  getRestaurantsByVendor(vendorId: number): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  
  // Menu item methods
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  
  // Food order methods
  getFoodOrder(id: number): Promise<FoodOrder | undefined>;
  getFoodOrdersByUser(userId: number): Promise<FoodOrder[]>;
  getPendingOrdersByRestaurants(restaurantIds: number[]): Promise<FoodOrder[]>;
  getAvailableFoodDeliveries(): Promise<FoodOrder[]>;
  createFoodOrder(order: InsertFoodOrder): Promise<FoodOrder>;
  updateFoodOrder(id: number, order: Partial<InsertFoodOrder>): Promise<FoodOrder | undefined>;
  
  // Order item methods
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Parcel delivery methods
  getParcelDelivery(id: number): Promise<ParcelDelivery | undefined>;
  getParcelDeliveriesByUser(userId: number): Promise<ParcelDelivery[]>;
  getAvailableParcelDeliveries(): Promise<ParcelDelivery[]>;
  createParcelDelivery(delivery: InsertParcelDelivery): Promise<ParcelDelivery>;
  updateParcelDelivery(id: number, delivery: Partial<InsertParcelDelivery>): Promise<ParcelDelivery | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ 
      password: hashedPassword,
      updatedAt: new Date()
    }).where(eq(users.id, userId));
  }

  // Password reset methods
  async createPasswordReset(data: { userId: number; token: string; expiresAt: Date }): Promise<void> {
    await db.insert(passwordResets).values({
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
    });
  }

  async getPasswordResetByToken(token: string): Promise<{ id: number; userId: number; expiresAt: Date } | undefined> {
    const result = await db.select().from(passwordResets).where(eq(passwordResets.token, token));
    return result[0];
  }

  async deletePasswordReset(id: number): Promise<void> {
    await db.delete(passwordResets).where(eq(passwordResets.id, id));
  }

  // Profile methods
  async getDriverProfile(userId: number): Promise<DriverProfile | undefined> {
    const result = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId));
    return result[0];
  }

  async createDriverProfile(profile: InsertDriverProfile): Promise<DriverProfile> {
    const result = await db.insert(driverProfiles).values(profile).returning();
    return result[0];
  }

  async updateDriverProfile(userId: number, profile: Partial<InsertDriverProfile>): Promise<DriverProfile | undefined> {
    const result = await db.update(driverProfiles).set(profile).where(eq(driverProfiles.userId, userId)).returning();
    return result[0];
  }

  async getVendorProfile(userId: number): Promise<VendorProfile | undefined> {
    const result = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId));
    return result[0];
  }

  async createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile> {
    const result = await db.insert(vendorProfiles).values(profile).returning();
    return result[0];
  }

  async updateVendorProfile(userId: number, profile: Partial<InsertVendorProfile>): Promise<VendorProfile | undefined> {
    const result = await db.update(vendorProfiles).set(profile).where(eq(vendorProfiles.userId, userId)).returning();
    return result[0];
  }

  // Wallet methods
  async getWallet(userId: number): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return result[0];
  }

  async createWallet(userId: number): Promise<Wallet> {
    const result = await db.insert(wallets).values({ userId, balance: "0.00" }).returning();
    return result[0];
  }

  async updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const result = await db.update(wallets).set({ balance: amount.toString() }).where(eq(wallets.userId, userId)).returning();
    return result[0];
  }

  // Transaction methods
  async getTransactionsByUser(userId: number, limit: number = 50): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  // Rating methods
  async getRatingsByServiceProvider(serviceProviderId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.serviceProviderId, serviceProviderId));
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    const result = await db.insert(ratings).values(rating).returning();
    return result[0];
  }

  // Commission rule methods
  async getCommissionRules(): Promise<CommissionRule[]> {
    return await db.select().from(commissionRules);
  }

  async getCommissionRuleByServiceType(serviceType: string): Promise<CommissionRule | undefined> {
    const result = await db.select().from(commissionRules).where(
      and(eq(commissionRules.serviceType, serviceType as any), eq(commissionRules.isActive, true))
    );
    return result[0];
  }

  async createCommissionRule(rule: InsertCommissionRule): Promise<CommissionRule> {
    const result = await db.insert(commissionRules).values(rule).returning();
    return result[0];
  }

  async updateCommissionRule(id: number, rule: Partial<InsertCommissionRule>): Promise<CommissionRule | undefined> {
    const result = await db.update(commissionRules).set(rule).where(eq(commissionRules.id, id)).returning();
    return result[0];
  }

  // Taxi booking methods
  async getTaxiBooking(id: number): Promise<TaxiBooking | undefined> {
    const result = await db.select().from(taxiBookings).where(eq(taxiBookings.id, id));
    return result[0];
  }

  async getTaxiBookingsByUser(userId: number): Promise<TaxiBooking[]> {
    return await db.select().from(taxiBookings).where(eq(taxiBookings.userId, userId));
  }

  async getAvailableTaxiBookings(): Promise<TaxiBooking[]> {
    return await db.select().from(taxiBookings).where(eq(taxiBookings.status, "pending"));
  }

  async createTaxiBooking(booking: InsertTaxiBooking): Promise<TaxiBooking> {
    const result = await db.insert(taxiBookings).values(booking).returning();
    return result[0];
  }

  async updateTaxiBooking(id: number, booking: Partial<TaxiBooking>): Promise<TaxiBooking | undefined> {
    const result = await db.update(taxiBookings).set(booking).where(eq(taxiBookings.id, id)).returning();
    return result[0];
  }

  // Lorry booking methods
  async getLorryBooking(id: number): Promise<LorryBooking | undefined> {
    const result = await db.select().from(lorryBookings).where(eq(lorryBookings.id, id));
    return result[0];
  }

  async getUserLorryBookings(userId: number): Promise<LorryBooking[]> {
    return await db.select().from(lorryBookings).where(eq(lorryBookings.userId, userId));
  }

  async getAvailableLorryBookings(): Promise<LorryBooking[]> {
    return await db.select().from(lorryBookings).where(eq(lorryBookings.status, "pending"));
  }

  async createLorryBooking(booking: InsertLorryBooking): Promise<LorryBooking> {
    const result = await db.insert(lorryBookings).values(booking).returning();
    return result[0];
  }

  async updateLorryBooking(id: number, booking: Partial<LorryBooking>): Promise<LorryBooking | undefined> {
    const result = await db.update(lorryBookings).set(booking).where(eq(lorryBookings.id, id)).returning();
    return result[0];
  }

  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return result[0];
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.isActive, true));
  }

  async getRestaurantsNearLocation(latitude: number, longitude: number, maxRadius: number): Promise<Restaurant[]> {
    const allRestaurants = await db.select().from(restaurants).where(eq(restaurants.isActive, true));
    
    // Filter restaurants within the specified radius using Haversine formula
    const filteredRestaurants = allRestaurants.filter(restaurant => {
      if (!restaurant.latitude || !restaurant.longitude) return false;
      
      const restLat = parseFloat(restaurant.latitude);
      const restLng = parseFloat(restaurant.longitude);
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in kilometers
      const dLat = (restLat - latitude) * Math.PI / 180;
      const dLng = (restLng - longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(latitude * Math.PI / 180) * Math.cos(restLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance <= maxRadius;
    });

    // Sort by distance (closest first)
    return filteredRestaurants.sort((a, b) => {
      const distA = this.calculateDistance(latitude, longitude, parseFloat(a.latitude!), parseFloat(a.longitude!));
      const distB = this.calculateDistance(latitude, longitude, parseFloat(b.latitude!), parseFloat(b.longitude!));
      return distA - distB;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getRestaurantsByVendor(vendorId: number): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.id, vendorId));
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(restaurant).returning();
    return result[0];
  }

  async updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const result = await db.update(restaurants).set(restaurant).where(eq(restaurants.id, id)).returning();
    return result[0];
  }

  // Menu item methods
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return result[0];
  }

  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(
      and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.isAvailable, true))
    );
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const result = await db.insert(menuItems).values(item).returning();
    return result[0];
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const result = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return result[0];
  }

  // Food order methods
  async getFoodOrder(id: number): Promise<FoodOrder | undefined> {
    const result = await db.select().from(foodOrders).where(eq(foodOrders.id, id));
    return result[0];
  }

  async getFoodOrdersByUser(userId: number): Promise<FoodOrder[]> {
    return await db.select().from(foodOrders).where(eq(foodOrders.userId, userId));
  }

  async getPendingOrdersByRestaurants(restaurantIds: number[]): Promise<FoodOrder[]> {
    return await db.select().from(foodOrders).where(
      and(
        inArray(foodOrders.restaurantId, restaurantIds),
        eq(foodOrders.status, "pending")
      )
    );
  }

  async getAvailableFoodDeliveries(): Promise<FoodOrder[]> {
    return await db.select().from(foodOrders).where(eq(foodOrders.status, "ready"));
  }

  async createFoodOrder(order: InsertFoodOrder): Promise<FoodOrder> {
    const result = await db.insert(foodOrders).values(order).returning();
    return result[0];
  }

  async updateFoodOrder(id: number, order: Partial<InsertFoodOrder>): Promise<FoodOrder | undefined> {
    const result = await db.update(foodOrders).set(order).where(eq(foodOrders.id, id)).returning();
    return result[0];
  }

  // Order item methods
  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // Parcel delivery methods
  async getParcelDelivery(id: number): Promise<ParcelDelivery | undefined> {
    const result = await db.select().from(parcelDeliveries).where(eq(parcelDeliveries.id, id));
    return result[0];
  }

  async getParcelDeliveriesByUser(userId: number): Promise<ParcelDelivery[]> {
    return await db.select().from(parcelDeliveries).where(eq(parcelDeliveries.userId, userId));
  }

  async getAvailableParcelDeliveries(): Promise<ParcelDelivery[]> {
    return await db.select().from(parcelDeliveries).where(eq(parcelDeliveries.status, "pending"));
  }

  async createParcelDelivery(delivery: InsertParcelDelivery): Promise<ParcelDelivery> {
    const result = await db.insert(parcelDeliveries).values(delivery).returning();
    return result[0];
  }

  async updateParcelDelivery(id: number, delivery: Partial<InsertParcelDelivery>): Promise<ParcelDelivery | undefined> {
    const result = await db.update(parcelDeliveries).set(delivery).where(eq(parcelDeliveries.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
