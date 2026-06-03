package domotica

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) GetCameras(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var cameras []Camera
	if err := config.DB.Where("property_id = ?", propertyID).Find(&cameras).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not fetch cameras"})
	}
	return c.JSON(http.StatusOK, cameras)
}

func (h *Handler) GetLights(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var lights []Light
	if err := config.DB.Where("property_id = ?", propertyID).Find(&lights).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not fetch lights"})
	}
	return c.JSON(http.StatusOK, lights)
}

func (h *Handler) UpdateLight(c echo.Context) error {
	id := c.Param("id")
	var light Light
	if err := config.DB.First(&light, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Light not found"})
	}

	if err := c.Bind(&light); err != nil {
		return err
	}

	if err := config.DB.Save(&light).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not update light"})
	}
	return c.JSON(http.StatusOK, light)
}
