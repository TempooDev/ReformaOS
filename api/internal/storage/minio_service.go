package storage

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/tempoodev/reformaos/api/internal/config"
)

// Service defines the interface for storage operations
type Service interface {
	UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, contentType string) (string, error)
	GetFileURL(bucketName, objectName string) string
	UploadMultipartFile(ctx context.Context, bucketName, section string, file *multipart.FileHeader) (string, error)
}

type MinioService struct {
	client *minio.Client
}

func NewMinioService() *MinioService {
	return &MinioService{
		client: config.MinioClient,
	}
}

// UploadFile uploads a raw reader to MinIO
func (s *MinioService) UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, contentType string) (string, error) {
	err := config.EnsureBucketExists(ctx, bucketName)
	if err != nil {
		return "", err
	}

	_, err = s.client.PutObject(ctx, bucketName, objectName, reader, objectSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}

	return s.GetFileURL(bucketName, objectName), nil
}

// UploadMultipartFile handles multipart.FileHeader specifically (existing logic)
func (s *MinioService) UploadMultipartFile(ctx context.Context, bucketName, section string, file *multipart.FileHeader) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	objectName := fmt.Sprintf("%s/%s", section, file.Filename)
	return s.UploadFile(ctx, bucketName, objectName, src, file.Size, file.Header.Get("Content-Type"))
}

// GetFileURL returns a URL for the object.
func (s *MinioService) GetFileURL(bucketName, objectName string) string {
	return fmt.Sprintf("http://localhost:9000/%s/%s", bucketName, objectName)
}

func GenerateID() string {
	return uuid.New().String()
}
