package mortgage

import (
	"time"

	"github.com/lib/pq"
)

type MortgageProposal struct {
	ID             string         `gorm:"primaryKey" json:"id" form:"id"`
	PropertyID     string         `json:"property_id" form:"property_id"`
	Provider       string         `json:"provider" form:"provider"`
	Amount         float64        `json:"amount" form:"amount"`
	InterestRate   float64        `json:"interest_rate" form:"interest_rate"`
	Type           string         `json:"type" form:"type"` // Fija, Variable, Mixta
	TermMonths     int            `json:"term_months" form:"term_months"`
	StartDate      time.Time      `json:"start_date" form:"start_date"`
	Bonuses        pq.StringArray `gorm:"type:text[]" json:"bonuses" form:"bonuses"`
	MonthlyPayment float64        `json:"monthly_payment" form:"monthly_payment"`
	Status         string         `json:"status" form:"status"` // In Review, Approved, Rejected
	Details        string         `json:"details" form:"details"`
	DocumentURL    string         `json:"document_url" form:"document_url"` // Path in MinIO (e.g. /hipotecas/doc.pdf)
	CreatedAt      time.Time      `json:"created_at" form:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at" form:"updated_at"`
}
