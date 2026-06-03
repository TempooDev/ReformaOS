package domotica

import (
	"time"
)

type Camera struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Name       string    `json:"name"`
	Status     string    `json:"status"` // Live, Offline
	Icon       string    `json:"icon"`
	Image      string    `json:"image"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Light struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Name       string    `json:"name"`
	Status     bool      `json:"status"` // on/off
	Brightness int       `json:"brightness"` // 0-100
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
