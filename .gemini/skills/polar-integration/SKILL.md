---
name: polar-integration
description: Integrating Polar.sh monetization (subscriptions, checkouts, webhooks) into the .NET, Go, and Angular workspace. Use this when adding payment features or managing user subscriptions.
---

# Polar Integration Skill

This skill provides specialized knowledge for integrating [Polar.sh](https://polar.sh) into this template's multi-stack architecture.

## Workflow

1.  **Configure Environment**: Add `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` to your `.env` or Aspire `AppHost`.
2.  **Implementation**: Choose the relevant stack for implementation:
    - **Go Backend**: Use the `polar-go` SDK. See [references/go-integration.md](references/go-integration.md).
    - **.NET Backend**: Use `HttpClient` with the REST API. See [references/dotnet-integration.md](references/dotnet-integration.md).
    - **Angular Frontend**: Use the `@polar-sh/sdk` or embedded checkouts. See [references/angular-integration.md](references/angular-integration.md).
3.  **Sync State**: Implement webhooks to keep your local database in sync with Polar's subscription state. See [references/webhooks.md](references/webhooks.md).

## Best Practices

- **Sandbox First**: Always use `https://sandbox-api.polar.sh/v1` during development.
- **Idempotency**: Webhooks can be delivered multiple times. Ensure your webhook handlers are idempotent.
- **Metadata**: Use the `metadata` field in checkouts/subscriptions to link Polar objects to your local User IDs.
