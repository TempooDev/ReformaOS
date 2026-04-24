package gallery

import (
	"time"
)

type PhotoFolder struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	PropertyID string    `json:"property_id"`
	Name       string    `json:"name"`
	CoverURL   string    `json:"cover_url"` // Path in MinIO
	PhotoCount int       `json:"photo_count"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Photos     []Photo   `gorm:"foreignKey:FolderID" json:"photos"`
}

type Photo struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	FolderID    string    `json:"folder_id"`
	URL         string    `json:"url"` // Path in MinIO
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
