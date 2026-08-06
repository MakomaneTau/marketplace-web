"use client";

import { ImagePlus, Info, MapPin, PackageCheck, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ProductFormProps = {
  mode?: "create" | "edit";
  productId?: string;
};

const categories = ["Books", "Electronics", "Clothing", "Furniture", "Appliances", "Services", "Other"];

export function ProductForm({ mode = "create", productId }: ProductFormProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const generatedUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      generatedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleImages(files: FileList | null) {
    if (!files) return;

    const remaining = Math.max(0, 5 - previews.length);
    const selected = Array.from(files).slice(0, remaining);
    const urls = selected.map((file) => URL.createObjectURL(file));
    generatedUrls.current.push(...urls);
    setPreviews((current) => [...current, ...urls]);
  }

  function removeImage(url: string) {
    URL.revokeObjectURL(url);
    generatedUrls.current = generatedUrls.current.filter((item) => item !== url);
    setPreviews((current) => current.filter((item) => item !== url));
  }

  return (
    <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-violet-50 p-2 text-violet-700">
              <ImagePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-950">Product photos</h2>
              <p className="text-xs text-slate-500">Add up to five clear images. The first image becomes the cover.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {previews.map((url, index) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {/* Native img is used so local object URLs can be previewed without Next Image configuration. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-slate-950/75 p-1 text-white"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-900">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {previews.length < 5 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-violet-400 hover:bg-violet-50">
                <ImagePlus className="h-6 w-6 text-violet-700" />
                <span className="mt-2 text-xs font-semibold text-slate-700">Add photos</span>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-950">Product details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Product title</span>
              <input
                name="title"
                defaultValue={mode === "edit" ? "Scientific calculator" : ""}
                placeholder="e.g. Casio scientific calculator"
                maxLength={80}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
              <select
                name="category"
                defaultValue={mode === "edit" ? "Electronics" : ""}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Condition</span>
              <select
                name="condition"
                defaultValue={mode === "edit" ? "Good" : ""}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="" disabled>Select condition</option>
                <option>New</option>
                <option>Like new</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
              <textarea
                name="description"
                rows={6}
                defaultValue={mode === "edit" ? "Used for one semester and still in very good condition. Includes the original protective cover." : ""}
                placeholder="Describe the condition, what is included, and any defects the buyer should know about."
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-950">Price and stock</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Price</span>
              <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
                <span className="grid place-items-center border-r border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-600">R</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={mode === "edit" ? 280 : undefined}
                  placeholder="0"
                  className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Quantity available</span>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue={mode === "edit" ? 3 : 1}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-50 p-2 text-violet-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-950">Collection and delivery</h2>
              <p className="text-xs text-slate-500">Choose how buyers can receive this item.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <label className="flex gap-3 rounded-xl border border-slate-200 p-4">
              <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-violet-700" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Campus collection</span>
                <span className="block text-xs text-slate-500">Meet the buyer at an agreed safe campus pickup point.</span>
              </span>
            </label>
            <label className="flex gap-3 rounded-xl border border-slate-200 p-4">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-violet-700" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Local delivery</span>
                <span className="block text-xs text-slate-500">Arrange delivery directly with the buyer.</span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-violet-700" />
            <h2 className="font-bold text-slate-950">Listing checklist</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-emerald-600">●</span> Use a specific, searchable title.</li>
            <li className="flex gap-2"><span className="text-emerald-600">●</span> Show the actual product in your photos.</li>
            <li className="flex gap-2"><span className="text-emerald-600">●</span> Disclose scratches, damage, or missing parts.</li>
            <li className="flex gap-2"><span className="text-emerald-600">●</span> Set a realistic student-friendly price.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />
            <div>
              <h2 className="text-sm font-bold text-violet-950">Safety reminder</h2>
              <p className="mt-1 text-xs leading-5 text-violet-800">
                Keep communication in the marketplace and use well-lit public collection points.
              </p>
            </div>
          </div>
        </section>

        {productId && (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
            Editing listing ID: <span className="font-mono font-semibold text-slate-700">{productId}</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            <PackageCheck className="h-4 w-4" />
            {mode === "edit" ? "Update listing" : "Publish listing"}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
        </div>
      </aside>
    </form>
  );
}
