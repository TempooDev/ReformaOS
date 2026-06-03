package rental

import (
	"time"
)

type Booking struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Guest      string    `json:"guest"`
	CheckIn    time.Time `json:"check_in"`
	CheckOut   time.Time `json:"check_out"`
	Status     string    `json:"status"`   // Ocupado, Confirmado, Pendiente
	Platform   string    `json:"platform"` // Airbnb, Booking.com, Direct
	Image      string    `json:"image"`
	TotalPrice float64   `json:"total_price"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type DailyRentalStats struct {
	Occupancy         int     `json:"occupancy"`           // Percentage
	AvgDailyRate      float64 `json:"avg_daily_rate"`      // Average price
	RevenueMonth      float64 `json:"revenue_month"`      // Total revenue this month
	UpcomingCheckouts int     `json:"upcoming_checkouts"` // Count
}
