package renovation

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type RenovationConcept struct {
	Name string  `json:"name"`
	Cost float64 `json:"cost"`
}

type ConceptArray []RenovationConcept

func (a ConceptArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

func (a *ConceptArray) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &a)
}

type RenovationProposal struct {
	ID             string       `gorm:"primaryKey" json:"id"`
	ProjectID      string       `json:"project_id"`
	Provider       string       `json:"provider"`
	Amount         float64      `json:"amount"`
	DurationMonths int          `json:"duration_months"`
	Concepts       ConceptArray `gorm:"type:jsonb" json:"concepts"`
	Status         string       `json:"status"` // In Review, Approved, Rejected
	Details        string       `json:"details"`
	DocumentURL    string       `json:"document_url"` // Path in MinIO (e.g. /presupuestos/doc.pdf)
	CreatedAt      time.Time    `json:"created_at"`
	UpdatedAt      time.Time    `json:"updated_at"`
}
