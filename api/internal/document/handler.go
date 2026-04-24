package document

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
	var docs []DocumentOrInvoice
	if err := config.DB.Where("property_id = ?", propertyID).Find(&docs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, docs)
}

func (h *Handler) Upload(c echo.Context) error {
	propertyID := c.Param("propertyId")
	docType := c.FormValue("type") // Invoice or Document

	var p property.Property
	if err := config.DB.First(&p, "id = ?", propertyID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Property not found"})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	// Use constants for sections
	section := config.SectionProjects
	if docType == "Invoice" {
		section = config.SectionInvoices
	}

	objectKey, err := h.storage.UploadFile(context.Background(), p.Bucket, section, file)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload"})
	}

	doc := DocumentOrInvoice{
		ID:         storage.GenerateID(),
		PropertyID: propertyID,
		FileName:   file.Filename,
		Type:       docType,
		Status:     config.StatusPending,
		PreviewURL: h.storage.GetFileURL(p.Bucket, objectKey),
	}

	if err := config.DB.Create(&doc).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, doc)
}
