export interface WebPOptions {
  quality?: number;
  maxDimension?: number;
}

export interface CarouselOptions {
  width?: number;
  height?: number;
  quality?: number;
}

// Carousel standard dimensions: 1280 x 330 pixels
export const CAROUSEL_WIDTH = 1280;
export const CAROUSEL_HEIGHT = 330;

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = src;
  });
};

/**
 * Converts any supported image file to WebP using an off-screen canvas.
 * Falls back to the original DataURL if WebP is not supported.
 */
export const convertFileToWebP = async (file: File, options: WebPOptions = {}): Promise<string> => {
  const originalDataUrl = await fileToDataUrl(file);
  try {
    const { quality = 0.82, maxDimension = 2000 } = options;
    const img = await loadImage(originalDataUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context unavailable.');
    }

    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const webpDataUrl = canvas.toDataURL('image/webp', quality);
    if (webpDataUrl.startsWith('data:image/webp')) {
      return webpDataUrl;
    }
  } catch (error) {
    console.warn('WebP conversion failed, using original image.', error);
  }
  return originalDataUrl;
};

/**
 * Converts and resizes image specifically for carousel banners.
 * Output: 1280 x 330 pixels, WebP format, 24-bit color.
 * The image is center-cropped to fit the exact dimensions.
 */
export const convertCarouselImage = async (file: File, options: CarouselOptions = {}): Promise<string> => {
  const originalDataUrl = await fileToDataUrl(file);
  try {
    const { 
      width = CAROUSEL_WIDTH, 
      height = CAROUSEL_HEIGHT, 
      quality = 0.85 
    } = options;
    
    const img = await loadImage(originalDataUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context unavailable.');
    }

    // Set exact carousel dimensions
    canvas.width = width;
    canvas.height = height;

    // Calculate scaling to cover the target dimensions (center crop)
    const targetRatio = width / height;
    const imgRatio = img.width / img.height;
    
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
    
    if (imgRatio > targetRatio) {
      // Image is wider - crop sides
      srcW = img.height * targetRatio;
      srcX = (img.width - srcW) / 2;
    } else {
      // Image is taller - crop top/bottom
      srcH = img.width / targetRatio;
      srcY = (img.height - srcH) / 2;
    }

    // Draw the center-cropped image scaled to exact dimensions
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, width, height);

    const webpDataUrl = canvas.toDataURL('image/webp', quality);
    if (webpDataUrl.startsWith('data:image/webp')) {
      return webpDataUrl;
    }
  } catch (error) {
    console.warn('Carousel image conversion failed, using original.', error);
  }
  return originalDataUrl;
};
