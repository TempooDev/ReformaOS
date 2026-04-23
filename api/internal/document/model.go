package document

import (
	"time"
)

type DocumentOrInvoice struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	ProjectID  string    `json:"project_id"`
	FileName   string    `json:"file_name"`
	Type       string    `json:"type"`        // Invoice, Document
	Status     string    `json:"status"`      // Pending, Approved, Paid, In Review
	PreviewURL string    `json:"preview_url"` // Path in MinIO
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
