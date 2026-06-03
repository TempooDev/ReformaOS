package property

import (
	"time"
)

type Property struct {
	ID                  string    `gorm:"primaryKey" json:"id"`
	Name                string    `json:"name"`
	Address             string    `json:"address"`
	Budget              float64   `json:"budget"`
	AcquisitionPrice    float64   `json:"acquisition_price"`
	ProjectedValue      float64   `json:"projected_value"`
	AnnualAppreciation  float64   `json:"annual_appreciation"`
	Bucket              string    `json:"bucket"`
	OwnerID             string    `json:"owner_id"`
	CadastralReference  string    `json:"cadastral_reference"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
