# ClassNet - Educational Platform

## Tech Stack

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://reactjs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb)](https://www.mongodb.com)
[![AWS S3](https://img.shields.io/badge/AWS_S3-2.0-blue?logo=amazon-aws)](https://aws.amazon.com/s3)

ClassNet is a modern educational platform connecting students and teachers with virtual classroom management capabilities.

## Features

- **Role-based Dashboard** (Student/Teacher/Admin)
- **Class Management System**
  - Scheduling
  - Enrollment
  - Monthly Payment
  - Materials Sharing
  - Assignments
  - Live and Pre-recorded Classes
  - Student Evaluation
- **AWS S3 Integration** for file storage
- **Dark/Light Mode** with theme toggle
- **Authentication** with NextAuth.js
- **Database Seeding** for development and testing

## Getting Started

### Prerequisites
- Spanish language (for the platform)
- Node.js 18+
- React.js 19+
- MongoDB Atlas or local instance
- AWS S3 bucket (for file storage)
- Google Cloud Platform (for authentication)

### Installation
```bash
git clone https://github.com/carlos-grullon/classnet.git
cd classnet
npm install
```

### Configuration
Create `.env` file:
```env
# App
NEXT_PUBLIC_APP_URL=your_app_url

# AWS
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id

# CRON
CRON_SECRET=your_cron_secret

# Email service variables
SMTP_PASS=your_smtp_pass
FROM_EMAIL=your_from_email
SMTP_USER=your_smtp_user
SMTP_SECURE=your_smtp_secure
SMTP_PORT=your_smtp_port
SMTP_HOST=your_smtp_host

# Google
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_ID=your_google_client_id

# JWT
JWT_SECRET=your_jwt_secret

# Mongodb
MONGO_URI=your_mongodb_uri
DATABASE_NAME=your_database_name
```

### Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
src/
├── app/              # App router routes
├── components/       # Reusable components
├── interfaces/       # TypeScript types
├── lib/              # Business logic
├── providers/        # Context providers
├── utils/            # Utility functions
```

## Documentation
- [Architecture Decision Records](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## Contributing
Pull requests are welcome! Please follow our [contribution guidelines](./CONTRIBUTING.md).

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.