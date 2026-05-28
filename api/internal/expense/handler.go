package expense

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
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
	var expenses []Expense
	if err := config.DB.Where("property_id = ?", propertyID).Order("date desc").Find(&expenses).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch expenses"})
	}
	return c.JSON(http.StatusOK, expenses)
}

func (h *Handler) Create(c echo.Context) error {
	propertyID := c.Param("propertyId")
	
	// Parse other fields from form
	e := &Expense{
		ID:         "EXP-" + uuid.New().String()[:8],
		PropertyID: propertyID,
		Title:      c.FormValue("title"),
		Category:   c.FormValue("category"),
		Unit:       c.FormValue("unit"),
		Status:     config.ExpenseStatusPending,
		Pending:    true,
	}
	
	amountStr := c.FormValue("amount")
	if amountStr != "" {
		fmt.Sscanf(amountStr, "%f", &e.Amount)
	}

	dateStr := c.FormValue("date")
	if dateStr != "" {
		t, err := time.Parse("2006-01-02", dateStr)
		if err == nil {
			e.Date = t
		}
	}
	if e.Date.IsZero() {
		e.Date = time.Now()
	}

	// Handle Image Upload
	file, err := c.FormFile("image")
	if err == nil {
		bucket := "reforma-arroyo"
		objectName := fmt.Sprintf("expenses/%s-%s", e.ID, file.Filename)
		
		src, err := file.Open()
		if err != nil {
			return err
		}
		defer src.Close()

		url, err := h.storage.UploadFile(c.Request().Context(), bucket, objectName, src, file.Size, file.Header.Get("Content-Type"))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload to MinIO"})
		}
		e.Image = url
	}

	if err := config.DB.Create(e).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create expense"})
	}

	return c.JSON(http.StatusCreated, e)
}

func (h *Handler) Update(c echo.Context) error {
	id := c.Param("id")
	var e Expense
	if err := config.DB.First(&e, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Expense not found"})
	}

	if err := c.Bind(&e); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	if err := config.DB.Save(&e).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update expense"})
	}

	return c.JSON(http.StatusOK, e)
}

func (h *Handler) Delete(c echo.Context) error {
	id := c.Param("id")
	if err := config.DB.Delete(&Expense{}, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete expense"})
	}
	return c.NoContent(http.StatusNoContent)
}
