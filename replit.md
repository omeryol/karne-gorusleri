# Karne Görüşü Sistemi - Teacher Panel

## Overview

This is a modern web application designed for Turkish teachers to efficiently manage student report card comments. The system provides a user-friendly interface for creating, managing, and organizing student evaluations across different classes, sections, and semesters. The application is built as a full-stack solution with a React frontend and Express.js backend, designed to run on Replit's infrastructure.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme support (light/dark modes)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter (lightweight React router)
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Driver**: Neon Database serverless connection
- **Development**: Hot reload with Vite middleware integration
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

### Data Storage Solutions
- **Primary Storage**: Browser localStorage for complete client-side data persistence
- **Offline Capability**: Service Worker implementation for offline functionality
- **Data Structure**: JSON-based storage with type-safe schemas
- **PWA Support**: Manifest configuration for mobile app installation

## Key Components

### Database Schema
The application uses three main entities:
1. **Students**: Basic student information (name, class, section)
2. **Comments**: Report card comments with tone analysis and tagging
3. **Templates**: Reusable comment templates organized by category and tone

### Frontend Components
- **Layout System**: Responsive layout with collapsible sidebar
- **Theme Provider**: Dark/light mode toggle with system preference detection
- **Student Management**: CRUD operations for student records
- **Comment System**: Rich text comments with tone classification (positive, neutral, negative)
- **Template Library**: Pre-built comment templates for quick comment generation

### Authentication & Authorization
Currently implementing in-memory storage with plans for database-backed user management. The system is designed to support teacher-specific data isolation.

## Data Flow

1. **Student Management**: Teachers can add students individually or in bulk, organized by class and section
2. **Comment Creation**: Comments are linked to specific students, classes, and semesters with tone analysis
3. **Template System**: Teachers can use predefined templates or create custom comments
4. **Data Persistence**: All data is stored in PostgreSQL with client-side caching via localStorage
5. **Real-time Updates**: TanStack Query manages cache invalidation and optimistic updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting (with Turkish locale support)

### UI Dependencies
- **@radix-ui/***: Comprehensive UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Modern icon library

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with Express middleware
- **Hot Reload**: Enabled for both frontend and backend code

### Production Deployment
- **Build Process**: Vite builds the frontend, ESBuild bundles the backend
- **Deployment Target**: Replit Autoscale
- **Port Configuration**: Internal port 5000, external port 80
- **Asset Serving**: Static files served from Express with Vite-generated assets

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Environment**: DATABASE_URL environment variable for connection
- **Development**: `npm run db:push` for schema synchronization

## Recent Changes

### June 21, 2025 - Major Feature Updates
- Enhanced template system with 80 class-specific comment templates organized by grade (5-8) and semester (1-2)
- Added student name placeholder system with automatic first name extraction for personalized comments
- Implemented comprehensive navigation system with previous/next buttons for both students and comments
- Created ViewAllCommentsModal with advanced filtering by tone, category, and search functionality
- Enhanced UI with extensive animations, blur effects, and gradient designs
- Improved notification system with enhanced styling and animation effects
- Updated application branding from "Karne Görüşü Sistemi" to "Karne Asistanı"
- Added delete functionality for comments with confirmation
- Implemented responsive design improvements across all modals

### June 21, 2025 - Client-Side Only & Offline Functionality
- Converted application to work completely client-side without server dependencies
- Added Service Worker (sw.js) for offline functionality and PWA capabilities
- Implemented localStorage-based data persistence for students, comments, and templates
- Added PWA manifest with proper icons and configuration for mobile installation
- Fixed React key duplication warnings for stable rendering
- Configured application to work without internet connection
- Removed server-side data fetching dependencies

### Template Organization
- 5th Grade: 20 templates (10 per semester) covering mathematics, Turkish, science, and social studies
- 6th Grade: 20 templates with expanded subjects including English
- 7th Grade: 20 templates focusing on algebra, advanced Turkish, and physics concepts
- 8th Grade: 20 templates covering complex topics like functions, analytical geometry, and advanced sciences

### User Experience Enhancements
- Dynamic gradient backgrounds based on selected class and semester
- Comprehensive animation system with fade-in, slide-in, bounce-in, and hover effects
- Enhanced toast notifications with improved styling and blur effects
- Student and comment navigation within editing modals
- Real-time character counting (500 character limit maintained)
- Improved placeholder text showing selected student's first name

## Changelog

- June 21, 2025: Initial setup
- June 21, 2025: Enhanced template system, navigation features, and UI improvements

## User Preferences

Preferred communication style: Simple, everyday language.
Template requirements: Each class and semester needs separate template files with 10 different toned comments per file.
UI preferences: Extensive animations, blur effects, gradient designs, and enhanced visual feedback.
Navigation requirements: Previous/next buttons for students and comments, comprehensive filtering and search.