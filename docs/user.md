# User API Documentation

This document provides guidance on how to use the User API endpoints.

## Base URL
Assuming the service is running on `http://localhost:3000`, all endpoints are prefixed with `/users`.

## Endpoints

### 1. Create a User
- **Method**: POST
- **URL**: `/users`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe"
  }
  ```
- **Notes**: `username` and `email` are required. `name` is optional. `status` defaults to 0.
- **Response**:
  ```json
  {
    "message": "User created successfully",
    "data": { ...user object }
  }
  ```
- **Status Codes**: 201 (Created), 400 (Bad Request)

### 2. Get All Users
- **Method**: GET
- **URL**: `/users`
- **Response**:
  ```json
  {
    "message": "Users retrieved successfully",
    "data": [ ...user objects ]
  }
  ```
- **Status Codes**: 200 (OK)

### 3. Get a User by UUID
- **Method**: GET
- **URL**: `/users/:uuid`
- **Parameters**: `uuid` (string) - User UUID
- **Response**:
  ```json
  {
    "message": "User retrieved successfully",
    "data": { ...user object }
  }
  ```
- **Status Codes**: 200 (OK), 404 (Not Found)

### 4. Update a User
- **Method**: PUT
- **URL**: `/users/:uuid`
- **Parameters**: `uuid` (string) - User UUID
- **Request Body**: Partial user data to update.
  ```json
  {
    "name": "Jane Doe",
    "status": 0
  }
  ```
- **Response**:
  ```json
  {
    "message": "User updated successfully",
    "data": { ...updated user object }
  }
  ```
- **Status Codes**: 200 (OK), 404 (Not Found)

### 5. Delete a User
- **Method**: DELETE
- **URL**: `/users/:uuid`
- **Parameters**: `uuid` (string) - User UUID
- **Response**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- **Status Codes**: 200 (OK), 404 (Not Found)

## User Object Structure
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "email_verified_at": null,
  "status": 0,
  "login_failed": 0,
  "created_at": "2023-12-22T10:00:00.000Z",
  "updated_at": "2023-12-22T10:00:00.000Z"
}
```

## Status Values
- `0`: Unverified (email chưa được xác minh)
- `1`: Active (tài khoản hoạt động bình thường)
- `-1`: Banned (tài khoản bị cấm)

**Lưu ý**: Khi email được xác minh thành công, status sẽ tự động chuyển thành `1`. Admin có thể set status thành `-1` để cấm tài khoản.

## Notes
- All requests should include appropriate headers, such as `Content-Type: application/json`.
- Authentication may be required depending on your setup (check the AuthModule).
- Dates are in ISO 8601 format.