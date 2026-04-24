package mortgage

import (
	"time"

	"github.com/lib/pq"
)

type MortgageProposal struct {
	ID             string         `gorm:"primaryKey" json:"id"`
	PropertyID     string         `json:"property_id"`
	Provider       string         `json:"provider"`
	Amount         float64        `json:"amount"`
	InterestRate   float64        `json:"interest_rate"`
	Type           string         `json:"type"` // Fija, Variable, Mixta
	Bonuses        pq.StringArray `gorm:"type:text[]" json:"bonuses"`
	MonthlyPayment float64        `json:"monthly_payment"`
	Status         string         `json:"status"` // In Review, Approved, Rejected
	Details        string         `json:"details"`
	DocumentURL    string         `json:"document_url"` // Path in MinIO (e.g. /hipotecas/doc.pdf)
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
}
