package rental

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
	var bookings []Booking
	if err := config.DB.Where("property_id = ?", propertyID).Order("check_in asc").Find(&bookings).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not fetch bookings"})
	}
	return c.JSON(http.StatusOK, bookings)
}

func (h *Handler) GetTenantByProperty(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var tenant Tenant
	if err := config.DB.Where("property_id = ?", propertyID).First(&tenant).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Tenant not found"})
	}
	return c.JSON(http.StatusOK, tenant)
}

func (h *Handler) GetTransactionsByProperty(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var transactions []RentalTransaction
	if err := config.DB.Where("property_id = ?", propertyID).Order("date desc").Find(&transactions).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not fetch transactions"})
	}
	return c.JSON(http.StatusOK, transactions)
}

func (h *Handler) GetUtilityReadings(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var readings []UtilityReading
	if err := config.DB.Where("property_id = ?", propertyID).Order("reading_date desc").Find(&readings).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not fetch utility readings"})
	}
	return c.JSON(http.StatusOK, readings)
}

func (h *Handler) CreateUtilityReading(c echo.Context) error {
	propertyID := c.Param("propertyId")
	reading := new(UtilityReading)
	if err := c.Bind(reading); err != nil {
		return err
	}
	reading.PropertyID = propertyID
	reading.ID = time.Now().Format("20060102150405")
	reading.ReadingDate = time.Now()

	if err := config.DB.Create(reading).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not create utility reading"})
	}
	return c.JSON(http.StatusCreated, reading)
}

func (h *Handler) GetStats(c echo.Context) error {
	propertyID := c.Param("propertyId")
	
	// In a real app, we would calculate this from bookings. 
	// For now, we return semi-dynamic stats.
	var count int64
	config.DB.Model(&Booking{}).Where("property_id = ?", propertyID).Count(&count)

	stats := DailyRentalStats{
		Occupancy:         85,
		AvgDailyRate:      145.0,
		RevenueMonth:      3820.0,
		UpcomingCheckouts: 2,
	}

	if count == 0 {
		stats = DailyRentalStats{
			Occupancy: 0,
			AvgDailyRate: 0,
			RevenueMonth: 0,
			UpcomingCheckouts: 0,
		}
	}

	return c.JSON(http.StatusOK, stats)
}

func (h *Handler) Create(c echo.Context) error {
	propertyID := c.Param("propertyId")
	booking := new(Booking)
	if err := c.Bind(booking); err != nil {
		return err
	}
	booking.PropertyID = propertyID
	booking.ID = time.Now().Format("20060102150405") // Simple ID for now
	
	if err := config.DB.Create(booking).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not create booking"})
	}
	return c.JSON(http.StatusCreated, booking)
}
