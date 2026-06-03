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
