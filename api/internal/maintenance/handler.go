package maintenance

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) GetByProperty(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var tasks []MaintenanceTask
	if err := config.DB.Where("property_id = ?", propertyID).Order("due_date asc").Find(&tasks).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not fetch maintenance tasks"})
	}
	return c.JSON(http.StatusOK, tasks)
}

func (h *Handler) Create(c echo.Context) error {
	propertyID := c.Param("propertyId")
	task := new(MaintenanceTask)
	if err := c.Bind(task); err != nil {
		return err
	}
	task.PropertyID = propertyID
	task.ID = time.Now().Format("20060102150405")
	
	if err := config.DB.Create(task).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not create task"})
	}
	return c.JSON(http.StatusCreated, task)
}

func (h *Handler) Update(c echo.Context) error {
	id := c.Param("id")
	var task MaintenanceTask
	if err := config.DB.First(&task, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Task not found"})
	}

	if err := c.Bind(&task); err != nil {
		return err
	}

	if err := config.DB.Save(&task).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not update task"})
	}
	return c.JSON(http.StatusOK, task)
}
