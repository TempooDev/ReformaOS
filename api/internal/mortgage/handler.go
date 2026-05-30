package mortgage

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
	var proposals []MortgageProposal
	if err := config.DB.Where("property_id = ?", propertyID).Find(&proposals).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, proposals)
}

func (h *Handler) Create(c echo.Context) error {
	propertyID := c.Param("propertyId")
	m := new(MortgageProposal)
	if err := c.Bind(m); err != nil {
		return err
	}
	m.PropertyID = propertyID

	// Handle optional document upload
	file, err := c.FormFile("document")
	if err == nil {
		var p property.Property
		if err := config.DB.First(&p, "id = ?", propertyID).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Property not found: " + propertyID})
		}
		// Use request context
		url, err := h.storage.UploadMultipartFile(c.Request().Context(), p.Bucket, config.SectionMortgages, file)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload mortgage document to MinIO: " + err.Error()})
		}
		m.DocumentURL = url
	}

	if err := config.DB.Create(m).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, m)
}
