package expense

import (
	"time"
)

type Expense struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Title      string    `json:"title"`
	Category   string    `json:"category"` // Materials, Tax & Insurance, etc.
	Date       time.Time `json:"date"`
	Amount     float64   `json:"amount"`
	Unit       string    `json:"unit"`   // My House, Monthly Rental, etc.
	Status     string    `json:"status"` // monolith-orange, monolith-blue (CSS classes from frontend)
	Image      string    `json:"image"`  // URL or Minio path
	Pending    bool      `json:"pending"`
	Reconciled bool      `json:"reconciled"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
