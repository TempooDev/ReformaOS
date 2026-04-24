package auth

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// MockAuthMiddleware sets the user role and ID in the context from headers
// In a real application, this would verify a JWT and fetch the user.
func MockAuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		role := c.Request().Header.Get("X-User-Role")
		id := c.Request().Header.Get("X-User-Id")
		
		if role == "" {
			role = RoleOwner // Default to OWNER for dev
		}
		if id == "" {
			id = "USR-1"
		}

		c.Set("userRole", role)
		c.Set("userId", id)
		return next(c)
	}
}

// RequireRole checks if the user has the required role
func RequireRole(roles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole := c.Get("userRole").(string)

			hasRole := false
			for _, r := range roles {
				if r == userRole {
					hasRole = true
					break
				}
			}

			// Dueño has full access implicitly
			if userRole == RoleOwner {
				hasRole = true
			}

			if !hasRole {
				return c.JSON(http.StatusForbidden, map[string]string{"error": "Access denied: insufficient permissions"})
			}
			return next(c)
		}
	}
}

// RequirePropertyAccess checks if the user has access to the property in the URL
// It assumes the URL has a :propertyId param
func RequirePropertyAccess(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		userRole := c.Get("userRole").(string)
		// userId := c.Get("userId").(string)
		// propertyId := c.Param("propertyId")

		// In a real app, query user.PropertyAssignment to verify if this user has access to propertyId.
		// For the OWNER, they can access anything or we query their own properties.
		// For Gestor and Arquitecto, we'd query the DB.

		// For now, we simulate success since we don't have the full session state in the DB yet
		if userRole == RoleManager {
			// Manager is read-only, we should block POST/PUT/DELETE
			if c.Request().Method != http.MethodGet {
				return c.JSON(http.StatusForbidden, map[string]string{"error": "Access denied: managers are read-only"})
			}
		}

		return next(c)
	}
}
