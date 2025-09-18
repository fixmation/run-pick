
# Database Setup Guide

This guide will help you set up PostgreSQL database integration for the multi-service platform.

## Prerequisites

1. PostgreSQL database (local or cloud-based like Neon)
2. Node.js and npm installed
3. Environment variables configured

## Database Setup Steps

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@host:port/database_name
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Database Schema

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

### 5. Run Migrations (Alternative to push)

```bash
npm run db:migrate
```

### 6. Seed Database with Sample Data

```bash
npm run db:seed
```

## Database Schema

The database includes the following tables:

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `password` (Hashed)
- `email` (Unique)
- `phone`
- `role` (customer, driver, admin)
- `created_at`, `updated_at`

### Taxi Bookings Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `driver_id` (Foreign Key to users)
- `pickup_location`, `dropoff_location`
- `pickup_time`
- `vehicle_type`
- `status` (pending, confirmed, in_progress, completed, cancelled)
- `fare`
- `created_at`, `updated_at`

### Restaurants Table
- `id` (Primary Key)
- `name`, `description`
- `address`, `phone`
- `is_active`
- `created_at`, `updated_at`

### Menu Items Table
- `id` (Primary Key)
- `restaurant_id` (Foreign Key to restaurants)
- `name`, `description`
- `price`, `category`
- `is_available`
- `created_at`, `updated_at`

### Food Orders Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `restaurant_id` (Foreign Key to restaurants)
- `driver_id` (Foreign Key to users)
- `delivery_address`
- `total_amount`
- `status` (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)
- `order_time`, `delivery_time`
- `created_at`, `updated_at`

### Order Items Table
- `id` (Primary Key)
- `order_id` (Foreign Key to food_orders)
- `menu_item_id` (Foreign Key to menu_items)
- `quantity`, `price`
- `created_at`

### Parcel Deliveries Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `driver_id` (Foreign Key to users)
- `sender_name`, `sender_phone`, `sender_address`
- `recipient_name`, `recipient_phone`, `recipient_address`
- `package_type`, `weight`, `dimensions`
- `delivery_instructions`
- `cost`
- `status` (pending, confirmed, picked_up, in_transit, delivered, cancelled)
- `pickup_time`, `delivery_time`
- `created_at`, `updated_at`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Taxi Bookings
- `GET /api/taxi/bookings` - Get user's bookings
- `POST /api/taxi/bookings` - Create new booking
- `GET /api/taxi/bookings/:id` - Get specific booking

### Restaurants & Food
- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant (admin only)
- `GET /api/restaurants/:id` - Get specific restaurant
- `GET /api/restaurants/:id/menu` - Get restaurant menu
- `POST /api/restaurants/:id/menu` - Add menu item (admin only)

### Food Orders
- `GET /api/food/orders` - Get user's orders
- `POST /api/food/orders` - Create new order
- `GET /api/food/orders/:id` - Get specific order

### Parcel Deliveries
- `GET /api/parcel/deliveries` - Get user's deliveries
- `POST /api/parcel/deliveries` - Create new delivery
- `GET /api/parcel/deliveries/:id` - Get specific delivery

## Sample Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: `admin` / `admin123`
- **Customer**: `customer` / `customer123`
- **Driver**: `driver` / `driver123`

## Development Commands

```bash
# Start development server
npm run dev

# Generate new migration
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Build for production
npm run build
```

## Production Deployment

1. Set up production database
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Optionally seed data: `npm run db:seed`
5. Build and start: `npm run build && npm start`

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Input validation with Zod
- SQL injection protection with Drizzle ORM

## Troubleshooting

1. **Database Connection Issues**: Verify `DATABASE_URL` is correct
2. **Migration Errors**: Check if database exists and is accessible
3. **Authentication Issues**: Ensure `SESSION_SECRET` is set
4. **Permission Errors**: Check user roles and authentication middleware

For more help, check the server logs and database connection status.
