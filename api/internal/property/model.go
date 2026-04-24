package property

import (
	"time"
)

type Property struct {
	ID                  string    `gorm:"primaryKey" json:"id"`
	Name                string    `json:"name"`
	Address             string    `json:"address"`
	Bucket              string    `json:"bucket"`
	OwnerID             string    `json:"owner_id"`
	CadastralReference  string    `json:"cadastral_reference"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
