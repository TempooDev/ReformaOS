package document

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
	var docs []DocumentOrInvoice
	if err := config.DB.Where("property_id = ?", propertyID).Find(&docs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, docs)
}

func (h *Handler) Upload(c echo.Context) error {
	propertyID := c.Param("propertyId")
	docType := c.FormValue("type") // Invoice or Document
	category := c.FormValue("category")

	var p property.Property
	if err := config.DB.First(&p, "id = ?", propertyID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Property not found"})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	// Dynamic section mapping based on category/type
	section := config.SectionProjects
	if category == config.CategoryFloorPlan {
		section = config.SectionPlans
	} else if category == config.CategoryBureaucracy {
		section = config.SectionBureaucracy
	} else if docType == "Invoice" {
		section = config.SectionInvoices
	}

	url, err := h.storage.UploadMultipartFile(c.Request().Context(), p.Bucket, section, file)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload document to MinIO: " + err.Error()})
	}

	doc := DocumentOrInvoice{
		ID:         storage.GenerateID(),
		PropertyID: propertyID,
		FileName:   file.Filename,
		Type:       docType,
		Category:   category,
		Status:     config.StatusPending,
		PreviewURL: url,
	}

	if err := config.DB.Create(&doc).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, doc)
}
