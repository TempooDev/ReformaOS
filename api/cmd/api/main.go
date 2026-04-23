package main

import (
	"context"
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
	"github.com/tempoodev/reformaos/api/internal/storage"
)

func main() {
	// Load Configuration
	cfg := config.LoadConfig()

	// Initialize Configs
	config.InitDB(cfg)
	config.InitMinio(cfg)

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

	// Seed data if empty
	seedData()

	// Initialize Services & Handlers
	storageService := storage.NewMinioService()
	projectHandler := project.NewHandler()
	phaseHandler := phase.NewHandler()
	galleryHandler := gallery.NewHandler(storageService)
	mortgageHandler := mortgage.NewHandler(storageService)
	renovationHandler := renovation.NewHandler(storageService)
	documentHandler := document.NewHandler(storageService)

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Routes
	api := e.Group("/api")

	// Projects
	api.POST("/projects", projectHandler.Create)
	api.GET("/projects", projectHandler.GetAll)
	api.GET("/projects/:id", projectHandler.GetByID)

	// Phases
	api.GET("/projects/:projectId/phases", phaseHandler.GetByProject)
	api.POST("/projects/:projectId/phases", phaseHandler.Create)
	api.PUT("/phases/:id", phaseHandler.Update)
	api.PUT("/projects/:projectId/phases/batch", phaseHandler.BatchUpdate)

	// Mortgages
	api.GET("/projects/:projectId/mortgages", mortgageHandler.GetByProject)
	api.POST("/projects/:projectId/mortgages", mortgageHandler.Create)

	// Renovations
	api.GET("/projects/:projectId/renovations", renovationHandler.GetByProject)
	api.POST("/projects/:projectId/renovations", renovationHandler.Create)

	// Gallery
	api.GET("/projects/:projectId/gallery", galleryHandler.GetFolders)
	api.POST("/projects/:projectId/gallery", galleryHandler.CreateFolder)
	api.GET("/gallery/:folderId/photos", galleryHandler.GetPhotosByFolder)
	api.POST("/projects/:projectId/gallery/:folderId/photos", galleryHandler.UploadPhoto)
	api.PUT("/gallery/photos/:id", galleryHandler.UpdatePhoto)

	// Documents
	api.GET("/projects/:projectId/documents", documentHandler.GetByProject)
	api.POST("/projects/:projectId/documents", documentHandler.Upload)

	api.GET("/unidades", func(c echo.Context) error {
		unidades := []map[string]interface{}{
			{"id": 1, "nombre": "Calle Mayor 12", "presupuesto": 150000, "gastado": 42500, "estado": "en_obra"},
			{"id": 2, "nombre": "Apartamento Centro", "presupuesto": 80000, "gastado": 80000, "estado": "listo"},
			{"id": 3, "nombre": "Apartamento Norte", "presupuesto": 95000, "gastado": 95000, "estado": "alquilado"},
		}
		return c.JSON(http.StatusOK, unidades)
	})

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Start server
	e.Logger.Fatal(e.Start(":" + cfg.Port))
}

func seedData() {
	var count int64
	config.DB.Model(&project.Project{}).Count(&count)
	if count == 0 {
		log.Println("Seeding initial data...")
		p := project.Project{
			ID:     "reforma-arroyo",
			Name:   "Reforma Arroyo",
			Bucket: "reforma-arroyo",
		}
		config.DB.Create(&p)

		// Create default folders
		f := gallery.PhotoFolder{
			ID:        "fotos-del-antes",
			ProjectID: p.ID,
			Name:      "FOTOS DEL ANTES",
			CoverURL:  "",
		}
		config.DB.Create(&f)

		// Create initial phases
		phases := []phase.ProjectPhase{
			{ID: "PHS-1", ProjectID: p.ID, Name: "Fase 1: Demolición", Progress: 100, Status: config.PhaseStatusCompleted},
			{ID: "PHS-2", ProjectID: p.ID, Name: "Fase 2: Estructura", Progress: 35, Status: config.PhaseStatusInProgress},
			{ID: "PHS-3", ProjectID: p.ID, Name: "Fase 3: Instalaciones", Progress: 0, Status: config.PhaseStatusPending},
			{ID: "PHS-4", ProjectID: p.ID, Name: "Fase 4: Acabados", Progress: 0, Status: config.PhaseStatusPending},
		}
		config.DB.Create(&phases)

		// Ensure bucket exists in Minio
		err := config.EnsureBucketExists(context.Background(), p.Bucket)
		if err != nil {
			log.Printf("Warning: Could not create bucket %s: %v\n", p.Bucket, err)
		}
	} else {
		// Even if project exists, ensure bucket policy is set (useful for existing dev env)
		_ = config.EnsureBucketExists(context.Background(), "reforma-arroyo")
	}
}
