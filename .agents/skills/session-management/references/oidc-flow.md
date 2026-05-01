# OIDC/OAuth Flow in AspireNgGo

This reference describes the recommended flow for sharing sessions across the distributed stack.

## High-Level Architecture
1.  **Identity Provider (IDP)**: A central service (can be a Go microservice or .NET Identity) that handles authentication.
2.  **Tokens**: On successful login, the IDP generates an `access_token` (and optionally a `refresh_token`).
3.  **Session Mapping**: The IDP stores the `access_token` in Redis as a key, with user data as the value.

## Implementation Steps

### 1. Token Issuance
When a user logs in:
- Verify credentials.
- Generate a cryptographically secure random string (opaque token) or a JWT.
- Store user information in **Redis** with the token as the key.
- Return the token to the Angular frontend.

### 2. Service-to-Service Validation
When the Go or .NET backend receives a request with `Authorization: Bearer <token>`:
- Intercept the request.
- Check Redis for the existence of the token.
- If it exists, populate the request context with user claims.
- If not, return `401 Unauthorized`.

### 4. Refresh & Sliding Expiration
To maintain a high-quality user experience while preserving security:
- **Refresh Endpoint**: Provide a `/auth/refresh` endpoint that accepts a valid `access_token` (or a `refresh_token`) and issues a new one.
- **Frontend Logic**: The frontend should calculate the token's TTL and trigger a refresh call at the **50% mark** (half TTL).
- **Redis Update**: On refresh, the backend creates a new token in Redis, copies the session data, sets a new TTL, and deletes the old token (or lets it expire).
