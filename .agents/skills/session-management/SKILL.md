---
name: session-management
description: Implementing a distributed session management system using Redis and OIDC/OAuth flows across .NET, Go, and Angular. Use this when setting up login, token validation, or cross-application session sharing.
---

# Session Management Skill

This skill provides the architecture and implementation patterns for a distributed session management system using Redis as the central token store.

## Workflow

1.  **Identity Provider Setup**: Designate or create a service to handle authentication (Go or .NET).
2.  **Redis Integration**: Use the shared Redis instance (configured in `AppHost`) to store session data. See [references/redis-session-store.md](references/redis-session-store.md).
3.  **Distributed Validation**: Implement middleware in every microservice to validate tokens against Redis. See [references/oidc-flow.md](references/oidc-flow.md).
4.  **Frontend Integration**: Set up Angular signals and interceptors to manage the token lifecycle. See [references/angular-auth.md](references/angular-auth.md).

## Key Patterns

- **Opaque Tokens**: Use random strings as keys in Redis for high security (revocable instantly).
- **JWT (Optional)**: If using JWTs, use Redis to store a "denylist" for revoked tokens or as a cache for user claims.
- **Aspire Integration**: Use `builder.AddRedis("redis")` in `AppHost` to ensure all services have the same connection string.

## Security Reminders

- Always use TLS for Redis in production.
- Set appropriate TTLs on session keys.
- Use `HttpOnly` cookies where possible to mitigate XSS.
