"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  productName: string;
  images: string[];
}

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : ["/images/product-placeholder.svg"];
  const [activeImage, setActiveImage] = useState(safeImages[0]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const displayImage = failedImages.has(activeImage) ? "/images/product-placeholder.svg" : activeImage;
  const isRemoteImage = /^https?:\/\//.test(displayImage);

  function markImageFailed(image: string) {
    setFailedImages((current) => new Set(current).add(image));
  }

  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-[5rem_minmax(0,1fr)]">
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface-muted md:col-start-2 md:row-start-1">
        <Image
          src={displayImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          className="object-cover"
          onError={() => markImageFailed(activeImage)}
          unoptimized={isRemoteImage}
        />
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 md:col-start-1 md:row-start-1 md:grid-cols-1 md:self-start">
          {safeImages.map((image, index) => {
            const selected = image === activeImage;
            const thumbnailSrc = failedImages.has(image) ? "/images/product-placeholder.svg" : image;
            const isRemoteThumbnail = /^https?:\/\//.test(thumbnailSrc);

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(image)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={selected}
                className={`relative aspect-square overflow-hidden rounded-control border ${
                  selected ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                <Image
                  src={thumbnailSrc}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                  onError={() => markImageFailed(image)}
                  unoptimized={isRemoteThumbnail}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
