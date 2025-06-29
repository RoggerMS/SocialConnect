# CRUNEVO Educational Social Platform

## Overview

CRUNEVO is a modern educational social platform designed to help students share study materials, connect with peers, and earn rewards for academic contributions. The platform combines social networking features with educational content management, creating a gamified learning environment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state, React Context for auth
- **Routing**: Wouter for client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session management
- **File Handling**: Multer for file uploads with local storage
- **API Design**: RESTful API with JSON responses

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Session Store**: PostgreSQL-based session storage

## Key Components

### Authentication System
- Session-based authentication with secure password hashing (scrypt)
- Protected routes with middleware authentication checks
- User registration with profile information (career, full name)
- Planned Google OAuth integration

### Content Management
- **Notes System**: File upload and sharing with metadata (subject, tags, descriptions)
- **Social Posts**: Text-based posts with optional images
- **Comments**: Threaded commenting on both notes and posts
- **Likes System**: User engagement tracking for content

### Gamification Engine
- **Credits System**: Users earn credits for contributing content
- **Achievements**: Planned achievement system for user milestones
- **Leaderboards**: User ranking based on contributions and engagement

### User Interface
- **Responsive Design**: Mobile-first approach with three-column desktop layout
- **Component Library**: Consistent design system using Shadcn/ui
- **Real-time Updates**: Query invalidation for live content updates
- **File Handling**: Drag-and-drop file uploads with validation

## Data Flow

### Content Creation Flow
1. User uploads notes or creates posts through modal interfaces
2. Files are processed and stored locally with metadata extraction
3. Database records are created with author attribution
4. Credits are automatically awarded to the user
5. Content appears in the main feed with real-time updates

### Social Interaction Flow
1. Users can like/unlike posts and notes
2. Comments can be added to any content type
3. All interactions trigger credit adjustments
4. User statistics are updated in real-time
5. Leaderboards reflect current user standings

### Authentication Flow
1. Users register with username/password and profile information
2. Sessions are maintained server-side with PostgreSQL storage
3. Protected routes verify authentication before rendering
4. User context provides authentication state throughout the app

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **express**: Web framework for API server
- **passport**: Authentication middleware

### Development Tools
- **Vite**: Build tool with development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

### File Storage
- Local file system storage with plans for Cloudinary integration
- Multer middleware for handling multipart form uploads
- File type validation for security (PDF, DOC formats)

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server with middleware for API routes
- Database migrations managed through Drizzle Kit
- Environment-based configuration management

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express in production
- Database schema synchronization through migrations

### Hosting Architecture
- **Primary**: Configured for Fly.io deployment
- **Database**: Neon PostgreSQL serverless database
- **File Storage**: Local filesystem (planned Cloudinary migration)
- **Session Management**: PostgreSQL-backed session store

### Environment Configuration
- Database URL through environment variables
- Session secrets for security
- Development/production mode switching
- File upload directory configuration

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```