# Wserver API Documentation

This document describes the Wserver management API endpoints for the MeoPanel application.

## Overview

The Wserver API provides CRUD operations for managing wserver configurations. All endpoints require authentication and ADMIN/OWNER role permissions.

## Base URL
```
/api/wservers
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Get All Wservers

Retrieve a list of all wservers.

**Endpoint:** `GET /wservers`

**Response:**
```json
{
  "message": "Wservers retrieved successfully",
  "data": [
    {
      "id": "uuid-string",
      "servername": "Server Name",
      "url": "https://example.com",
      "uuid": "unique-identifier",
      "token": "secure-token",
      "created_at": "2025-12-27T10:00:00.000Z",
      "updated_at": "2025-12-27T10:00:00.000Z"
    }
  ]
}
```

### Get Wserver by ID

Retrieve a specific wserver by its server-uuid.

**Endpoint:** `GET /wservers/:id`

**Parameters:**
- `id` (path): Server UUID

**Response:**
```json
{
  "message": "Wserver retrieved successfully",
  "data": {
    "id": "uuid-string",
    "servername": "Server Name",
    "url": "https://example.com",
    "uuid": "unique-identifier",
    "token": "secure-token",
    "created_at": "2025-12-27T10:00:00.000Z",
    "updated_at": "2025-12-27T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Wserver with ID uuid-string not found"
}
```

### Create Wserver

Create a new wserver configuration.

**Endpoint:** `POST /wservers`

**Request Body:**
```json
{
  "servername": "My Server",
  "url": "https://api.example.com",
  "uuid": "unique-server-uuid",
  "token": "secure-authentication-token"
}
```

**Validation:**
- `servername`: Required, string, max 255 characters
- `url`: Required, valid URL format, max 500 characters
- `uuid`: Required, string, max 255 characters, must be unique
- `token`: Required, string, max 500 characters

**Response:**
```json
{
  "message": "Wserver created successfully",
  "data": {
    "id": "auto-generated-uuid",
    "servername": "My Server",
    "url": "https://api.example.com",
    "uuid": "unique-server-uuid",
    "token": "secure-authentication-token",
    "created_at": "2025-12-27T10:00:00.000Z",
    "updated_at": "2025-12-27T10:00:00.000Z"
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "statusCode": 400,
  "message": [
    "url must be a valid URL"
  ],
  "error": "Bad Request"
}
```

### Update Wserver

Update an existing wserver configuration.

**Endpoint:** `PUT /wservers/:id`

**Parameters:**
- `id` (path): Server UUID

**Request Body:**
```json
{
  "servername": "Updated Server Name",
  "url": "https://updated.example.com",
  "uuid": "new-unique-uuid",
  "token": "new-secure-token"
}
```

**Validation:**
- All fields are optional
- Same validation rules as create apply when fields are provided
- `uuid` must be unique across all wservers (except current one)

**Response:**
```json
{
  "message": "Wserver updated successfully",
  "data": {
    "id": "uuid-string",
    "servername": "Updated Server Name",
    "url": "https://updated.example.com",
    "uuid": "new-unique-uuid",
    "token": "new-secure-token",
    "created_at": "2025-12-27T10:00:00.000Z",
    "updated_at": "2025-12-27T11:00:00.000Z"
  }
}
```

### Delete Wserver

Delete a wserver configuration.

**Endpoint:** `DELETE /wservers/:id`

**Parameters:**
- `id` (path): Server UUID

**Response:**
```json
{
  "message": "Wserver deleted successfully"
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Wserver with ID uuid-string not found"
}
```

## Security Notes

- The `uuid` field is marked as unique and should not be leaked in logs or error messages
- The `token` field contains sensitive authentication data
- All operations require ADMIN or OWNER role permissions
- JWT authentication is mandatory for all endpoints

## Database Schema

```sql
CREATE TABLE wservers (
  server_uuid VARCHAR(36) PRIMARY KEY,
  servername VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);