package config

import (
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
	Minio       MinioConfig
}

type MinioConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	UseSSL    bool
}

func LoadConfig() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "host=localhost user=admin password=password dbname=reformaos port=5432 sslmode=disable TimeZone=UTC"
	}

	minioEndpoint := os.Getenv("MINIO_ENDPOINT")
	if minioEndpoint == "" {
		minioEndpoint = "localhost:9000"
	}

	minioAccessKey := os.Getenv("MINIO_ACCESS_KEY")
	if minioAccessKey == "" {
		minioAccessKey = "minioadmin"
	}

	minioSecretKey := os.Getenv("MINIO_SECRET_KEY")
	if minioSecretKey == "" {
		minioSecretKey = "minioadmin123"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Port:        port,
		DatabaseURL: dbURL,
		Minio: MinioConfig{
			Endpoint:  minioEndpoint,
			AccessKey: minioAccessKey,
			SecretKey: minioSecretKey,
			UseSSL:    false,
		},
	}
}

// Global Constants to avoid magic strings
const (
	SectionGallery   = "galeria"
	SectionMortgages = "hipotecas"
	SectionBudgets   = "presupuestos"
	SectionProjects  = "proyecto"
	SectionInvoices  = "facturas"
)

const (
	StatusPending  = "Pending"
	StatusApproved = "Approved"
	StatusPaid     = "Paid"
	StatusInReview = "In Review"
	StatusRejected = "Rejected"
)

const (
	PhaseStatusCompleted  = "Completado"
	PhaseStatusInProgress = "En curso"
	PhaseStatusPending    = "Pendiente"
)
