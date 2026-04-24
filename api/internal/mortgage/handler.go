package mortgage

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/property"
	"github.com/tempoodev/reformaos/api/internal/storage"
)

type Handler struct {
	storage *storage.MinioService
}

func NewHandler(s *storage.MinioService) *Handler {
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
		config.DB.First(&p, "id = ?", propertyID)
		// Use constant for section
		objectKey, err := h.storage.UploadFile(context.Background(), p.Bucket, config.SectionMortgages, file)
		if err == nil {
			m.DocumentURL = h.storage.GetFileURL(p.Bucket, objectKey)
		}
	}

	if err := config.DB.Create(m).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, m)
}
