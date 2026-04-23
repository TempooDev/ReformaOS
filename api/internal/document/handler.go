package document

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/project"
	"github.com/tempoodev/reformaos/api/internal/storage"
)

type Handler struct {
	storage *storage.MinioService
}

func NewHandler(s *storage.MinioService) *Handler {
	return &Handler{storage: s}
}

func (h *Handler) GetByProject(c echo.Context) error {
	projectID := c.Param("projectId")
	var docs []DocumentOrInvoice
	if err := config.DB.Where("project_id = ?", projectID).Find(&docs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, docs)
}

func (h *Handler) Upload(c echo.Context) error {
	projectID := c.Param("projectId")
	docType := c.FormValue("type") // Invoice or Document

	var p project.Project
	if err := config.DB.First(&p, "id = ?", projectID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
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
		ProjectID:  projectID,
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
