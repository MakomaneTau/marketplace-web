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

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface-muted">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          className="object-cover"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {safeImages.map((image, index) => {
            const selected = image === activeImage;
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
                <Image src={image} alt="" fill sizes="120px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
