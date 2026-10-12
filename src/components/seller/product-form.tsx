"use client";
import { ImagePlus, Info, MapPin, PackageCheck, Save, X } from "lucide-react";

import { ProtectedRequestError } from "@/components/auth/protected-request-error";
import { SESSION_ERROR_MESSAGE } from "@/lib/api";

import type { ProductFormProps } from "./product-form-types";
import { useProductForm } from "./use-product-form";

export function ProductForm({ mode = "create", productId }: ProductFormProps) {
  const {
    previews,
    categories,
    categoriesLoading,
    categoriesError,
    existing,
    ready,
    error,
    submitting,
    publishListing,
    saveDraft,
    handleImages,
    removeImage,
    submit,
  } = useProductForm({ mode, productId });
  if (!ready)
    return (
      <p className="py-12 text-center text-sm text-muted">Loading listing...</p>
    );
  if (error === SESSION_ERROR_MESSAGE)
    return <ProtectedRequestError message={error} />;
  if (mode === "edit" && !existing)
    return (
      <ProtectedRequestError
        message={error || "This listing could not be loaded."}
      />
    );

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      onSubmit={submit}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-primary-soft p-2 text-primary-text">
              <ImagePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-foreground">Product photos</h2>
              <p className="text-xs text-muted">
                Add up to five clear images. The first image becomes the cover.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {previews.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted"
              >
                {/* Native img is used so local object URLs can be previewed without Next Image configuration. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Product preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-foreground/75 p-1 text-white"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-foreground">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {previews.length < 5 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted text-center transition hover:border-primary hover:bg-primary-soft">
                <ImagePlus className="h-6 w-6 text-primary-text" />
                <span className="mt-2 text-xs font-semibold text-foreground">
                  Add photos
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => handleImages(event.target.files)}
                />
              </label>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-foreground">Product details</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Product title
              </span>
              <input
                name="title"
                defaultValue={existing?.title || ""}
                placeholder="e.g. Casio scientific calculator"
                required
                minLength={5}
                maxLength={80}
                className="w-full rounded-xl border border-border-strong bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-subtle focus:border-primary-text focus:ring-4 focus:ring-primary-text/20"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Category
              </span>
              <select
                name="category"
                defaultValue={existing?.category_id || ""}
                required
                disabled={categoriesLoading || categories.length === 0}
                className="w-full rounded-xl border border-border-strong bg-white px-3.5 py-3 text-sm outline-none focus:border-primary-text focus:ring-4 focus:ring-primary-text/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted"
              >
                <option value="" disabled>
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Categories could not be loaded. Refresh the page before
                  publishing.
                </p>
              )}
              {!categoriesLoading &&
                !categoriesError &&
                categories.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    No product categories are available yet.
                  </p>
                )}
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Condition
              </span>
              <select
                name="condition"
                defaultValue={existing?.condition || ""}
                required
                className="w-full rounded-xl border border-border-strong bg-white px-3.5 py-3 text-sm outline-none focus:border-primary-text focus:ring-4 focus:ring-primary-text/20"
              >
                <option value="" disabled>
                  Select condition
                </option>
                <option value="new">New</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Description{" "}
                <span className="font-normal text-subtle">(optional)</span>
              </span>
              <textarea
                name="description"
                rows={6}
                defaultValue={existing?.description || ""}
                placeholder="Describe the condition, what is included, and any defects the buyer should know about."
                minLength={20}
                maxLength={2000}
                className="w-full resize-y rounded-xl border border-border-strong bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-subtle focus:border-primary-text focus:ring-4 focus:ring-primary-text/20"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-foreground">Price and stock</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Price
              </span>
              <div className="flex overflow-hidden rounded-xl border border-border-strong focus-within:border-primary-text focus-within:ring-4 focus-within:ring-primary-text/20">
                <span className="grid place-items-center border-r border-border-strong bg-surface-muted px-3 text-sm font-semibold text-muted">
                  R
                </span>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={existing ? Number(existing.price) : undefined}
                  placeholder="0"
                  required
                  className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Quantity available
              </span>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue={existing?.stock_quantity || 1}
                required
                className="w-full rounded-xl border border-border-strong bg-white px-3.5 py-3 text-sm outline-none focus:border-primary-text focus:ring-4 focus:ring-primary-text/20"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary-soft p-2 text-primary-text">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-foreground">
                Collection and delivery
              </h2>
              <p className="text-xs text-muted">
                Choose how buyers can receive this item.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Pickup location{" "}
                <span className="font-normal text-subtle">(optional)</span>
              </span>
              <input
                name="pickup_location"
                defaultValue={existing?.pickup_location || ""}
                placeholder="e.g. Main library entrance"
                className="w-full rounded-xl border border-border-strong bg-white px-3.5 py-3 text-sm outline-none focus:border-primary-text focus:ring-4 focus:ring-primary-text/20"
              />
            </label>
            <label className="flex gap-3 rounded-xl border border-border p-4">
              <input
                name="campus_pickup"
                type="checkbox"
                defaultChecked={existing?.allows_campus_pickup ?? true}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  Campus collection
                </span>
                <span className="block text-xs text-muted">
                  Meet the buyer at an agreed safe campus pickup point.
                </span>
              </span>
            </label>
            <label className="flex gap-3 rounded-xl border border-border p-4">
              <input
                name="delivery"
                type="checkbox"
                defaultChecked={existing?.allows_delivery ?? true}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  Local delivery
                </span>
                <span className="block text-xs text-muted">
                  Arrange delivery directly with the buyer.
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary-text" />
            <h2 className="font-bold text-foreground">Listing checklist</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-emerald-600">●</span> Use a specific,
              searchable title.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">●</span> Show the actual
              product in your photos.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">●</span> Disclose scratches,
              damage, or missing parts.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">●</span> Set a realistic
              student-friendly price.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-primary bg-primary-soft p-5">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-text" />
            <div>
              <h2 className="text-sm font-bold text-primary-text">
                Safety reminder
              </h2>
              <p className="mt-1 text-xs leading-5 text-primary-text">
                Keep communication in the marketplace and use well-lit public
                collection points.
              </p>
            </div>
          </div>
        </section>

        {productId && (
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-muted">
            Editing listing ID:{" "}
            <span className="font-mono font-semibold text-foreground">
              {productId}
            </span>
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          <button
            type="submit"
            disabled={submitting}
            onClick={publishListing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-action px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            <PackageCheck className="h-4 w-4" />
            {mode === "edit" ? "Update listing" : "Publish listing"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              saveDraft(event.currentTarget.form);
            }}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-white px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
        </div>
      </aside>
    </form>
  );
}
