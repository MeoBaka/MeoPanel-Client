# MeoPanel Frontend - Authentication Demo

A complete frontend implementation for the MeoPanel authentication system, built with Next.js and featuring comprehensive authentication flows including 2FA and password management.

## Features

### 🔐 Authentication
- User registration with email verification
- Login with username/email and password
- JWT-based session management
- Automatic token refresh

### 🔒 Security Features
- Two-Factor Authentication (2FA) with TOTP
- Backup codes for 2FA recovery
- Password reset functionality
- Change password with session invalidation
- Logout from single device or all devices

### 🎨 User Interface
- Clean, responsive design with Tailwind CSS
- Tabbed interface for different auth actions
- Real-time QR code display for 2FA setup
- Secure backup code display
- Comprehensive dashboard with user management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **API Communication**: Fetch API

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running on `http://localhost:5000` with CORS enabled

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Main page with auth routing
├── components/
│   ├── LoginPage.tsx        # Main login/register/forgot password page
│   ├── RegisterForm.tsx     # User registration form
│   ├── ForgotPasswordForm.tsx # Password reset request form
│   ├── TwoFactorForm.tsx    # 2FA code input during login
│   ├── Dashboard.tsx        # Main dashboard with tabs
│   ├── TwoFactorSetup.tsx   # 2FA setup and management
│   └── ChangePasswordForm.tsx # Password change form
└── contexts/
    └── AuthContext.tsx      # Authentication state management
```

## Authentication Flow

### 1. Registration
1. User fills registration form (username, email, password only)
2. Account is created (unverified)
3. Email verification token is logged to console
4. User must verify email before full access
5. Full name can be added later in profile settings

### 2. Login
1. User enters credentials
2. If 2FA enabled, prompted for TOTP code
3. Successful login receives JWT tokens
4. Automatic token refresh handling

### 3. Two-Factor Authentication
1. User enables 2FA in dashboard
2. QR code displayed for authenticator app
3. User enters verification code to enable
4. Backup codes provided for recovery

### 4. Password Management
- **Forgot Password**: Request reset token (logged to console)
- **Reset Password**: Use token to set new password
- **Change Password**: Authenticated users can change password

## API Integration

The frontend communicates with the backend API at `http://localhost:5000`. All authentication endpoints are handled through the `AuthContext`:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/me` - Get current user
- `POST /auth/logout` - Logout current session
- `POST /auth/logout-all` - Logout all sessions
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password
- `POST /email-verification/verify` - Verify email
- `POST /email-verification/resend` - Resend verification
- `POST /auth/2fa/setup` - Setup 2FA
- `POST /auth/2fa/verify` - Verify and enable 2FA
- `POST /auth/2fa/disable` - Disable 2FA
- `POST /auth/2fa/regenerate-backup` - New backup codes
- `POST /auth/2fa/status` - Get 2FA status

## Security Features

### Token Management
- Access tokens stored in localStorage
- Refresh tokens stored securely
- Automatic token refresh on expiry
- Secure logout with token invalidation

### 2FA Implementation
- TOTP using authenticator apps
- QR code generation for easy setup
- Backup codes for recovery
- Secure code verification

### Password Security
- Client-side validation
- Secure password change flow
- Session invalidation on password change

## Development Notes

### Environment Setup
- Backend must be running on port 5000 with CORS enabled
- JWT_SECRET must be configured in backend (.env file)
- Database must be set up with all migrations
- CORS is configured to allow http://localhost:3000

### Console Logging
- Email verification tokens are logged to browser console
- Password reset tokens are logged to browser console
- Check console for tokens during development

### Responsive Design
- Mobile-friendly interface
- Tailwind CSS for consistent styling
- Accessible form controls

## Testing the Application

1. **Registration**: Create a new account, check console for verification token
2. **Email Verification**: Use token to verify email
3. **Login**: Test normal login flow
4. **2FA Setup**: Enable 2FA, scan QR code, verify with code
5. **2FA Login**: Logout and login again to test 2FA requirement
6. **Password Reset**: Test forgot password flow
7. **Security**: Test logout from all devices, password changes

## Contributing

This is a demonstration application showcasing complete authentication flows. For production use, consider:

- Proper email service integration
- Rate limiting implementation
- Enhanced security measures
- Comprehensive error handling
- Unit and integration tests