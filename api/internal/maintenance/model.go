package maintenance

import (
	"time"
)

type MaintenanceTask struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	PropertyID  string    `gorm:"index" json:"property_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"` // Plumbing, Electrical, Cleaning, HVAC, etc.
	DueDate     time.Time `json:"due_date"`
	Status      string    `json:"status"` // Pending, In Progress, Completed
	Priority    string    `json:"priority"` // Low, Medium, High
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
