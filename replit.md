# FanDraft - Decentralized Fantasy Football Platform

## Overview

FanDraft is a blockchain-based fantasy football platform built on the Chiliz testnet. It allows users to create fantasy teams, participate in drafts, and win CHZ token rewards through smart contract-powered tournaments. The application combines traditional fantasy sports gameplay with decentralized blockchain technology to ensure transparent and fair competition.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Build Tool**: Vite for fast development and optimized production builds
- **Web3 Integration**: Ethers.js for blockchain interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: TSX for TypeScript execution in development

### Database Architecture
- **Primary Database**: PostgreSQL 16
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless connection for production

## Key Components

### Smart Contract Integration
- **Blockchain**: Chiliz testnet (Chain ID: 88882)
- **Contract Address**: `0x33033b2D6E540585a75f744e605F2E9406Be2910`
- **Token**: CHZ (native Chiliz token)
- **Features**: Draft creation, player selection, automatic prize distribution

### Database Schema
- **Users**: User accounts with wallet addresses
- **Players**: Football player database with stats and positions
- **Drafts**: Tournament information with entry fees and deadlines
- **Draft Entries**: User team selections for specific drafts
- **Leaderboard**: User performance tracking and earnings

### User Interface Components
- **Dashboard**: Main interface showing active drafts and stats
- **Player Selection Modal**: Interactive team building interface
- **Draft Cards**: Tournament display with real-time countdown timers
- **Leaderboard**: Rankings and user performance metrics
- **Wallet Integration**: MetaMask connection and CHZ balance display

## Data Flow

1. **User Authentication**: Users connect MetaMask wallet to access platform
2. **Draft Participation**: Users browse active drafts and select teams
3. **Team Selection**: Interactive modal for choosing players by position
4. **Blockchain Transaction**: Entry fee payment and team submission via smart contract
5. **Real-time Updates**: Live draft statistics and countdown timers
6. **Prize Distribution**: Automatic CHZ rewards based on performance

## External Dependencies

### Blockchain Dependencies
- **MetaMask**: Required wallet for user authentication
- **Chiliz Network**: Testnet for smart contract deployment
- **Ethers.js**: Blockchain interaction library

### UI/UX Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **React Hook Form**: Form validation and management

### Development Dependencies
- **Vite**: Frontend build tool with HMR
- **ESBuild**: Backend bundling for production
- **PostCSS**: CSS processing with Autoprefixer

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server on port 5000
- **Backend**: TSX execution with hot reload
- **Database**: Local PostgreSQL or Neon connection
- **Blockchain**: Chiliz testnet for testing

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Port Configuration**: External port 80 mapping to internal port 5000
- **Environment**: Node.js 20 with PostgreSQL 16 modules

### Database Management
- **Migrations**: Drizzle Kit push command for schema updates
- **Environment Variables**: DATABASE_URL for connection string
- **Backup**: Automatic Neon serverless backup and scaling

## Changelog

- June 25, 2025: Initial setup with complete fantasy football platform
- June 25, 2025: Fixed Chiliz testnet chain ID to 88882 and improved wallet connection error handling
- June 25, 2025: Added owner-only admin panel for creating drafts, managing entry fees, and withdrawing revenue
- June 25, 2025: Updated smart contract address to 0xFA81A5b5a9e0ebe9194d45b47ad553EE05AeEBD7
- June 25, 2025: Updated contract interface to use new getDraft function with participants and winners data
- June 25, 2025: Updated smart contract address to 0x33033b2D6E540585a75f744e605F2E9406Be2910

## User Preferences

Preferred communication style: Simple, everyday language.