package renovation

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/property"
	"github.com/tempoodev/reformaos/api/internal/storage"
)

type Handler struct {
	storage storage.Service
}

func NewHandler(s storage.Service) *Handler {
	return &Handler{storage: s}
}

func (h *Handler) GetByProperty(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var proposals []RenovationProposal
	if err := config.DB.Where("property_id = ?", propertyID).Find(&proposals).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, proposals)
}

func (h *Handler) Create(c echo.Context) error {
	propertyID := c.Param("propertyId")
	r := new(RenovationProposal)
	if err := c.Bind(r); err != nil {
		return err
	}
	r.PropertyID = propertyID

	// Handle optional document upload
	file, err := c.FormFile("document")
	if err == nil {
		var p property.Property
		if err := config.DB.First(&p, "id = ?", propertyID).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Property not found: " + propertyID})
		}
		// Use request context
		url, err := h.storage.UploadMultipartFile(c.Request().Context(), p.Bucket, config.SectionBudgets, file)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload budget to MinIO: " + err.Error()})
		}
		r.DocumentURL = url
	}

	if err := config.DB.Create(r).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, r)
}
