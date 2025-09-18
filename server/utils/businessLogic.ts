import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, sql } from "drizzle-orm";
import { 
  driverProfiles, 
  wallets, 
  transactions, 
  commissionRules,
  type Transaction,
  type InsertTransaction 
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const dbSql = neon(process.env.DATABASE_URL);
const db = drizzle(dbSql);

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate fare for taxi ride based on distance and vehicle type
 * @param pickupLat - Pickup latitude
 * @param pickupLng - Pickup longitude
 * @param dropLat - Drop-off latitude
 * @param dropLng - Drop-off longitude
 * @param vehicleType - Type of vehicle (car, tuk-tuk, van)
 * @returns Estimated fare in LKR
 */
export function calculateFare(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  vehicleType: string
): { fare: number; distance: number; duration: number } {
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  
  // Base rates per km for different vehicle types
  const rates = {
    'tuk-tuk': 80,
    'car': 120,
    'van': 150,
    'bike': 60
  };
  
  const baseFare = 100; // Base fare in LKR
  const ratePerKm = rates[vehicleType as keyof typeof rates] || rates.car;
  
  const fare = Math.round(baseFare + (distance * ratePerKm));
  const duration = Math.round(distance * 3); // Rough estimate: 3 minutes per km
  
  return { fare, distance, duration };
}

/**
 * Calculate fare for lorry booking based on distance and vehicle type
 * Uses the exact rates provided: base fare for first km + per km rate for additional distance
 * @param pickupLat - Pickup latitude
 * @param pickupLng - Pickup longitude
 * @param dropLat - Drop-off latitude
 * @param dropLng - Drop-off longitude
 * @param vehicleType - Type of lorry vehicle
 * @returns Estimated fare in LKR
 */
export function calculateLorryFare(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  vehicleType: string
): { fare: number; distance: number; duration: number } {
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  
  // Lorry rates from provided data - base fare for first km + per km rate for additional distance
  const lorryRates = {
    'lorry_light': { baseFare: 1821.68, pricePerKm: 121.10 },
    'light_open': { baseFare: 1821.68, pricePerKm: 121.10 },
    'mover': { baseFare: 4045.88, pricePerKm: 185.86 },
    'mover_open': { baseFare: 4045.88, pricePerKm: 185.86 },
    'mover_plus': { baseFare: 7790.08, pricePerKm: 266.98 },
    'mover_plus_open': { baseFare: 7790.08, pricePerKm: 266.98 }
  };
  
  const rates = lorryRates[vehicleType as keyof typeof lorryRates] || lorryRates.lorry_light;
  
  let fare: number;
  if (distance <= 1) {
    // For distances 1km or less, just charge the base fare
    fare = rates.baseFare;
  } else {
    // Base fare for first km + per km rate for additional distance
    const additionalDistance = distance - 1;
    fare = rates.baseFare + (additionalDistance * rates.pricePerKm);
  }
  
  const duration = Math.round(distance * 3); // Rough estimate: 3 minutes per km
  
  return { fare: Math.round(fare), distance, duration };
}

/**
 * Calculate parcel delivery cost based on size and distance
 * @param pickupLat - Pickup latitude
 * @param pickupLng - Pickup longitude
 * @param dropLat - Drop-off latitude
 * @param dropLng - Drop-off longitude
 * @param size - Package size (S, M, L)
 * @returns Delivery cost in LKR
 */
export function calculateParcelCost(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  size: string
): { cost: number; distance: number } {
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  
  // Size-based pricing
  const sizePricing = {
    'S': { base: 200, perKm: 15 },
    'M': { base: 350, perKm: 25 },
    'L': { base: 500, perKm: 40 }
  };
  
  const pricing = sizePricing[size as keyof typeof sizePricing] || sizePricing.M;
  const cost = Math.round(pricing.base + (distance * pricing.perKm));
  
  return { cost, distance };
}

/**
 * Find nearest available driver for a service
 * @param serviceType - Type of service (taxi, food, parcel)
 * @param pickupLat - Pickup latitude
 * @param pickupLng - Pickup longitude
 * @param vehicleType - Required vehicle type (optional)
 * @returns Driver ID or null if no driver available
 */
export async function assignDriver(
  serviceType: string,
  pickupLat: number,
  pickupLng: number,
  vehicleType?: string
): Promise<number | null> {
  try {
    // Find available drivers within 10km radius
    const availableDrivers = await db
      .select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        latitude: driverProfiles.currentLatitude,
        longitude: driverProfiles.currentLongitude,
        vehicleType: driverProfiles.vehicleType,
      })
      .from(driverProfiles)
      .where(
        and(
          eq(driverProfiles.isAvailable, true),
          eq(driverProfiles.isVerified, true),
          vehicleType ? eq(driverProfiles.vehicleType, vehicleType as any) : sql`1=1`
        )
      );

    if (availableDrivers.length === 0) {
      return null;
    }

    // Calculate distances and find nearest driver
    const driversWithDistance = availableDrivers
      .map(driver => ({
        ...driver,
        distance: driver.latitude && driver.longitude 
          ? calculateDistance(
              pickupLat, 
              pickupLng, 
              parseFloat(driver.latitude), 
              parseFloat(driver.longitude)
            )
          : Infinity
      }))
      .filter(driver => driver.distance <= 10) // Within 10km
      .sort((a, b) => a.distance - b.distance);

    return driversWithDistance.length > 0 ? driversWithDistance[0].userId : null;
  } catch (error) {
    console.error('Error assigning driver:', error);
    return null;
  }
}

/**
 * Process order/ride completion and handle commission distribution
 * @param orderType - Type of order (taxi, food, parcel)
 * @param orderId - Order ID
 * @param totalAmount - Total order amount
 * @param customerId - Customer user ID
 * @param serviceProviderId - Driver/vendor user ID
 * @param restaurantId - Restaurant ID (for food orders)
 */
export async function processCompletion(
  orderType: 'taxi' | 'food' | 'parcel',
  orderId: number,
  totalAmount: number,
  customerId: number,
  serviceProviderId: number,
  restaurantId?: number
): Promise<void> {
  try {
    // Get commission rule for service type
    const commissionRule = await db
      .select()
      .from(commissionRules)
      .where(
        and(
          eq(commissionRules.serviceType, orderType),
          eq(commissionRules.isActive, true)
        )
      )
      .limit(1);

    if (commissionRule.length === 0) {
      throw new Error(`No commission rule found for ${orderType}`);
    }

    const rule = commissionRule[0];
    const commissionAmount = Math.round(
      (totalAmount * parseFloat(rule.percentage)) / 100 + parseFloat(rule.flatFee)
    );
    const serviceProviderAmount = totalAmount - commissionAmount;

    // For food orders, split between restaurant and driver
    if (orderType === 'food' && restaurantId) {
      const driverAmount = Math.round(serviceProviderAmount * 0.3); // 30% to driver
      const restaurantAmount = serviceProviderAmount - driverAmount;

      // Update restaurant wallet
      await updateWalletBalance(restaurantId, restaurantAmount);
      await createTransaction({
        userId: restaurantId,
        amount: restaurantAmount.toString(),
        type: 'credit',
        description: `Food order completion - Order #${orderId}`,
        orderId,
        serviceType: orderType,
      });

      // Update driver wallet
      await updateWalletBalance(serviceProviderId, driverAmount);
      await createTransaction({
        userId: serviceProviderId,
        amount: driverAmount.toString(),
        type: 'credit',
        description: `Food delivery completion - Order #${orderId}`,
        orderId,
        serviceType: orderType,
      });
    } else {
      // For taxi and parcel, full amount to service provider
      await updateWalletBalance(serviceProviderId, serviceProviderAmount);
      await createTransaction({
        userId: serviceProviderId,
        amount: serviceProviderAmount.toString(),
        type: 'credit',
        description: `${orderType.charAt(0).toUpperCase() + orderType.slice(1)} completion - Order #${orderId}`,
        orderId,
        serviceType: orderType,
      });
    }

    // Record commission transaction (admin gets commission)
    await createTransaction({
      userId: 1, // Assuming admin user ID is 1
      amount: commissionAmount.toString(),
      type: 'commission',
      description: `Commission from ${orderType} - Order #${orderId}`,
      orderId,
      serviceType: orderType,
    });

    console.log(`Order ${orderId} completed successfully. Commission: ${commissionAmount}, Service Provider: ${serviceProviderAmount}`);
  } catch (error) {
    console.error('Error processing completion:', error);
    throw error;
  }
}

/**
 * Update user's wallet balance
 * @param userId - User ID
 * @param amount - Amount to add/subtract
 */
async function updateWalletBalance(userId: number, amount: number): Promise<void> {
  try {
    // Check if wallet exists
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (existingWallet.length === 0) {
      // Create new wallet
      await db.insert(wallets).values({
        userId,
        balance: amount.toString(),
      });
    } else {
      // Update existing wallet
      const currentBalance = parseFloat(existingWallet[0].balance);
      const newBalance = currentBalance + amount;
      
      await db
        .update(wallets)
        .set({ 
          balance: newBalance.toString(),
          updatedAt: new Date()
        })
        .where(eq(wallets.userId, userId));
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
}

/**
 * Create a transaction record
 * @param transaction - Transaction data
 */
async function createTransaction(transaction: InsertTransaction): Promise<Transaction> {
  try {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    
    return newTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Get user's wallet balance
 * @param userId - User ID
 * @returns Wallet balance or 0 if no wallet exists
 */
export async function getWalletBalance(userId: number): Promise<number> {
  try {
    const wallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    return wallet.length > 0 ? parseFloat(wallet[0].balance) : 0;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
}

/**
 * Get user's transaction history
 * @param userId - User ID
 * @param limit - Number of transactions to fetch
 * @returns Array of transactions
 */
export async function getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
  try {
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(sql`${transactions.createdAt} DESC`)
      .limit(limit);

    return userTransactions;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return [];
  }
}