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
	"github.com/tempoodev/reformaos/api/internal/property"
	"github.com/tempoodev/reformaos/api/internal/renovation"
	"github.com/tempoodev/reformaos/api/internal/storage"
	"github.com/tempoodev/reformaos/api/internal/auth"
	"github.com/tempoodev/reformaos/api/internal/user"
)

func main() {
	// Load Configuration
	cfg := config.LoadConfig()

	// Initialize Configs
	config.InitDB(cfg)
	config.InitMinio(cfg)

	// Run Migrations
	err := config.DB.AutoMigrate(
		&user.User{},
		&property.Property{},
		&user.PropertyAssignment{},
		&mortgage.MortgageProposal{},
		&renovation.RenovationProposal{},
		&phase.Phase{},
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
	propertyHandler := property.NewHandler()
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
	api.Use(auth.MockAuthMiddleware)
	api.Use(auth.RequirePropertyAccess)

	// Properties
	api.POST("/properties", propertyHandler.Create)
	api.GET("/properties", propertyHandler.GetAll)
	api.GET("/properties/:id", propertyHandler.GetByID)
	api.PUT("/properties/:id", propertyHandler.Update, auth.RequireRole(auth.RoleOwner))

	// Phases
	api.GET("/properties/:propertyId/phases", phaseHandler.GetByProperty)
	api.POST("/properties/:propertyId/phases", phaseHandler.Create)
	api.PUT("/phases/:id", phaseHandler.Update)
	api.PUT("/properties/:propertyId/phases/batch", phaseHandler.BatchUpdate)

	// Mortgages
	api.GET("/properties/:propertyId/mortgages", mortgageHandler.GetByProperty)
	api.POST("/properties/:propertyId/mortgages", mortgageHandler.Create)

	// Renovations
	api.GET("/properties/:propertyId/renovations", renovationHandler.GetByProperty)
	api.POST("/properties/:propertyId/renovations", renovationHandler.Create, auth.RequireRole(auth.RoleOwner))

	// Gallery
	api.GET("/properties/:propertyId/gallery", galleryHandler.GetFolders)
	api.POST("/properties/:propertyId/gallery", galleryHandler.CreateFolder)
	api.GET("/gallery/:folderId/photos", galleryHandler.GetPhotosByFolder)
	api.POST("/properties/:propertyId/gallery/:folderId/photos", galleryHandler.UploadPhoto)
	api.PUT("/gallery/photos/:id", galleryHandler.UpdatePhoto)

	// Documents
	api.GET("/properties/:propertyId/documents", documentHandler.GetByProperty)
	api.POST("/properties/:propertyId/documents", documentHandler.Upload)

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
	config.DB.Model(&property.Property{}).Count(&count)
	if count == 0 {
		log.Println("Seeding initial data...")

		// Users
		owner := user.User{ID: "USR-OWNER", Email: "dueno@reformaos.com", Role: auth.RoleOwner}
		architect := user.User{ID: "USR-ARCH", Email: "arquitecto@reformaos.com", Role: auth.RoleArchitect}
		manager := user.User{ID: "USR-MGR", Email: "gestor@reformaos.com", Role: auth.RoleManager}
		
		config.DB.Create(&owner)
		config.DB.Create(&architect)
		config.DB.Create(&manager)

		p := property.Property{
			ID:                 "PRJ-1",
			Name:               "Casa Arroyo",
			Address:            "Calle Jardines, 3 Sedella",
			Bucket:             "reforma-arroyo",
			OwnerID:            owner.ID,
			CadastralReference: "9876543AA1234B0001XY",
		}
		config.DB.Create(&p)

		// Assignments
		assignments := []user.PropertyAssignment{
			{ID: "ASG-1", UserID: owner.ID, PropertyID: p.ID, Role: auth.RoleOwner},
			{ID: "ASG-2", UserID: architect.ID, PropertyID: p.ID, Role: auth.RoleArchitect},
			{ID: "ASG-3", UserID: manager.ID, PropertyID: p.ID, Role: auth.RoleManager},
		}
		config.DB.Create(&assignments)

		// Create default folders
		f := gallery.PhotoFolder{
			ID:         "fotos-del-antes",
			PropertyID: p.ID,
			Name:       "FOTOS DEL ANTES",
			CoverURL:   "",
		}
		config.DB.Create(&f)

		// Create initial phases
		phases := []phase.Phase{
			{ID: "PHS-1", PropertyID: p.ID, Name: "Fase 1: Demolición", Progress: 100, Status: config.PhaseStatusCompleted},
			{ID: "PHS-2", PropertyID: p.ID, Name: "Fase 2: Estructura", Progress: 35, Status: config.PhaseStatusInProgress},
			{ID: "PHS-3", PropertyID: p.ID, Name: "Fase 3: Instalaciones", Progress: 0, Status: config.PhaseStatusPending},
			{ID: "PHS-4", PropertyID: p.ID, Name: "Fase 4: Acabados", Progress: 0, Status: config.PhaseStatusPending},
		}
		config.DB.Create(&phases)

		// Ensure bucket exists in Minio
		err := config.EnsureBucketExists(context.Background(), p.Bucket)
		if err != nil {
			log.Printf("Warning: Could not create bucket %s: %v\n", p.Bucket, err)
		}
	} else {
		// Even if property exists, ensure bucket policy is set (useful for existing dev env)
		_ = config.EnsureBucketExists(context.Background(), "reforma-arroyo")
	}
}
