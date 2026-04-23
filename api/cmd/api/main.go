package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/document"
	"github.com/tempoodev/reformaos/api/internal/gallery"
	"github.com/tempoodev/reformaos/api/internal/mortgage"
	"github.com/tempoodev/reformaos/api/internal/phase"
	"github.com/tempoodev/reformaos/api/internal/project"
	"github.com/tempoodev/reformaos/api/internal/renovation"
)

func main() {
	// Initialize Configs
	config.InitDB()
	config.InitMinio()

	// Run Migrations
	err := config.DB.AutoMigrate(
		&project.Project{},
		&mortgage.MortgageProposal{},
		&renovation.RenovationProposal{},
		&phase.ProjectPhase{},
		&gallery.PhotoFolder{},
		&gallery.Photo{},
		&document.DocumentOrInvoice{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Routes
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}
