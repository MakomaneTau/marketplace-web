"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImagePlus, X } from "lucide-react";

import { categories } from "@/app/data/categories";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PreviewImage {
  file: File;
  url: string;
}

export function CreateProductForm() {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const imagesRef = useRef<PreviewImage[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setError(`You may upload up to ${MAX_IMAGES} images.`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG and WebP images are allowed.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be smaller than 5 MB.");
        return;
      }
    }

    setError(null);
    setImages((current) => [
      ...current,
      ...selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);

    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => {
      const image = current[index];
      if (image) URL.revokeObjectURL(image.url);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Add at least one product image.");
      return;
    }

    const form = new FormData(event.currentTarget);
    images.forEach((image) => form.append("images", image.file));

    try {
      setIsSubmitting(true);

      // Replace with POST `${NEXT_PUBLIC_API_URL}/api/v1/products`.
      console.log(Object.fromEntries(form.entries()));

      setSubmitted(true);
    } catch {
      setError("The listing could not be created. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-secondary" />
        <h2 className="mt-4 text-xl font-bold text-foreground">Listing ready</h2>
        <p className="mt-2 text-sm text-muted">
          The demo form submitted successfully. Connect it to your product API to save the listing.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Create another listing
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Product details</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <input
              name="title"
              required
              minLength={5}
              maxLength={100}
              placeholder="e.g. Casio scientific calculator"
              className={inputClasses}
            />
          </label>

          <label>
            <FieldLabel>Category</FieldLabel>
            <select name="categorySlug" required defaultValue="" className={inputClasses}>
              <option value="" disabled>Select category</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>

          <label>
            <FieldLabel>Condition</FieldLabel>
            <select name="condition" required defaultValue="" className={inputClasses}>
              <option value="" disabled>Select condition</option>
              <option value="New">New</option>
              <option value="Like new">Like new</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </label>

          <label>
            <FieldLabel>Price (R)</FieldLabel>
            <input name="price" type="number" required min="1" step="0.01" placeholder="350" className={inputClasses} />
          </label>

          <label>
            <FieldLabel>Pickup location</FieldLabel>
            <input name="location" required placeholder="Wits Main Campus" className={inputClasses} />
          </label>

          <label className="md:col-span-2">
            <FieldLabel>Description</FieldLabel>
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={2000}
              rows={6}
              placeholder="Describe the product, what is included, and any visible wear."
              className={`${inputClasses} h-auto py-3`}
            />
          </label>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Product images</h2>
        <p className="mt-1 text-sm text-muted">Upload 1–6 clear images. The first image becomes the cover.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={image.url} className="relative aspect-square overflow-hidden rounded-card border border-border bg-surface-muted">
              <Image
                src={image.url}
                alt={`Product preview ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white">Cover</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/90 text-danger shadow"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-border bg-background p-4 text-center transition hover:border-primary hover:bg-primary-soft/30">
              <ImagePlus className="size-7 text-primary" />
              <span className="mt-2 text-sm font-semibold text-foreground">Add images</span>
              <span className="mt-1 text-xs text-muted">JPG, PNG or WebP</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImages}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="h-12 rounded-control border border-border bg-surface px-6 text-sm font-semibold text-foreground hover:bg-surface-muted">
          Save draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? "Publishing..." : "Publish listing"}
        </button>
      </div>
    </form>
  );
}

const inputClasses =
  "h-11 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium text-foreground">{children}</span>;
}
