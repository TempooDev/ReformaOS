package phase

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) GetByProperty(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var phases []Phase
	if err := config.DB.Where("property_id = ?", propertyID).Order("created_at asc").Find(&phases).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, phases)
}

func (h *Handler) Create(c echo.Context) error {
	p := new(Phase)
	if err := c.Bind(p); err != nil {
		return err
	}
	p.PropertyID = c.Param("propertyId")

	if err := config.DB.Create(p).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, p)
}

func (h *Handler) Update(c echo.Context) error {
	id := c.Param("id")
	var p Phase
	if err := config.DB.First(&p, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Phase not found"})
	}

	if err := c.Bind(&p); err != nil {
		return err
	}

	if err := config.DB.Save(&p).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, p)
}

func (h *Handler) BatchUpdate(c echo.Context) error {
	var phases []Phase
	if err := c.Bind(&phases); err != nil {
		return err
	}

	// Simple transaction for batch update
	tx := config.DB.Begin()
	for _, p := range phases {
		if err := tx.Save(&p).Error; err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	tx.Commit()

	return c.JSON(http.StatusOK, phases)
}
