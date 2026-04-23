package project

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Create(c echo.Context) error {
	p := new(Project)
	if err := c.Bind(p); err != nil {
		return err
	}
	// Default bucket name based on project name if not provided
	if p.Bucket == "" {
		p.Bucket = p.ID // Or a slugified version of the name
	}

	if err := config.DB.Create(p).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, p)
}

func (h *Handler) GetAll(c echo.Context) error {
	var projects []Project
	if err := config.DB.Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, projects)
}

func (h *Handler) GetByID(c echo.Context) error {
	id := c.Param("id")
	var p Project
	if err := config.DB.First(&p, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}
	return c.JSON(http.StatusOK, p)
}
