# Sri Lankan Multi-Service Platform

## Overview

This is a comprehensive multi-service platform designed specifically for Sri Lanka, offering taxi booking, food delivery, parcel delivery, and breakdown services. The application is built as a full-stack web application using modern React and Express.js technologies, with a focus on local market needs and user experience.

## Recent Changes

### August 2025
- ✅ **AUTHENTICATION SYSTEM COMPLETELY FIXED**: Session management now works properly with session regeneration on login/register, proper cookie handling, and persistent user sessions across requests
- ✅ **SEPARATE ROLE-BASED DASHBOARD ROUTES CREATED**: Created dedicated dashboard pages and routes for each user role - /admin-dashboard, /driver-dashboard, /vendor-dashboard, /customer-dashboard with automatic redirection after login
- ✅ **GAMIFIED ACHIEVEMENT SYSTEM WITH DYNAMIC REWARD BADGES**: Complete achievement system with user progress tracking, dynamic badges, notification popups, leaderboards, and 25+ predefined achievements across 6 categories (Transportation, Food, Parcel, Social, Milestones, Excellence)
- ✅ **COMPREHENSIVE ROLE-BASED DASHBOARDS**: Complete dashboard system with enhanced Customer, Driver, Vendor, and Admin dashboards featuring comprehensive stats, real-time data, and role-specific functionality
- ✅ **ADMIN AUTHENTICATION SYSTEM FIXED**: Complete authentication system with admin secret code validation ('2025_RUNPICK_ADMIN'), password confirmation, and proper role-based access control
- ✅ **ANIMATED PROGRESS INDICATORS**: Real-time progress tracking system for taxi, food, and parcel services with animated visual feedback, driver information, and auto-progression
- ✅ **LIVE DRIVER NOTIFICATION SYSTEM**: Complete real-time driver notification system with WebSocket integration, popup notifications with ringtone, Accept/Reject buttons, and live order assignment
- ✅ **REAL-TIME ORDER WORKFLOW**: Comprehensive customer order processing with automatic driver assignment, radius-based search (2km to 10km expansion), and live booking management
- ✅ **WEBSOCKET INTEGRATION**: Full WebSocket server implementation for real-time communication between customers and drivers with connection management and message routing
- ✅ **DRIVER NOTIFICATION POPUP**: Interactive notification modal with countdown timer, service details, customer info, sound alerts, and immediate response handling
- ✅ **PERSONALIZED USER ONBOARDING TUTORIAL**: Interactive step-by-step tutorial system with role-based content (customer/driver/vendor), progress tracking, and smart tips
- ✅ **QUICK SERVICE SEARCH FUNCTIONALITY**: Global search feature with real-time results, filtering by service type, recent searches, and trending suggestions
- ✅ **DYNAMIC LOCATION-BASED RECOMMENDATIONS**: Intelligent service recommendations with confidence scoring, distance filtering, and real-time updates
- ✅ Enhanced database schema with serviceZones, locationRecommendations, and sample restaurant data across Sri Lankan cities
- ✅ **HERO SECTION REDESIGN**: Replaced gradient background with custom Run Pick branded background image for enhanced visual appeal
- ✅ Optimized service button images with larger icons (24px on mobile, 24px on desktop) and faster loading via eager loading and explicit dimensions
- ✅ Enhanced button styling with light yellow transparent backgrounds (#ffff7f/50) matching navbar branding
- ✅ Repositioned "SOON" labels to top-right corner with 45-degree rotation for modern design aesthetic  
- ✅ Updated platform badge to light yellow theme matching overall branding consistency
- ✅ Improved image loading performance and reduced layout shifts with width/height attributes
- ✅ **TAXI BOOKING SYSTEM ENHANCEMENT**: Complete Uber/Pickme-style multi-step booking flow with GPS location, styled inputs, quick location selection, and interactive map preview
- ✅ Fixed MapBox API integration with proper error handling and server-side token management for reliable map functionality
- ✅ **PARTNER APPLICATION SYSTEM**: Complete driver and restaurant application forms with multi-step validation, document upload, and comprehensive onboarding flow
- ✅ Fixed 404 errors for partner application pages with proper routing and navigation links

### July 2025
- ✅ **SECURITY FIX**: Updated Vite from 5.4.14 to 5.4.19 to patch CVE-2025-30208 vulnerability
- ✅ Fixed responsive authentication modal - properly centered on all devices
- ✅ Removed generic test credentials from UI for Chrome security compliance
- ✅ Implemented functional notification bell with live feed and real-time updates
- ✅ Added mobile-first navigation with bottom menu bar for mobile devices
- ✅ Updated all pages to support PWA/native app conversion with mobile responsive design
- ✅ Footer now hidden on mobile, navigation moved to bottom bar
- ✅ Modal animations and proper backdrop blur effects
- ✅ Comprehensive mobile bottom navigation with active state indicators
- ✅ Added desktop navigation menu with Home, Taxi, Food, Parcel, Breakdown, Dashboard
- ✅ Changed app background color to '#ffeed8' for better visual appeal
- ✅ Updated branding from 'ServiceLK' to 'Run Pick' throughout the application
- ✅ Added Truck icon for Parcel Delivery and fixed "Coming Soon" label positioning
- ✅ Created comprehensive role-based dashboards (Customer, Driver, Admin)
- ✅ Implemented Customer Dashboard with activity tracking and service history
- ✅ Built Driver Dashboard with ride requests, earnings, and trip management
- ✅ Developed Admin Dashboard with user management, approvals, and analytics
- ✅ Centered landing page content for desktop view with proper container alignment
- ✅ Fixed hero section background to span full device width edge-to-edge
- ✅ Enhanced database schema with vehicle types, driver status, and real-time tracking fields
- ✅ Implemented advanced ride booking system with interactive maps and vehicle selection
- ✅ Added real-time driver location tracking and nearest driver matching system
- ✅ Created comprehensive vehicle selector with multiple types (bike, tuk-tuk, car, van)
- ✅ Built interactive map component with Mapbox integration for route visualization
- ✅ Implemented driver dashboard with live map, ride requests, and earnings tracking
- ✅ Added distance calculation, fare estimation, and real-time location updates
- ✅ Enhanced customer dashboard with integrated ride booking functionality
- ✅ Implemented interactive map system for Food Delivery with restaurant locations and driver tracking
- ✅ Created comprehensive Parcel Tracking Map with real-time delivery progress and driver locations
- ✅ Added food delivery dashboard with restaurant selection, driver matching, and live order tracking
- ✅ Built parcel delivery system with live tracking, status updates, and driver assignment
- ✅ Enhanced both Food and Parcel services with tabbed interface including dedicated Map tabs
- ✅ Integrated real-time location tracking across all three services (Taxi, Food, Parcel)
- ✅ Redesigned home/landing page with professional trending fashion design
- ✅ Implemented modern gradient-based hero section with animated elements and glassmorphism effects
- ✅ Enhanced service cards with hover animations, gradient borders, and professional styling
- ✅ Added modern features section with gradient backgrounds and floating elements
- ✅ Integrated custom CSS animations including float, fade-up, and shimmer effects
- ✅ Applied mobile-first responsive design optimized for both web and native mobile app conversion
- ✅ Implemented Run Pick logo branding across all major UI components (navbar, footer, auth modal, hero section)
- ✅ Successfully resolved Mapbox integration issues with server-side token fetching system
- ✅ Added comprehensive loading states for all interactive map components across services
- ✅ Fixed JSX syntax errors and improved code structure for map components

### December 2024
- ✅ Successfully migrated project from Lovable to Replit environment
- ✅ Fixed routing system from React Router to wouter for Replit compatibility
- ✅ Resolved CSS compilation issues and responsive design
- ✅ Added PostgreSQL database with comprehensive schema
- ✅ Added "Breakdown Services" card with "Coming Soon!" badge
- ✅ Fixed responsive auth modal overflow issues
- ✅ Updated service grid to accommodate 4 services (2x2 grid on mobile, 4-column on desktop)

## User Preferences

Preferred communication style: Simple, everyday language.
Brand name: Run Pick (changed from ServiceLK)
Background color: #ffeed8 for body background
Design approach: Mobile-first responsive design with desktop menu navigation

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: React Context API for authentication, TanStack Query for server state
- **Routing**: React Router DOM for client-side navigation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the stack
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful API with `/api` prefix
- **Development**: Hot reloading with Vite integration

### Key Components

#### Authentication System
- Multi-role authentication (customer, driver, admin)
- Context-based state management
- Local storage for session persistence
- Role-based access control

#### Service Modules
1. **Taxi Booking**: Vehicle selection, driver matching, real-time tracking
2. **Food Delivery**: Restaurant browsing, menu management, order tracking
3. **Parcel Delivery**: Package sizing, pricing calculator, delivery scheduling

#### UI/UX Design
- Sri Lankan-focused design with local color scheme
- Mobile-first responsive layout with bottom navigation
- Custom CSS variables for theming
- Accessibility-compliant components
- PWA-ready design for native Android app conversion
- Functional notification system with live feed
- Centered modal positioning for all device sizes

## Data Flow

### Client-Server Communication
- HTTP requests for API communication
- Real-time updates capability (infrastructure ready)
- Form validation with React Hook Form and Zod
- Error handling with toast notifications

### Database Schema
- User management with role-based access
- Service-specific data models
- PostgreSQL with Drizzle ORM migrations
- Shared schema definitions between client and server

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **UI Framework**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Hookform Resolvers
- **Date Handling**: Date-fns
- **Development**: Replit-specific plugins for hot reloading

### Authentication & Security
- Password hashing and validation
- Session management with connect-pg-simple
- Role-based permissions system

## Deployment Strategy

### Development Environment
- Vite development server with hot reloading
- TypeScript compilation checking
- Replit-optimized development workflow
- Runtime error overlay for debugging

### Production Build
- Vite production build for client assets
- ESBuild for server bundling
- Static asset serving through Express
- Environment-based configuration

### Database Management
- Drizzle Kit for schema migrations
- Database push commands for schema updates
- PostgreSQL connection via DATABASE_URL environment variable

The application is structured as a monorepo with shared TypeScript types and utilities, enabling type safety across the entire stack while maintaining clear separation between client and server concerns.