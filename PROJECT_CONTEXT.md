# ClassNet - Project Context Document

This document provides a comprehensive overview of the ClassNet application architecture, components, and technical details. Share this document with AI assistants at the beginning of conversations to provide context about the project.

## Project Overview

ClassNet is a Next.js application for managing classes, enrollments, and educational content. The application uses a MongoDB database with both the native MongoDB driver and Mongoose for data access.

## Tech Stack

- **Frontend**: Next.js with React
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token) with jose library
- **Styling**: [Styling framework - to be filled]
- **Deployment**: [Deployment platform - to be filled]

## Project Structure

```
/src
├── app/                  # Next.js app directory (pages, layouts, etc.)
├── components/           # Reusable React components
├── context/              # React context providers
├── contexts/             # Additional context providers
├── hooks/                # Custom React hooks
├── interfaces/           # TypeScript interfaces
├── middleware.ts         # Next.js middleware
├── model/                # Mongoose models
├── providers/            # Provider components
├── server/               # Server-side code
├── services/             # Service layer
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── validations/          # Form and data validation
```

## Database Connection

The application connects to MongoDB using a singleton pattern implemented in `/src/utils/MongoDB.ts`. This ensures a single database connection is maintained throughout the application lifecycle.

Key features of the database connection:
- Connection pooling with cached connections
- Environment variable configuration (`MONGO_URI` and `DATABASE_NAME`)
- Automatic connection management
- Collection access utilities

## Data Models

### User Model
Users in the system can be students, teachers, or both, with the following structure:
- Basic information: username, email, password (hashed)
- Role flags: user_is_student, user_is_teacher
- Profile data: country, image_path, description
- Teacher-specific data: subjects, reviews, rating

### Class Model
Classes represent educational offerings with:
- Basic details: subject name, teacher name, level, price, max students
- Schedule: start/end times, selected days
- Status: Active ('A'), Inactive ('I'), or Completed ('C')
- References: teacher_id, subject_id

### Enrollment Model
Tracks student enrollment in classes with:
- References: student (ObjectId), class (ObjectId)
- Status: 'pending_payment', 'proof_submitted', 'enrolled', 'proof_rejected', 'cancelled', 'suspended_due_to_non_payment'
- Payment tracking: paymentAmount, paymentProof, priceAtEnrollment
- Billing information: billingStartDate, nextPaymentDueDate, lastPaymentDate
- Payment history: array of payment records with amount, date, proof URL, and status

## API Structure

The application includes the following API endpoints:

- **/api/auth**: Authentication-related endpoints including Google OAuth integration
- **/api/login**: User login endpoint
- **/api/logout**: User logout endpoint
- **/api/register**: User registration endpoint
- **/api/classes**: Class management endpoints
- **/api/student**: Student-specific endpoints
- **/api/teacher**: Teacher-specific endpoints
- **/api/subjects**: Subject management endpoints
- **/api/countries**: Country data endpoints
- **/api/upload-payment-proof**: Payment proof upload endpoint
- **/api/uploadpicture**: Profile picture upload endpoint
- **/api/usertype**: User type management endpoint

## Authentication Flow

The application uses JWT (JSON Web Token) for authentication, implemented with the jose library. The authentication flow works as follows:

1. **Login Process**:
   - User submits credentials via the login form
   - The `/api/login` endpoint verifies credentials using the `Login` function from `model/Auth.ts`
   - Upon successful authentication, a JWT token is generated containing user information (ID, roles, email, image)
   - The token is stored in an HTTP-only cookie named 'AuthToken' with a 7-day expiration

2. **Authorization**:
   - The middleware (`middleware.ts`) intercepts all requests
   - Public paths are accessible without authentication
   - For protected routes, the middleware verifies the JWT token
   - Users are redirected based on their role (student/teacher)
   - Users with both roles have access to all sections

3. **Registration**:
   - New users register via the `/api/register` endpoint
   - The system supports users having both student and teacher roles
   - Password hashing is handled by bcrypt via the `HashPassword` function

## Student Features

### Enrollment Process
Students can browse and enroll in classes through the following workflow:
1. Search for classes via `/student/searchclasses`
2. View class details including subject, teacher, schedule, and price
3. Enroll in a class, which creates an enrollment record with 'pending_payment' status
4. Upload payment proof for the initial enrollment fee
5. Once approved, the student's status changes to 'enrolled'

### Enrollment Management
Students can manage their enrollments through `/student/enrollments`:
- View all enrollments with their current status
- Track payment deadlines for pending payments
- View rejected payment proofs with rejection reasons
- Access detailed enrollment information

### Monthly Payment System
The application includes a comprehensive monthly payment system:
- Students can view their payment history and upcoming payment dates
- Upload payment proofs for monthly fees
- Track payment statuses (pending, paid, overdue, rejected)
- Receive notifications about payment deadlines and status changes

## Teacher Features

### Class Management
Teachers can create and manage classes through `/teacher/classes`:
- Create new classes with subject, schedule, pricing, and capacity details
- View all their classes with filtering by status
- Track student enrollment in each class
- View detailed student information for each class

### Class Lifecycle
Classes follow a defined lifecycle:
1. **Ready to Start**: Initial state after creation and student enrollment
2. **In Progress**: Active class with ongoing sessions and monthly payments
3. **Completed**: Class that has finished its duration
4. **Cancelled**: Class that was cancelled before completion

### Starting Classes
When a teacher starts a class:
- The class status changes to 'in_progress'
- The monthly payment system is activated for all enrolled students
- Payment due dates are calculated based on the class start date
- Students receive notifications about payment schedules

## Payment System

### Payment Workflow
The application implements a comprehensive payment system:
1. **Initial Enrollment Payment**:
   - Student uploads proof of payment for the enrollment fee
   - Admin reviews and approves/rejects the payment proof
   - Upon approval, student status changes to 'enrolled'

2. **Monthly Payments**:
   - System automatically calculates monthly payment due dates
   - Students receive notifications about upcoming payments
   - Students upload payment proofs before the due date
   - Admin reviews and approves/rejects monthly payment proofs
   - Payment history is maintained for each enrollment

### Payment Statuses
Payments can have the following statuses:
- **Pending**: Payment proof uploaded but not yet reviewed
- **Paid**: Payment approved by admin
- **Overdue**: Payment deadline passed without payment
- **Rejected**: Payment proof rejected by admin
- **Suspended Due to Non-Payment**: Enrollment suspended after missed payments

### Payment Components
The application includes specialized components for payment management:
- **MonthlyPaymentSection**: Displays payment history, upcoming payments, and allows proof uploads
- **PaymentModal**: Interface for uploading payment proofs with notes
- **ImageModal**: For viewing payment proof images with admin feedback

## User Interface Components

### Layout Components
- **Navbar**: Main navigation bar with user-specific links
- **SideMenu**: Context-specific navigation for different user roles
- **Card**: Container component for content sections
- **Modal**: Reusable modal dialog component

### Form Components
- **Input**: Text input fields with validation
- **Select**: Dropdown selection component
- **Textarea**: Multi-line text input
- **NumericInput**: Input for numeric values only
- **CurrencyInput**: Specialized input for currency amounts
- **DaysCheckboxGroup**: Component for selecting days of the week
- **CountrySelector**: Dropdown for country selection

### Specialized Components
- **ProfilePictureUploader**: Component for uploading and cropping profile pictures
- **SubjectSearch/Select**: Components for searching and selecting academic subjects
- **TeacherSearch**: Component for finding teachers by name or subject
- **Badge**: Visual indicator for status and categories
- **ThemeToggle**: Light/dark mode toggle

## Localization

The application is primarily in Spanish with:
- Spanish date formatting (e.g., "3/Junio/2025")
- Spanish day names (Lunes, Martes, etc.)
- Spanish status messages and UI text
- Currency formatting with various currency codes

## Key Components

The application includes reusable UI components:

- **Form Components**: Input, Select, Textarea, NumericInput, CurrencyInput
- **UI Elements**: Button, Card, Badge, Modal
- **Specialized Components**: 
  - CountrySelector: Country selection dropdown
  - DaysCheckboxGroup: Day selection for class schedules
  - ProfilePictureUploader: Image upload for profile pictures
  - PaymentModal: Payment processing interface
  - MonthlyPaymentSection: Monthly payment management
  - SubjectSearch/Select: Subject selection interfaces
  - TeacherSearch: Teacher search interface

## Utility Tools

The application includes several utility files that provide helper functions across different parts of the application:

### GeneralTools.ts

General-purpose formatting utilities:

- `formatDateLong`: Formats dates in Spanish with day, month name, and year (e.g., "3/Junio/2025")
- `formatCurrency`: Formats numbers as currency with thousand separators and optional currency symbol

### Tools.tsx

React-specific utility functions:

- `FetchData`: Wrapper for fetch API with error handling for API requests
- `SuccessMsj` and `ErrorMsj`: Toast notification functions for success and error messages
- `formatDate`: Date formatting in Spanish locale with time
- `handleInputChange`: Generic form input handler for React components
- `getDayName`: Converts day numbers to Spanish day names (e.g., "1" → "Lunes")
- `getLevelName`: Maps level codes to human-readable Spanish names (e.g., "1" → "Principiante")

### Tools.ts

Server-side utility functions:

- `GenerarUuid`: UUID generation
- `HashPassword` and `ComparePassword`: Password hashing and verification using bcrypt
- `getUserId` and `getSession`: Authentication utilities for extracting user information from JWT tokens
- `timeStringToMongoTime`: Converts time strings to MongoDB Date objects
- `mongoTimeToTimeString` and `mongoTimeToTimeString12h`: Convert MongoDB Date objects to formatted time strings

## Environment Variables

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `DATABASE_NAME`: Name of the MongoDB database (defaults to 'classnet_dev')
- [Other environment variables]

## Deployment Process

[Document deployment workflow]

## Common Tasks

[Document common development tasks and commands]

---

*This document should be updated as the project evolves. Share it with AI assistants at the beginning of conversations to provide context about the project structure and architecture.*
