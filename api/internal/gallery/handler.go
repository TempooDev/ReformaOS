package gallery

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/project"
	"github.com/tempoodev/reformaos/api/internal/storage"
)

type Handler struct {
	storage *storage.MinioService
}

func NewHandler(s *storage.MinioService) *Handler {
	return &Handler{storage: s}
}

func (h *Handler) GetFolders(c echo.Context) error {
	projectID := c.Param("projectId")
	var folders []PhotoFolder
	if err := config.DB.Where("project_id = ?", projectID).Preload("Photos").Find(&folders).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, folders)
}

func (h *Handler) CreateFolder(c echo.Context) error {
	f := new(PhotoFolder)
	if err := c.Bind(f); err != nil {
		return err
	}
	f.ProjectID = c.Param("projectId")

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
	projectID := c.Param("projectId")
	folderID := c.Param("folderId")

	var p project.Project
	if err := config.DB.First(&p, "id = ?", projectID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}

	file, err := c.FormFile("photo")
	if err != nil {
		return err
	}

	// Use constant for section
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

// Update folder count and set cover_url if empty
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
