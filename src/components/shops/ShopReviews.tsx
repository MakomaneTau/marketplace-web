"use client";
import { useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiPage, apiErrorMessage } from "@/lib/api";

type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewer: { display_name: string };
  created_at: string;
};
export function ShopReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiPage<Review>(
      `/shops/${encodeURIComponent(slug)}/reviews?page=${page}&limit=5`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setReviews(result.data);
          setPages(result.meta.totalPages);
          setError(null);
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(failure));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug, page, attempt]);
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-bold">Buyer reviews</h2>
      {loading ? (
        <LoadingSplash compact label="Loading reviews…" />
      ) : error ? (
        <p role="alert" className="mt-4 text-danger">
          {error}{" "}
          <button
            className="underline"
            onClick={() => {
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            Retry
          </button>
        </p>
      ) : reviews.length ? (
        <div className="divide-y divide-border">
          {reviews.map((review) => (
            <article key={review.id} className="py-5">
              <p className="font-semibold">
                {review.reviewer.display_name} · {review.rating} out of 5
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">No buyer reviews yet.</p>
      )}
      {!loading && !error && pages > 1 && (
        <div className="mt-4 flex gap-4">
          <button
            disabled={page <= 1}
            className="font-semibold text-primary-text disabled:opacity-40"
            onClick={() => {
              setLoading(true);
              setPage(page - 1);
            }}
          >
            Previous reviews
          </button>
          <button
            disabled={page >= pages}
            className="font-semibold text-primary-text disabled:opacity-40"
            onClick={() => {
              setLoading(true);
              setPage(page + 1);
            }}
          >
            More reviews
          </button>
        </div>
      )}
    </section>
  );
}
