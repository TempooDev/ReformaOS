package user

import (
	"time"
)

type User struct {
	ID           string    `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex" json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type PropertyAssignment struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	UserID     string    `gorm:"index" json:"user_id"`
	PropertyID string    `gorm:"index" json:"property_id"`
	Role       string    `json:"role"`
	CreatedAt  time.Time `json:"created_at"`
}
