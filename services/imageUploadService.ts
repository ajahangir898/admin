/**
 * Image Upload Service
 * Handles uploading images to the server instead of storing as base64
 */

// Backend API URL - in production this would come from environment config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface UploadResponse {
  success: boolean;
  imageUrl: string;
  imageId?: string;
  error?: string;
}

/**
 * Upload a file to the server
 * @param file The image file to upload
 * @param tenantId The tenant ID for organizing uploads
 * @returns Promise with the uploaded image URL
 */
export const uploadImageToServer = async (
  file: File,
  tenantId: string
): Promise<string> => {
  try {
    console.log(`[ImageUpload] Starting upload for ${file.name} (${file.size} bytes) to tenant: ${tenantId}`);
    console.log(`[ImageUpload] API URL: ${API_BASE_URL}/api/upload`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type, let the browser set it automatically for FormData
    });

    console.log(`[ImageUpload] Response status: ${response.status} ${response.statusText}`);

    // Get response text first to debug
    const responseText = await response.text();
    console.log(`[ImageUpload] Response body: ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse JSON from text
    const data: UploadResponse = JSON.parse(responseText);
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    console.log(`[ImageUpload] Success! Image URL: ${data.imageUrl}`);

    // Return full URL for the image
    return `${API_BASE_URL}${data.imageUrl}`;
  } catch (error) {
    console.error('[ImageUpload] Error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple images in parallel
 * @param files Array of image files
 * @param tenantId The tenant ID
 * @returns Promise with array of uploaded image URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  tenantId: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToServer(file, tenantId));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from the server
 * @param imageUrl The image URL to delete
 * @param tenantId The tenant ID
 */
export const deleteImageFromServer = async (
  imageUrl: string,
  tenantId: string
): Promise<void> => {
  try {
    // Extract the relative path if it's a full URL
    const relativePath = imageUrl.replace(API_BASE_URL, '');
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: relativePath,
        tenantId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Image delete error:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
