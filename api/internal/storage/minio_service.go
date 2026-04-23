package storage

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/minio/minio-go/v7"
	"github.com/tempoodev/reformaos/api/internal/config"
)

type MinioService struct {
	client *minio.Client
}

func NewMinioService() *MinioService {
	return &MinioService{
		client: config.MinioClient,
	}
}

// UploadFile uploads a file to the specified project bucket under the given section.
// It returns the object key (e.g. section/filename)
func (s *MinioService) UploadFile(ctx context.Context, bucketName, section string, file *multipart.FileHeader) (string, error) {
	err := config.EnsureBucketExists(ctx, bucketName)
	if err != nil {
		return "", err
	}

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	objectName := fmt.Sprintf("%s/%s", section, file.Filename)

	_, err = s.client.PutObject(ctx, bucketName, objectName, src, file.Size, minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
	})
	if err != nil {
		return "", err
	}

	return objectName, nil
}

// GetFileURL returns a URL for the object.
// In a real app, this might be a pre-signed URL or a direct public URL depending on bucket policy.
func (s *MinioService) GetFileURL(bucketName, objectName string) string {
	// For simplicity in development, returning direct URL format.
	// You may want to use PresignedGetObject if bucket is private.
	return fmt.Sprintf("http://localhost:9000/%s/%s", bucketName, objectName)
}
