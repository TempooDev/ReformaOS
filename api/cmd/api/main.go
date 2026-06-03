package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/tempoodev/reformaos/api/internal/auth"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/document"
	"github.com/tempoodev/reformaos/api/internal/expense"
	"github.com/tempoodev/reformaos/api/internal/gallery"
	"github.com/tempoodev/reformaos/api/internal/mortgage"
	"github.com/tempoodev/reformaos/api/internal/phase"
	"github.com/tempoodev/reformaos/api/internal/property"
	"github.com/tempoodev/reformaos/api/internal/renovation"
	"github.com/tempoodev/reformaos/api/internal/storage"
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
		&expense.Expense{},
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
	expenseHandler := expense.NewHandler(storageService)

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

	// Expenses
	api.GET("/properties/:propertyId/expenses", expenseHandler.GetByProperty)
	api.POST("/properties/:propertyId/expenses", expenseHandler.Create)
	api.PUT("/expenses/:id", expenseHandler.Update)
	api.DELETE("/expenses/:id", expenseHandler.Delete)

	api.GET("/units", func(c echo.Context) error {
		units := []map[string]interface{}{
			{"id": 1, "name": "Calle Mayor 12", "budget": 150000, "spent": 42500, "status": "under_construction"},
			{"id": 2, "name": "Apartamento Centro", "budget": 80000, "spent": 80000, "status": "ready"},
			{"id": 3, "name": "Apartamento Norte", "budget": 95000, "spent": 95000, "status": "rented"},
		}
		return c.JSON(http.StatusOK, units)
	})

	// Deprecated: use /api/units instead
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
	// Cleanup: Ensure all folders have IDs (fix for previous bug)
	// We check for empty strings, nulls, or zero values in ID
	var count_corrupt int64
	config.DB.Model(&gallery.PhotoFolder{}).Where("id = '' OR id IS NULL").Count(&count_corrupt)

	if count_corrupt > 0 {
		log.Printf("Found %d folders with invalid IDs. Running manual repair...\n", count_corrupt)
		var corruptFolders []gallery.PhotoFolder
		config.DB.Where("id = '' OR id IS NULL").Find(&corruptFolders)

		for _, f := range corruptFolders {
			newID := uuid.New().String()
			// Use Raw SQL to update records that have an empty primary key,
			// as GORM might struggle to identify which record to update if the PK is empty.
			// We target by name and property_id as a best-effort.
			config.DB.Exec("UPDATE photo_folders SET id = ? WHERE (id = '' OR id IS NULL) AND name = ? AND property_id = ?",
				newID, f.Name, f.PropertyID)
			log.Printf("Repaired folder: '%s' (Property: %s) -> New ID: %s\n", f.Name, f.PropertyID, newID)
		}
	}

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

		// Create initial phases
		phases := []phase.Phase{
			{ID: "PHS-1", PropertyID: p.ID, Name: "Phase 1: Demolition", Progress: 100, Status: config.PhaseStatusCompleted},
			{ID: "PHS-2", PropertyID: p.ID, Name: "Phase 2: Structure", Progress: 35, Status: config.PhaseStatusInProgress},
			{ID: "PHS-3", PropertyID: p.ID, Name: "Phase 3: Installations", Progress: 0, Status: config.PhaseStatusPending},
			{ID: "PHS-4", PropertyID: p.ID, Name: "Phase 4: Finishes", Progress: 0, Status: config.PhaseStatusPending},

		}
		config.DB.Create(&phases)

		// Ensure bucket exists in Minio
		err := config.EnsureBucketExists(context.Background(), p.Bucket)
		if err != nil {
			log.Printf("Warning: Could not create bucket %s: %v\n", p.Bucket, err)
		}

		// Seed Expenses
		expenses := []expense.Expense{
			{
				ID:         "EXP-1",
				PropertyID: p.ID,
				Title:      "Estructura de madera y pladur",
				Category:   "Materiales",
				Date:       time.Now().AddDate(0, 0, -15),
				Amount:     1240.50,
				Unit:       "Alquiler Diario",
				Status:     config.ExpenseStatusReconciled,
				Image:      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGlMcNpXnyfrTB30P5UsBl3PZu33vvrTRnE6kk0rp_SFh5CZUcFqN_8dnyhpqIG_5ZzGi988_2dp1TjCwXIzOBnGnGJTOLDtuPI-YwPJOUr5utca3N_eO_fevqQvkslm4VLO1103PTamVB8oEMj-Dj8ctnhg4rVDzA9-I-ZBLy-VmDkwkLX0KEzGNwwglGGsyxIv843YmzJH6QiVNjK8see8i5xfm1HZkgLcY300mltFSWrUYJBaN124eNJ_9joz6frixjksaQuuM",
				Pending:    false,
				Reconciled: true,
			},
			{
				ID:         "EXP-2",
				PropertyID: p.ID,
				Title:      "Pago IBI Trimestral",
				Category:   "Impuestos y Seguros",
				Date:       time.Now().AddDate(0, 0, -20),
				Amount:     4850.00,
				Unit:       "Mi Hogar",
				Status:     config.ExpenseStatusPending,
				Image:      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwaretED-lwSBj_27b9rwasOsHs1AlRW9p4tj7I7g7hFrtPRIMUdFXg1_kak2haoWdt4B9W61DTlYW4Ma9DQqj2W-ElbFeSglV-l5PTToYZUw8ctgPPETsKaqBF5mNMb2zCAgCAJbUpvMs8S-gAYoR1LjtaIMHiuGgnnVKdCKhTY5ika63mryIZp4_uMqCTN_ltHtXv7Pft3gkOjJQgBYPLt19IrA5XklgGFKt3u5QP31MJtYbidr96DcxLtcH30GbHFaxnjDFnW8",
				Pending:    true,
				Reconciled: false,
			},
			{
				ID:         "EXP-3",
				PropertyID: p.ID,
				Title:      "Iluminación Salón",
				Category:   "Materiales",
				Date:       time.Now().AddDate(0, 0, -25),
				Amount:     899.99,
				Unit:       "Alquiler Mensual",
				Status:     config.ExpenseStatusApproved,
				Image:      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbd8VgroFsMLBO3MEDiZ8FownQFNEnSY8IC6YB8jTc-W2wdNTUUl0jfWyD4cI7cwBnvjtxJiRDTCWaEzz_wYcjGZBiQX-RlV_kre3gT5zvXWXwPhANQKisuq2Xbf2Oai2Xn8ZkertNIA5xtYFxcBEbaT-kT7au3bpPNOg68ypEjiI30lBlybuguGBS5vQyZ8NwKJ060GQEPNpHOKP7J3cclc3PCAcBbzNG7NFbeFioTMnO7AiH9JFcyftB8fz__8qXRO4GLCtp-Ag",
				Pending:    false,
				Reconciled: false,
			},
		}
		config.DB.Create(&expenses)
	} else {
		// Even if property exists, ensure bucket policy is set (useful for existing dev env)
		_ = config.EnsureBucketExists(context.Background(), "reforma-arroyo")
	}
}
