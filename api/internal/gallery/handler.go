package gallery

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/property"
	"github.com/tempoodev/reformaos/api/internal/storage"
)

type Handler struct {
	storage *storage.MinioService
}

func NewHandler(s *storage.MinioService) *Handler {
	return &Handler{storage: s}
}

func (h *Handler) GetFolders(c echo.Context) error {
	propertyID := c.Param("propertyId")
	var folders []PhotoFolder
	if err := config.DB.Where("property_id = ?", propertyID).Preload("Photos").Find(&folders).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, folders)
}

func (h *Handler) CreateFolder(c echo.Context) error {
	f := new(PhotoFolder)
	if err := c.Bind(f); err != nil {
		return err
	}
	f.PropertyID = c.Param("propertyId")

	if err := config.DB.Create(f).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, f)
}

func (h *Handler) GetPhotosByFolder(c echo.Context) error {
	folderID := c.Param("folderId")
	var photos []Photo
	if err := config.DB.Where("folder_id = ?", folderID).Find(&photos).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, photos)
}

func (h *Handler) UploadPhoto(c echo.Context) error {
	propertyID := c.Param("propertyId")
	folderID := c.Param("folderId")

	var p property.Property
	if err := config.DB.First(&p, "id = ?", propertyID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Property not found"})
	}

	file, err := c.FormFile("photo")
	if err != nil {
		return err
	}

	objectKey, err := h.storage.UploadFile(context.Background(), p.Bucket, config.SectionGallery+"/"+folderID, file)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload to MinIO"})
	}

	photo := Photo{
		ID:          storage.GenerateID(),
		FolderID:    folderID,
		URL:         h.storage.GetFileURL(p.Bucket, objectKey),
		Description: c.FormValue("description"),
	}

	if err := config.DB.Create(&photo).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Update folder cover and count
	var folder PhotoFolder
	config.DB.First(&folder, "id = ?", folderID)
	updates := map[string]interface{}{
		"photo_count": config.DB.Raw("photo_count + 1"),
	}
	if folder.CoverURL == "" {
		updates["cover_url"] = photo.URL
	}
	config.DB.Model(&folder).Updates(updates)

	return c.JSON(http.StatusCreated, photo)
}

func (h *Handler) UpdatePhoto(c echo.Context) error {
	id := c.Param("id")
	var photo Photo
	if err := config.DB.First(&photo, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Photo not found"})
	}

	var input struct {
		Description string `json:"description"`
	}
	if err := c.Bind(&input); err != nil {
		return err
	}

	photo.Description = input.Description
	if err := config.DB.Save(&photo).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, photo)
}
