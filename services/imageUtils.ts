export interface WebPOptions {
  quality?: number;
  maxDimension?: number;
}

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
