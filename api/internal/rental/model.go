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

type Tenant struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Name       string    `json:"name"`
	Location   string    `json:"location"`
	Image      string    `json:"image"`
	Rent       float64   `json:"rent"`
	StartDate  time.Time `json:"start_date"`
	NextPayment time.Time `json:"next_payment"`
	Deposit    float64   `json:"deposit"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type RentalTransaction struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	TenantID   string    `gorm:"index" json:"tenant_id"`
	Title      string    `json:"title"`
	Date       time.Time `json:"date"`
	Amount     float64   `json:"amount"`
	Status     string    `json:"status"` // Success, Pending, Failed
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type UtilityReading struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Type       string    `json:"type"` // Electricity, Water
	MeterID    string    `json:"meter_id"`
	Value      float64   `json:"value"`
	ReadingDate time.Time `json:"reading_date"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
