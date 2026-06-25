export type CompressOptions = {
  maxWidthOrHeight?: number;
  quality?: number;
  outputType?: string;
};

/**
 * Compresses and resizes an image file client-side.
 * Decodes the image, resizes it so the longest side is at most maxWidthOrHeight,
 * and exports it as a JPEG/WebP with specified quality.
 * Falls back to the original file if compression fails.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidthOrHeight = 1280,
    quality = 0.82,
    outputType = "image/jpeg",
  } = options;

  // Only compress supported image types
  const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!supportedTypes.includes(file.type)) {
    return file; // Return original if unsupported (e.g. HEIC/PDF to let normal validation capture it)
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
            if (width > height) {
              height = Math.round((height * maxWidthOrHeight) / width);
              width = maxWidthOrHeight;
            } else {
              width = Math.round((width * maxWidthOrHeight) / height);
              height = maxWidthOrHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file); // fallback to original
            return;
          }

          // Draw white background if exporting to jpeg
          if (outputType === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // fallback
                return;
              }
              // Safely construct a filename with correct extension
              let filename = file.name;
              const nameParts = filename.split(".");
              if (nameParts.length > 1) {
                nameParts.pop();
              }
              const extension = outputType === "image/jpeg" ? "jpg" : "webp";
              filename = `${nameParts.join(".")}.${extension}`;

              const compressedFile = new File([blob], filename, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            outputType,
            quality
          );
        } catch (err) {
          console.error("Image compression error inside onload", err);
          resolve(file); // fallback to original
        }
      };

      img.onerror = () => {
        resolve(file); // fallback to original
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        resolve(file);
      }
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
