package phase

import (
	"time"
)

type Phase struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `json:"property_id"`
	Name       string    `json:"name"`
	Progress   int       `json:"progress"` // 0 to 100
	Status     string    `json:"status"`   // Completado, En curso, Pendiente
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
