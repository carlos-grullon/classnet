# ClassNet - Educational Platform

## Tech Stack

[![React](https://img.shields.io/badge/React-19.0.0-%2361DAFB?logo=react)](https://reactjs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.16.0-47A248?logo=mongodb)](https://www.mongodb.com)
[![AWS S3](https://img.shields.io/badge/AWS_SDK-3.830.0-FF9900?logo=amazon-aws)](https://aws.amazon.com/s3)

ClassNet solves the challenge of scattered online educational management by offering a modern, unified platform that connects students and teachers. It allows for intuitive and centralized virtual classroom administration, improving the remote learning experience.

## 🚀 Demonstration
![ClassNet Gif In Action](https://github.com/carlos-grullon/classnet/assets/101983513/2b6b6b6b-6b6b-4b6b-6b6b-6b6b6b6b6b6b)

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

## 🚀 Live Demo
You can test the platform in real time in our demo environment.

**Important!** ✨ This demo runs from the `test` branch, so it may include experimental features that are not yet in the stable version (`main`).

- **URL:** [https://test.classnet.org](https://test.classnet.org)
- **Teacher User:** `teacher@demo.com`
- **Password:** `123456`
- **Student User:** `student@demo.com`
- **Password:** `123456`
- **Admin User:** `admin@demo.com`
- **Password:** `123456`

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
# App Configuration
NEXT_PUBLIC_APP_URL=your_app_url

# AWS S3 to store files
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id

# Credentials for cron jobs
CRON_SECRET=your_cron_secret

# Email service variables (SMTP)
SMTP_PASS=your_smtp_pass
FROM_EMAIL=your_from_email
SMTP_USER=your_smtp_user
SMTP_SECURE=your_smtp_secure
SMTP_PORT=your_smtp_port
SMTP_HOST=your_smtp_host

# Google authentication
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_ID=your_google_client_id

# JWT Authentication (NextAuth)
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