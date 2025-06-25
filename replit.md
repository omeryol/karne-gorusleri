# Karne Asistanı - Turkish Report Card Comment Assistant

## Overview

Karne Asistanı is a Turkish educational web application designed specifically for middle school teachers to generate and manage student report card comments. The application is built as a Progressive Web App (PWA) with offline capabilities, targeting Turkish teachers who need to create personalized student evaluations efficiently.

## System Architecture

The application follows a full-stack architecture with a clear separation between client and server:

**Frontend**: React with TypeScript using Vite as the build tool
**Backend**: Express.js with TypeScript 
**Database**: PostgreSQL with Drizzle ORM for database operations
**Styling**: Tailwind CSS with shadcn/ui components for a modern UI
**Deployment**: Configured for Replit with autoscale deployment

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Turkish education theme colors
- **PWA Features**: Service worker, manifest.json, and offline capabilities

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL adapter
- **Session Management**: Configured with connect-pg-simple for PostgreSQL sessions
- **API Structure**: RESTful API design with `/api` prefix

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Database Provider**: Configured for both Neon Database and local PostgreSQL
- **Migrations**: Drizzle Kit for database schema management

### PWA and Offline Features
- **Service Worker**: Caches static assets and API responses for offline use
- **Manifest**: Configured for Turkish locale with education app metadata
- **Offline Data**: Pre-loaded comment templates for grades 5-8, both semesters

## Data Flow

1. **Authentication Flow**: Users authenticate through the login system stored in PostgreSQL
2. **Comment Generation**: Teachers select grade level and semester to access pre-loaded comment templates
3. **Data Storage**: Student evaluations and custom comments stored in the database
4. **Offline Capability**: Comment templates cached locally for offline access
5. **PWA Installation**: Users can install the app on mobile devices for native-like experience

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Cloud PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components for accessibility
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database schema management

### Turkish Education Data
- **Comment Templates**: Pre-loaded JSON files for grades 5-8 with Turkish educational content
- **Grading System**: Designed for Turkish middle school grading standards
- **Language Support**: Full Turkish language support with proper typography

## Deployment Strategy

### Replit Configuration
- **Modules**: Node.js 20, Web server, PostgreSQL 16
- **Build Process**: Vite build for frontend, esbuild for backend
- **Port Configuration**: Local port 5000, external port 80
- **Auto-scaling**: Configured for production deployment with autoscale

### Environment Setup
- **Development**: Uses tsx for TypeScript execution
- **Production**: Compiled JavaScript with Node.js runtime
- **Database**: Environment variable-based connection string

### PWA Deployment
- **Static Assets**: Served through Express static middleware
- **Service Worker**: Caches critical resources for offline functionality
- **Manifest**: Configured for Turkish educational context

## Changelog

Changelog:
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.