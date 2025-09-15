# Buyer Lead Management Application

A comprehensive Next.js 14+ buyer lead management application with PostgreSQL, Drizzle ORM, and modern authentication.

## Features

### Core Functionality
- **Lead Management**: Complete CRUD operations for buyer leads
- **Advanced Filtering**: Search, filter, and sort leads with URL synchronization
- **CSV Import/Export**: Bulk import/export with validation and error reporting
- **History Tracking**: Automatic audit trail for all lead changes
- **Magic Link Authentication**: Secure, passwordless authentication system

### User Interface
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Real-time Validation**: Client and server-side validation with immediate feedback

### Technical Features
- **Type Safety**: Full TypeScript implementation throughout
- **Database Migrations**: Automated schema management with Drizzle
- **Performance Optimization**: Server-side rendering and pagination
- **Error Handling**: Comprehensive error boundaries and validation

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with magic link
- **Validation**: Zod schemas
- **Styling**: Tailwind CSS + shadcn/ui
- **Type Safety**: TypeScript throughout

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Email service (Gmail, SendGrid, etc.)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your database URL, NextAuth secret, and email service credentials.

3. Run database migrations:
```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

4. Start the development server:
```bash
npm run dev
```

## Database Schema

### Buyers Table
- **id**: UUID primary key
- **fullName**: String (2-80 chars, required)
- **email**: Email format (optional)
- **phone**: String (10-15 digits, required)
- **city**: Enum (Chandigarh|Mohali|Zirakpur|Panchkula|Other)
- **propertyType**: Enum (Apartment|Villa|Plot|Office|Retail)
- **bhk**: Enum (1|2|3|4|Studio, conditional)
- **purpose**: Enum (Buy|Rent)
- **budgetMin/Max**: Integer (INR)
- **timeline**: Enum (0-3m|3-6m|>6m|Exploring)
- **source**: Enum (Website|Referral|Walk-in|Call|Other)
- **status**: Enum (New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
- **notes**: Text (max 1000 chars)
- **tags**: JSON string array
- **ownerId**: User reference
- **timestamps**: createdAt, updatedAt

### Buyer History Table
- **id**: UUID primary key
- **buyerId**: Foreign key to buyers
- **changedBy**: User ID who made changes
- **changedAt**: Timestamp
- **diff**: JSON object with old/new values

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Buyers
- `GET /api/buyers` - List buyers with pagination/filtering
- `POST /api/buyers` - Create new buyer
- `GET /api/buyers/[id]` - Get buyer details
- `PUT /api/buyers/[id]` - Update buyer
- `POST /api/buyers/import` - CSV import

## Features Implementation Status

### Core Requirements ✅
- [x] Next.js 14+ with App Router + TypeScript
- [x] PostgreSQL with Drizzle ORM and migrations
- [x] Zod validation (client + server)
- [x] Magic link authentication
- [x] Modern, responsive UI with Tailwind CSS

### Database Schema ✅
- [x] Complete buyers table implementation
- [x] buyer_history table with change tracking
- [x] All required enums and constraints
- [x] Proper indexing and relationships

### Pages & Features ✅
- [x] Create Lead Form (/buyers/new)
- [x] Buyers List (/buyers) with filtering/sorting
- [x] View/Edit Buyer (/buyers/[id])
- [x] CSV Import/Export functionality
- [x] Pagination and search

### Authentication & Authorization ✅
- [x] Magic link login system
- [x] Ownership-based permissions
- [x] Session management

### Additional Features ✅
- [x] Real-time form validation
- [x] History tracking with audit trail
- [x] Responsive design with mobile support
- [x] Loading states and error handling
- [x] CSV validation with detailed error reporting

### Quality Features ✅
- [x] TypeScript throughout
- [x] Accessibility features
- [x] Error boundaries
- [x] Proper validation schemas

## Design Decisions

### Architecture
- **App Router**: Chose Next.js App Router for better performance and developer experience
- **Server Components**: Used where possible to reduce client bundle size
- **API Routes**: RESTful API design with proper HTTP status codes

### Database
- **Drizzle ORM**: Selected for type safety and performance
- **UUID Primary Keys**: Better for distributed systems and security
- **JSON Fields**: Used for flexible tag storage and history diffs

### Authentication
- **Magic Links**: More secure than passwords, better UX
- **Session-based**: Server-side session management for security

### UI/UX
- **Mobile-first**: Responsive design prioritizing mobile experience
- **Optimistic Updates**: Better perceived performance
- **Inline Editing**: Reduced friction for quick updates

## Development Guide

### Adding New Fields
1. Update database schema in `src/lib/db/schema.ts`
2. Generate and run migration: `npx drizzle-kit generate:pg && npx drizzle-kit push:pg`
3. Update Zod validation in `src/lib/validations/buyer.ts`
4. Update form components and API handlers

### Testing
Run the included validation tests:
```bash
npm run test
```

### Deployment
The application is configured for static export and can be deployed to any hosting provider:
```bash
npm run build
```

## License

MIT License - feel free to use this project as a foundation for your own applications.