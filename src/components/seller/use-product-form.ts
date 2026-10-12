"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiErrorMessage, apiPublic, apiRequest } from "@/lib/api";
import type { ApiCategory } from "@/lib/catalog";

import type { ProductFormProps, ManagedProduct } from "./product-form-types";

export function useProductForm({
  mode = "create",
  productId,
}: ProductFormProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const generatedUrls = useRef<string[]>([]);
  const pendingFiles = useRef<Map<string, File>>(new Map());
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const [existing, setExisting] = useState<ManagedProduct | null>(null);
  const [serverImages, setServerImages] = useState<string[]>([]);
  const [ready, setReady] = useState(mode === "create");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const publish = useRef(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    apiPublic<ApiCategory[]>("/categories", { signal })
      .then((items) => {
        if (signal.aborted) return;
        setCategories(items);
        setCategoriesError(false);
      })
      .catch(() => {
        if (signal.aborted) return;
        setCategories([]);
        setCategoriesError(true);
      })
      .finally(() => {
        if (!signal.aborted) setCategoriesLoading(false);
      });
    if (mode === "edit" && productId) {
      apiRequest<ManagedProduct>(`/seller/products/${productId}`, {
        auth: true,
        signal,
      })
        .then((item) => {
          if (signal.aborted) return;
          setExisting(item);
          setServerImages(item.image_urls || []);
          setPreviews(item.image_urls || []);
          setReady(true);
        })
        .catch((requestError) => {
          if (signal.aborted) return;
          setError(apiErrorMessage(requestError));
          setReady(true);
        });
    }
    return () => controller.abort();
  }, [mode, productId]);

  useEffect(() => {
    return () => {
      generatedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleImages(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const remaining = Math.max(0, 5 - previews.length);
    const selected = Array.from(selectedFiles).slice(0, remaining);
    const urls = selected.map((file) => URL.createObjectURL(file));
    urls.forEach((url, index) =>
      pendingFiles.current.set(url, selected[index]),
    );
    generatedUrls.current.push(...urls);
    setPreviews((current) => [...current, ...urls]);
  }

  async function removeImage(url: string) {
    const existingIndex = serverImages.indexOf(url);
    if (existingIndex >= 0 && productId) {
      try {
        await apiRequest(
          `/seller/products/${productId}/images/${existingIndex}`,
          {
            method: "DELETE",
            auth: true,
          },
        );
        setServerImages((current) => current.filter((item) => item !== url));
      } catch (requestError) {
        setError(apiErrorMessage(requestError));
        return;
      }
    }
    URL.revokeObjectURL(url);
    generatedUrls.current = generatedUrls.current.filter(
      (item) => item !== url,
    );
    setPreviews((current) => current.filter((item) => item !== url));
    pendingFiles.current.delete(url);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (publish.current && previews.length === 0) {
      setError("Add at least one image before publishing this listing.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const allowsCampusPickup = form.get("campus_pickup") === "on";
    const allowsDelivery = form.get("delivery") === "on";
    if (!allowsCampusPickup && !allowsDelivery) {
      setError("Choose at least one collection or delivery option.");
      return;
    }
    const input = {
      category_id: String(form.get("category")).trim(),
      title: String(form.get("title")).trim(),
      condition: String(form.get("condition")).trim(),
      price: Number(form.get("price")),
      currency: "ZAR",
      stock_quantity: Number(form.get("quantity")),
      allows_campus_pickup: allowsCampusPickup,
      allows_delivery: allowsDelivery,
      status: "draft",
    };
    const description = String(form.get("description")).trim();
    const pickupLocation = String(form.get("pickup_location")).trim();
    const optionalInput = {
      ...input,
      ...(description ? { description } : {}),
      ...(pickupLocation ? { pickup_location: pickupLocation } : {}),
    };
    try {
      setSubmitting(true);
      const product =
        mode === "edit" && productId
          ? await apiRequest<ManagedProduct>(`/seller/products/${productId}`, {
              method: "PATCH",
              auth: true,
              body: JSON.stringify(optionalInput),
            })
          : await apiRequest<ManagedProduct>("/seller/products", {
              method: "POST",
              auth: true,
              body: JSON.stringify(optionalInput),
            });
      for (const file of pendingFiles.current.values()) {
        const body = new FormData();
        body.append("image", file);
        await apiRequest(`/seller/products/${product.id}/images`, {
          method: "POST",
          auth: true,
          body,
        });
      }
      if (publish.current) {
        await apiRequest(`/seller/products/${product.id}`, {
          method: "PATCH",
          auth: true,
          body: JSON.stringify({ status: "active" }),
        });
      }
      router.push("/seller/products");
      router.refresh();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return {
    previews,
    categories,
    categoriesLoading,
    categoriesError,
    existing,
    ready,
    error,
    submitting,
    publishListing: () => {
      publish.current = true;
    },
    saveDraft: (form: HTMLFormElement | null) => {
      publish.current = false;
      form?.requestSubmit();
    },
    handleImages,
    removeImage,
    submit,
  };
}
