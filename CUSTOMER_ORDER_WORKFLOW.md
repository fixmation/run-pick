# Customer Order Process & Live Driver Notification System

## Overview

This document outlines the complete customer order workflow and the real-time driver notification system implemented in the Sri Lankan Multi-Service Platform.

## Customer Order Process Flow

### 1. Order Creation Process

#### Taxi Booking (Ride Service)
1. **Customer Request**: User submits ride request via `/api/rides/request`
2. **Fare Calculation**: System calculates fare based on distance, vehicle type, and time
3. **Order Creation**: Taxi booking record created in `taxiBookings` table
4. **Live Order Assignment**: Creates live order request in `liveOrderRequests` table
5. **Driver Notification**: Nearest drivers receive real-time notifications via WebSocket

**Flow**: Customer → Fare Calculator → Database → Live Order Service → Driver Notifications

#### Food Delivery
1. **Order Placement**: Customer places food order via `/api/food/orders`
2. **Restaurant Processing**: Order sent to restaurant for confirmation
3. **Total Calculation**: System calculates total amount including items and delivery
4. **Live Driver Assignment**: Creates live order for delivery driver assignment
5. **Driver Notification**: Available drivers receive pickup notifications

**Flow**: Customer → Restaurant → Order Processing → Live Assignment → Driver Notifications

#### Parcel Delivery
1. **Parcel Request**: Customer creates parcel delivery via `/api/parcels/`
2. **Cost Calculation**: System calculates delivery cost based on distance and size
3. **Pickup Scheduling**: Parcel pickup details recorded
4. **Live Assignment**: Creates live order for nearest driver
5. **Driver Notification**: Drivers receive parcel pickup notifications

**Flow**: Customer → Cost Calculator → Schedule → Live Assignment → Driver Notifications

## Real-Time Driver Notification System

### Architecture Components

#### 1. WebSocket Server (`server/routes.ts`)
- **Path**: `/ws/drivers`
- **Verification**: Validates driver ID and authentication
- **Connection Management**: Tracks active driver connections
- **Message Routing**: Routes notifications to specific drivers

#### 2. Live Order Service (`server/services/liveOrderService.ts`)
- **Order Processing**: Manages real-time order assignments
- **Driver Matching**: Finds nearest available drivers within radius
- **Notification Management**: Creates and sends driver notifications
- **Status Tracking**: Tracks acceptance, rejection, and timeouts

#### 3. Driver WebSocket Hook (`client/src/hooks/useDriverWebSocket.ts`)
- **Connection Management**: Maintains WebSocket connection
- **Message Handling**: Processes incoming notifications
- **Location Updates**: Sends driver location updates
- **Status Management**: Handles driver availability status

#### 4. Notification Popup (`client/src/components/driver/DriverNotificationPopup.tsx`)
- **Visual Display**: Shows order details in modal popup
- **Sound Alert**: Plays notification ringtone
- **Timer**: 60-second countdown for response
- **Action Buttons**: Accept/Reject order options

### Database Schema

#### Live Order Requests Table
```sql
CREATE TABLE live_order_requests (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  service_type service_type_enum NOT NULL,
  customer_id INTEGER REFERENCES users(id),
  pickup_latitude DECIMAL(10,8) NOT NULL,
  pickup_longitude DECIMAL(11,8) NOT NULL,
  dropoff_latitude DECIMAL(10,8),
  dropoff_longitude DECIMAL(11,8),
  vehicle_type vehicle_type_enum,
  max_radius DECIMAL(5,2) DEFAULT 10.00,
  current_radius DECIMAL(5,2) DEFAULT 2.00,
  status TEXT DEFAULT 'searching',
  assigned_driver_ids JSONB DEFAULT '[]',
  rejected_driver_ids JSONB DEFAULT '[]',
  accepted_driver_id INTEGER REFERENCES users(id),
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Driver Notifications Table
```sql
CREATE TABLE driver_notifications (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id INTEGER,
  service_type service_type_enum,
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  is_accepted BOOLEAN DEFAULT FALSE,
  is_rejected BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  expires_at TIMESTAMP,
  sent_via TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Driver Connections Table
```sql
CREATE TABLE driver_connections (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES users(id),
  connection_id TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_ping TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Driver Assignment Algorithm

### 1. Initial Search (2km radius)
- Find available, verified, online drivers
- Filter by vehicle type (if specified)
- Exclude already assigned/rejected drivers
- Calculate distances using GPS coordinates

### 2. Ranking System
- **Primary**: Distance (closest first)
- **Secondary**: Driver rating
- **Tertiary**: Total rides completed

### 3. Notification Process
- Notify top 3 closest drivers simultaneously
- 60-second response window
- Auto-expand radius if no response
- Maximum 10km search radius

### 4. Radius Expansion
- Start: 2km radius
- Expand: +2km every 30 seconds
- Maximum: 10km radius
- Timeout: 10 minutes total

## Notification Features

### Real-Time Popup Notification
- **Visual Elements**:
  - Service type icon (🚗🍔📦)
  - Order details and customer info
  - Distance and estimated fare
  - Countdown timer
  - Accept/Reject buttons

- **Audio Elements**:
  - Notification ringtone (800Hz beep)
  - Multiple sound alerts for attention
  - Browser notification sound API

- **Interactive Features**:
  - Real-time countdown (60 seconds)
  - One-click accept/reject
  - Auto-expiry handling
  - Connection status indicator

### WebSocket Message Types

#### From Server to Driver
```json
{
  "type": "new_order_request",
  "notificationId": 123,
  "orderId": 456,
  "serviceType": "taxi",
  "title": "🚗 New Ride Request",
  "message": "Pickup nearby - 2.5km away",
  "distance": 2.5,
  "estimatedFare": 850,
  "estimatedDuration": 15,
  "expiresAt": "2025-08-20T10:30:00Z",
  "metadata": {
    "pickupLatitude": "6.9271",
    "pickupLongitude": "79.8612",
    "customerName": "John Doe",
    "customerPhone": "+94 77 123 4567"
  },
  "sound": "notification_ring",
  "priority": "urgent"
}
```

#### From Driver to Server
```json
{
  "type": "accept_order",
  "notificationId": 123,
  "orderId": 456,
  "serviceType": "taxi",
  "timestamp": 1692531600000
}

{
  "type": "reject_order", 
  "notificationId": 123,
  "orderId": 456,
  "serviceType": "taxi",
  "timestamp": 1692531600000
}

{
  "type": "update_location",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "timestamp": 1692531600000
}
```

## Order Status Flow

### Taxi Booking States
1. `pending` → Order created, waiting for driver
2. `confirmed` → Driver assigned and accepted
3. `in_progress` → Driver started trip
4. `completed` → Trip finished, payment processed
5. `cancelled` → Order cancelled

### Food Order States  
1. `pending` → Order placed, waiting confirmation
2. `confirmed` → Restaurant confirmed, driver assigned
3. `preparing` → Restaurant preparing food
4. `ready` → Food ready for pickup
5. `out_for_delivery` → Driver picked up, en route
6. `delivered` → Food delivered, payment processed
7. `cancelled` → Order cancelled

### Parcel Delivery States
1. `pending` → Parcel request created
2. `confirmed` → Driver assigned for pickup
3. `picked_up` → Driver collected parcel
4. `in_transit` → Parcel being delivered
5. `delivered` → Parcel delivered successfully
6. `cancelled` → Delivery cancelled

## Performance Optimizations

### WebSocket Optimizations
- Connection pooling and reuse
- Automatic reconnection with exponential backoff
- Heartbeat monitoring (30-second intervals)
- Message queuing for offline drivers

### Database Optimizations
- Indexed location queries for fast driver search
- JSONB fields for flexible notification metadata
- Automatic cleanup of expired notifications
- Connection status tracking

### Real-Time Features
- GPS location tracking with 30-second updates
- Live status updates (online/offline/busy)
- Automatic driver availability management
- Real-time earnings and commission tracking

## Testing & Development

### Development Features
- Test notification component for manual testing
- WebSocket connection status indicators
- Debug logging for all WebSocket events
- Mock notification generation

### Testing Workflow
1. Register as driver user
2. Access driver dashboard
3. Use test notification button
4. Verify popup appearance and sound
5. Test accept/reject functionality
6. Confirm WebSocket message handling

## Security Features

### WebSocket Security
- Driver ID verification on connection
- Connection-based message routing  
- Automatic connection cleanup on disconnect
- Rate limiting on notification requests

### Data Privacy
- Encrypted customer information in notifications
- Limited driver access to customer details
- Automatic cleanup of expired notifications
- Secure commission and payment processing

This comprehensive system ensures efficient real-time communication between customers and drivers, optimizing response times and improving overall service quality across all platform services.