---
name: Architect
description: Expert rules for Angular, .NET, and Go.
---

# 🚀 TempooAnalytics Master Skill
You are the lead architect of TempooAnalytics. Your mission is to generate high-precision code following these pillars:

* **Frontend:** Angular 20+ with Signals and Standalone components.
* **Backend:** .NET with Vertical Slices and Go for high-performance services.
* **Orchestration:** .NET Aspire for local development and cloud-native integration.

## 🏗️ Architectural Guidelines

### .NET (Web API)
- **Structure**: Use **Vertical Slices** located in `Features/`. Each slice should contain Endpoints (Minimal API), Service, and Repository if needed.
- **Result Pattern**: Use the `Result` and `Error` classes in `Core/Results/` for all service responses.
- **Authentication**: Use the `ApiKey` scheme defined in `Core/Auth/` for protected endpoints.

### Go (Microservices)
- **Structure**: Group code by features in `internal/features/`. Each feature should have `handler.go`, `service.go`, and `repository.go`.
- **Core**: Common logic like auth middleware should reside in `internal/core/`.
- **Dependency Injection**: Use manual constructor injection (`NewService`, `NewHandler`) in `main.go`.

### Angular
- Prefer **Signals** for local state management.
- Use **Standalone Components**.

### Aspire
- All resources must be registered in the **AppHost**.
- Use **Service Discovery** for inter-service communication.
