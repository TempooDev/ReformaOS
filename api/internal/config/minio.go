package config

import (
	"context"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func InitMinio(cfg *Config) {
	client, err := minio.New(cfg.Minio.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.Minio.AccessKey, cfg.Minio.SecretKey, ""),
		Secure: cfg.Minio.UseSSL,
	})
	if err != nil {
		log.Fatalf("Failed to connect to MinIO: %v", err)
	}

	MinioClient = client
	log.Println("MinIO connection established")
}

func EnsureBucketExists(ctx context.Context, bucketName string) error {
	exists, err := MinioClient.BucketExists(ctx, bucketName)
	if err != nil {
		return err
	}
	if !exists {
		err = MinioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: "eu-west-1"})
		if err != nil {
			return err
		}
		log.Printf("Successfully created %s bucket\n", bucketName)
	}

	// Always set public read-only policy to ensure it's applied even if bucket already existed
	policy := `{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": "*",
				"Action": ["s3:GetBucketLocation", "s3:ListBucket"],
				"Resource": ["arn:aws:s3:::` + bucketName + `"]
			},
			{
				"Effect": "Allow",
				"Principal": "*",
				"Action": ["s3:GetObject"],
				"Resource": ["arn:aws:s3:::` + bucketName + `/*"]
			}
		]
	}`
	err = MinioClient.SetBucketPolicy(ctx, bucketName, policy)
	if err != nil {
		log.Printf("Warning: Could not set public policy for bucket %s: %v\n", bucketName, err)
	} else {
		log.Printf("Public read policy applied to bucket %s\n", bucketName)
	}

	return nil
}
