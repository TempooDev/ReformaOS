package gallery

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tempoodev/reformaos/api/internal/config"
	"github.com/tempoodev/reformaos/api/internal/property"
	"github.com/tempoodev/reformaos/api/internal/storage"
)

type Handler struct {
	storage storage.Service
}

func NewHandler(s storage.Service) *Handler {
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
	f.ID = storage.GenerateID()
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

	if folderID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Folder ID is required. It seems the selected folder has no ID."})
	}

	var p property.Property
	if err := config.DB.First(&p, "id = ?", propertyID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Property not found: " + propertyID})
	}

	file, err := c.FormFile("photo")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to get file from request: " + err.Error()})
	}

	url, err := h.storage.UploadMultipartFile(c.Request().Context(), p.Bucket, config.SectionGallery+"/"+folderID, file)
	if err != nil {
		// Log the error to server console for the developer to see the root cause
		fmt.Printf("Error uploading photo to MinIO: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to upload to MinIO: " + err.Error()})
	}

	photo := Photo{
		ID:          storage.GenerateID(),
		FolderID:    folderID,
		URL:         url,
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
