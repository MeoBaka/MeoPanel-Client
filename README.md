# MeoPanel

A full-stack web application providing secure user authentication, management, and dashboard functionality with two-factor authentication support.

## Features

- **User Authentication**
  - User registration and login
  - JWT-based authentication with access and refresh tokens
  - Email verification system
  - Password reset functionality
  - Secure password change

- **Two-Factor Authentication (2FA)**
  - TOTP (Time-based One-Time Password) using authenticator apps
  - QR code generation for easy setup
  - Backup codes for recovery
  - Enable/disable 2FA functionality

- **Session Management**
  - Track active user sessions
  - Logout from specific devices
  - Logout from all devices

- **User Management**
  - User profiles with roles (MEMBER, ADMIN, OWNER)
  - User status management (Active, Unverified, Banned)
  - CRUD operations for users

- **Security Features**
  - Password hashing with bcrypt
  - Login attempt tracking
  - Audit logging
  - Rate limiting recommendations

- **Dashboard**
  - User dashboard interface
  - Settings management
  - Session overview

## Tech Stack

### Frontend
- **Next.js 14** - React framework for production
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **NestJS** - Node.js framework for scalable server-side applications
- **TypeORM** - TypeScript ORM for database operations
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **speakeasy** - TOTP implementation for 2FA
- **qrcode** - QR code generation

### Database
- **PostgreSQL** / **MySQL** / **MariaDB** - Relational databases
- **TypeORM Migrations** - Database schema management

### Development Tools
- **Turbo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Database: PostgreSQL, MySQL, or MariaDB

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MeoPanel-Client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/meopanel

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here

   # Other configurations as needed
   ```

4. **Set up the database**
   ```bash
   cd service
   npm run migration:run
   ```

## Usage

### Development

1. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start both the frontend (Next.js) and backend (NestJS) services using Turbo.

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production servers**
   ```bash
   npm run start
   ```

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/logout-all` - Logout from all devices
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/change-password` - Change password
- `GET /auth/me` - Get current user profile
- `GET /auth/sessions` - Get user sessions
- `POST /auth/logout-session` - Logout specific session

### Two-Factor Authentication
- `POST /auth/2fa/setup` - Setup 2FA
- `POST /auth/2fa/verify` - Verify and enable 2FA
- `POST /auth/2fa/disable` - Disable 2FA
- `POST /auth/2fa/regenerate-backup` - Regenerate backup codes
- `POST /auth/2fa/status` - Get 2FA status

### Email Verification
- `POST /email-verification/verify` - Verify email
- `POST /email-verification/resend` - Resend verification email

### User Management
- `GET /users` - Get all users
- `GET /users/:uuid` - Get user by UUID
- `POST /users` - Create user
- `PUT /users/:uuid` - Update user
- `DELETE /users/:uuid` - Delete user

For detailed API documentation, see:
- [Authentication API](docs/auth.md)
- [User API](docs/user.md)

## Project Structure

```
MeoPanel-Client/
├── front-end/          # Next.js frontend application
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # React components
│   │   └── contexts/   # React contexts
│   ├── package.json
│   └── tailwind.config.js
├── service/            # NestJS backend application
│   ├── src/
│   │   ├── auth/       # Authentication module
│   │   ├── user/       # User management module
│   │   ├── email-verification/ # Email verification
│   │   ├── twofa/      # Two-factor authentication
│   │   ├── entities/   # TypeORM entities
│   │   ├── dto/        # Data transfer objects
│   │   └── migrations/ # Database migrations
│   ├── package.json
│   └── typeorm.config.ts
├── docs/               # API documentation
├── package.json        # Root package.json for monorepo
├── turbo.json          # Turbo configuration
└── README.md
```

## Database Schema

The application uses TypeORM with the following main entities:
- **User** - User accounts with authentication details
- **AuthCredentials** - Authentication credentials
- **AuthSessions** - User sessions
- **TwoFactorAuth** - 2FA configuration
- **TwoFactorBackupCode** - Backup codes for 2FA
- **EmailVerificationTokens** - Email verification tokens
- **PasswordResetTokens** - Password reset tokens
- **AuditLogs** - Security audit logs

## Security Considerations

- Use HTTPS in production
- Store JWT secrets securely
- Implement rate limiting on authentication endpoints
- Regularly rotate JWT secrets
- Monitor failed login attempts
- Use secure cookies for refresh tokens
- Validate and sanitize all inputs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License - see the package.json files for details.

## Support

For support, please contact the development team or create an issue in the repository.