"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Camera, ImagePlus, RotateCcw, X } from "lucide-react";

import { cn } from "@/app/libs/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploadFieldProps {
  title: string;
  description: string;

  value: File | null;
  onChange: (file: File | null) => void;

  capture?: "user" | "environment";

  variant?: "square" | "card";
}

export function ImageUploadField({
  title,
  description,
  value,
  onChange,
  capture,
  variant = "square",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a JPG, PNG, or WebP image.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image must be smaller than 5 MB.";
    }

    return null;
  }
  function selectFile(file: File | undefined) {
    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onChange(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    selectFile(event.dataTransfer.files?.[0]);
  }

  function removeFile() {
    onChange(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {/* Title */}

      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>

        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      {/* Hidden input */}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={capture}
        onChange={handleInputChange}
        className="sr-only"
      />

      {/* Upload state */}

      {!previewUrl ? (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center",
            "border-2 border-dashed border-border",
            "bg-surface",
            "px-6 py-8",
            "text-center",
            "transition-colors",
            "hover:border-primary",
            "hover:bg-primary-soft/30",

            variant === "square"
              ? "aspect-square max-h-72 rounded-card"
              : "aspect-8/5 rounded-card",
          )}
        >
          <div
            className="
              flex
              size-12
              items-center
              justify-center
              rounded-full
              bg-primary-soft
              text-primary
            "
          >
            {capture ? (
              <Camera className="size-6" />
            ) : (
              <ImagePlus className="size-6" />
            )}
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground">
            Add image
          </p>

          <p className="mt-1 text-xs text-muted">JPG, PNG or WebP • Max 5 MB</p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="
              mt-4
              rounded-control
              border
              border-border
              bg-surface
              px-4
              py-2
              text-sm
              font-medium
              text-foreground
              transition
              hover:bg-surface-muted
            "
          >
            Choose image
          </button>
        </div>
      ) : (
        /* Preview */

        <div
          className={cn(
            "relative overflow-hidden",
            "rounded-card",
            "border border-border",
            "bg-surface-muted",

            variant === "square" ? "aspect-square max-h-72" : "aspect-8/5",
          )}
        >
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className="h-full w-full object-cover"
          />

          {/* Overlay */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              flex
              items-center
              justify-between
              gap-2
              bg-black/60
              p-3
              backdrop-blur-sm
            "
          >
            <p className="min-w-0 truncate text-xs text-white">{value?.name}</p>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                aria-label="Replace image"
                onClick={() => inputRef.current?.click()}
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-foreground
                  transition
                  hover:bg-surface-muted
                "
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                type="button"
                aria-label="Remove image"
                onClick={removeFile}
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-danger
                  transition
                  hover:bg-red-50
                "
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
