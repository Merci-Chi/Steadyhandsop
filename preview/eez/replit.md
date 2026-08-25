# eez - Real-Time Collaborative Messaging

## Overview

eez is a real-time collaborative messaging application featuring character-by-character live typing indicators, collaborative document editing, and a water-inspired glass-morphism design aesthetic. The application draws inspiration from Slack's messaging structure and Discord's presence indicators.

The core functionality includes:
- Real-time messaging with WebSocket-based communication
- Live typing indicators showing character-by-character input
- Collaborative document editing with cursor presence
- User presence and online status tracking
- Channel-based conversation organization
- Light/dark theme support with glass-morphism UI effects

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, local React hooks for UI state
- **Styling**: Tailwind CSS with custom CSS variables for theming, glass-morphism effects
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for fluid animations and transitions
- **Fonts**: Inter for UI, JetBrains Mono for code/editor content

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Protocol**: HTTP for REST endpoints, WebSocket for real-time communication
- **WebSocket Server**: Native `ws` library integrated with HTTP server
- **Build System**: esbuild for server bundling, Vite for client bundling

### Real-Time Communication
- WebSocket-based bidirectional communication for:
  - User join/leave events
  - Message broadcasting
  - Character-by-character typing indicators
  - Cursor position synchronization in collaborative editor
  - Document content updates
- Message types defined in shared schema for type safety across client/server

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Current Storage**: In-memory storage implementation (`MemStorage`) for development
- **Tables**: Users, Channels, Messages, Documents
- **Validation**: Zod schemas generated from Drizzle schema via drizzle-zod

### Client-Server Communication Pattern
- Shared TypeScript types in `shared/` directory ensure type consistency
- WebSocket messages use discriminated union types for type-safe message handling
- REST-style API requests use the query client with centralized fetch wrapper

### Layout Structure
- Three-panel layout: Sidebar (channels/users) | Main Chat | Collaborative Editor (collapsible)
- Fixed 256px sidebar, flexible main area, 384px editor panel when expanded
- Responsive design with mobile breakpoint detection

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations and schema push (`db:push` script)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI/Component Libraries
- **Radix UI**: Full suite of accessible, unstyled primitives (dialog, dropdown, tooltip, etc.)
- **shadcn/ui**: Pre-built component patterns using Radix + Tailwind
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **cmdk**: Command palette component
- **Vaul**: Drawer component
- **react-day-picker**: Calendar/date picker

### Animation & Styling
- **Framer Motion**: Animation library for React
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Intelligent Tailwind class merging

### Form & Validation
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Validation resolver integration
- **Zod**: Schema validation library

### Real-Time
- **ws**: WebSocket implementation for Node.js server

### Date/Time
- **date-fns**: Date utility library for formatting timestamps

### Development Tools
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for Node.js
- **TypeScript**: Type checking across the codebase