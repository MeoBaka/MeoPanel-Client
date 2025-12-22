# Auth API Documentation

This document provides guidance on how to use the Authentication API endpoints.

## Base URL
Assuming the service is running on `http://localhost:3000`, all endpoints are prefixed with `/auth`.

## Endpoints

### 1. Register a New User
- **Method**: POST
- **URL**: `/auth/register`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }
  ```
- **Notes**: `username`, `email`, and `password` are required. `name` is optional. Password will be hashed before storage.
- **Response**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```
- **Status Codes**: 201 (Created), 400 (Bad Request), 409 (Conflict - User already exists)

### 2. Login
- **Method**: POST
- **URL**: `/auth/login`
- **Request Body** (without 2FA):
  ```json
  {
    "usernameOrEmail": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Request Body** (with 2FA):
  ```json
  {
    "usernameOrEmail": "johndoe",
    "password": "securepassword123",
    "twoFactorCode": "123456"
  }
  ```
- **Notes**: Can login with either `username` or `email`. If 2FA is enabled, `twoFactorCode` is required. Returns access and refresh tokens, or requires 2FA verification.
- **Response** (successful login):
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2023-12-22T10:00:00.000Z",
      "updated_at": "2023-12-22T10:00:00.000Z"
    }
  }
  ```
- **Response** (2FA required):
  ```json
  {
    "requiresTwoFactor": true,
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Two-factor authentication required"
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid credentials or 2FA code)

### 3. Refresh Access Token
- **Method**: POST
- **URL**: `/auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Notes**: Use the refresh token obtained from login to get new access and refresh tokens.
- **Response**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid or expired refresh token)

### 4. Verify Email
- **Method**: POST
- **URL**: `/email-verification/verify`
- **Request Body**:
  ```json
  {
    "token": "long_verification_token_from_registration"
  }
  ```
- **Notes**: Uses the verification token logged to console during registration. Token expires after 24 hours.
- **Response**:
  ```json
  {
    "message": "Email verified successfully"
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid or expired token)

### 5. Resend Verification Email
- **Method**: POST
- **URL**: `/email-verification/resend`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Notes**: Generates a new verification token if the user's email is not verified. Deletes any existing tokens for the user.
- **Response**:
  ```json
  {
    "message": "Verification token sent. Please check console for the token."
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - User not found), 409 (Conflict - Email already verified)

### 6. Forgot Password
- **Method**: POST
- **URL**: `/auth/forgot-password`
- **Request Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Notes**: Generates a password reset token and logs it to console. Token expires after 1 hour.
- **Response**:
  ```json
  {
    "message": "If the email exists, a password reset link has been sent."
  }
  ```
- **Status Codes**: 200 (OK)

### 7. Reset Password
- **Method**: POST
- **URL**: `/auth/reset-password`
- **Request Body**:
  ```json
  {
    "token": "password_reset_token_from_console",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Notes**: Uses the reset token from forgot password to set a new password.
- **Response**:
  ```json
  {
    "message": "Password has been reset successfully"
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid or expired token)

### 8. Change Password
- **Method**: POST
- **URL**: `/auth/change-password`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "currentPassword": "currentpassword123",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Notes**: Requires authentication. Verifies current password before changing to new password. Invalidates all existing sessions for security.
- **Response**:
  ```json
  {
    "message": "Password changed successfully. Please login again."
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid current password or token)

### 9. Logout
- **Method**: POST
- **URL**: `/auth/logout`
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_from_login"
  }
  ```
- **Notes**: Invalidates the specific refresh token, preventing it from being used to get new access tokens.
- **Response**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Status Codes**: 200 (OK)

### 10. Logout from All Devices
- **Method**: POST
- **URL**: `/auth/logout-all`
- **Headers**: `Authorization: Bearer <access_token>`
- **Notes**: Requires authentication. Invalidates all refresh tokens for the user, logging them out from all devices.
- **Response**:
  ```json
  {
    "message": "Logged out from all devices successfully"
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid token)

### 11. Setup Two-Factor Authentication
- **Method**: POST
- **URL**: `/auth/2fa/setup`
- **Headers**: `Authorization: Bearer <access_token>`
- **Notes**: Generates TOTP secret and backup codes. Returns base64 QR code for easy display.
- **Response**:
  ```json
  {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request - 2FA already enabled), 401 (Unauthorized)

### 12. Verify and Enable Two-Factor Authentication
- **Method**: POST
- **URL**: `/auth/2fa/verify`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "token": "123456"
  }
  ```
- **Notes**: Verifies the TOTP token from authenticator app and enables 2FA. Returns backup codes for secure storage.
- **Response**:
  ```json
  {
    "message": "Two-factor authentication enabled successfully",
    "backupCodes": ["ABC123", "DEF456", "GHI789", "JKL012", "MNO345", "PQR678", "STU901", "VWX234", "YZA567", "BCD890"]
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized - Invalid token)

### 13. Disable Two-Factor Authentication
- **Method**: POST
- **URL**: `/auth/2fa/disable`
- **Headers**: `Authorization: Bearer <access_token>`
- **Notes**: Disables 2FA and removes secret and backup codes.
- **Response**:
  ```json
  {
    "message": "Two-factor authentication disabled successfully"
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

### 14. Regenerate Backup Codes
- **Method**: POST
- **URL**: `/auth/2fa/regenerate-backup`
- **Headers**: `Authorization: Bearer <access_token>`
- **Notes**: Generates new backup codes, replacing existing ones.
- **Response**:
  ```json
  {
    "backupCodes": ["XYZ789", "ABC123", "DEF456", ...]
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request - 2FA not enabled), 401 (Unauthorized)

### 15. Get Two-Factor Authentication Status
- **Method**: POST
- **URL**: `/auth/2fa/status`
- **Headers**: `Authorization: Bearer <access_token>`
- **Notes**: Returns the current 2FA status for the user.
- **Response**:
  ```json
  {
    "isEnabled": true,
    "isSetup": true,
    "backupCodesCount": 8
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized)

### 16. Get Current User Profile
- **Method**: POST
- **URL**: `/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Notes**: Requires valid access token in Authorization header. Returns the authenticated user's profile.
- **Response**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "emailVerifiedAt": "2023-12-22T10:30:00.000Z",
    "created_at": "2023-12-22T10:00:00.000Z",
    "updated_at": "2023-12-22T10:00:00.000Z"
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized - Invalid or missing token)

## Token Information

### Access Token
- **Expiration**: 1 hour
- **Usage**: Include in `Authorization: Bearer <token>` header for protected endpoints
- **Payload**: Contains user ID and username

### Refresh Token
- **Expiration**: 7 days
- **Usage**: Used to obtain new access/refresh token pairs
- **Storage**: Should be stored securely (e.g., httpOnly cookie in production)

## Authentication Flow

1. **Registration**: User registers with username, email, and password
   - System generates email verification token (logged to console)
   - User account is created but email is unverified
2. **Email Verification**: User verifies email using the token from registration
   - `email_verified_at` timestamp is set
   - Verification token is deleted
3. **Two-Factor Authentication Setup** (Optional): User can enable 2FA
   - Generate TOTP secret and backup codes
   - Scan QR code with authenticator app
   - Verify setup with initial TOTP code
4. **Login**: User logs in with username/password
   - If 2FA enabled, additional TOTP code or backup code required
   - Returns access and refresh tokens upon successful authentication
5. **API Access**: Include access token in Authorization header
6. **Token Refresh**: When access token expires, use refresh token to get new tokens
7. **Password Management**: User can reset forgotten passwords or change current password
8. **Logout**: Invalidate refresh tokens to prevent further token refresh

## Two-Factor Authentication (2FA)

Two-factor authentication adds an extra layer of security by requiring a time-based one-time password (TOTP) from an authenticator app in addition to the password.

### 2FA Setup Process:
1. User calls `/auth/2fa/setup` to get QR code URL (secret not exposed)
2. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
3. User calls `/auth/2fa/verify` with first TOTP code to enable 2FA
4. System enables 2FA and returns 10 backup codes for secure storage

### 2FA Login Process:
1. User provides username/email and password
2. If 2FA enabled, system responds with `requiresTwoFactor: true`
3. User provides TOTP code from authenticator app
4. System verifies code and completes login

### Backup Codes:
- 10 single-use codes generated during setup
- Can be used instead of TOTP when authenticator is unavailable
- Each code is removed after use
- Can be regenerated with `/auth/2fa/regenerate-backup`

### Security Benefits:
- Protects against password breaches
- Requires physical access to authenticator device
- Backup codes provide recovery option
- TOTP codes expire every 30 seconds

## Password Management Flow

### Forgot Password
1. User requests password reset with email
2. System generates reset token (logged to console)
3. User receives token and uses it to reset password
4. Password is updated and old sessions are invalidated

### Change Password
1. Authenticated user provides current and new password
2. System verifies current password
3. Password is updated and all sessions are invalidated for security
4. User must login again with new password

### Logout
1. User sends refresh token to logout endpoint
2. System invalidates the refresh token
3. Token can no longer be used for refresh
4. Access token becomes unusable once expired

### Logout All Devices
1. Authenticated user requests logout from all devices
2. System invalidates all refresh tokens for the user
3. User is logged out from all devices/sessions
4. Must login again on each device

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens use HS256 algorithm
- Refresh tokens are stored in database with expiration
- Login attempts are logged with IP and user agent
- Failed login attempts can be tracked for security monitoring

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## Environment Variables

Make sure to set the following environment variables:

- `JWT_SECRET`: Secret key for JWT token signing (required)
- `DATABASE_URL`: Database connection string (required)

## Notes
- All requests should include `Content-Type: application/json` header
- Tokens should be stored securely on the client side
- Consider implementing rate limiting for auth endpoints
- In production, use HTTPS and secure cookie settings for refresh tokens