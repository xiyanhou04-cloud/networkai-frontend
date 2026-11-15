"use client";

import { useState, type FormEvent } from "react";
import { ApiError, createPost } from "@/lib/api";

export function Composer({ token, onPublished, onExpired }: {
  token: string;
  onPublished: () => void;
  onExpired: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const message = String(data.get("message")).trim();
    const file = data.get("media");
    setError("");
    setNotice("");
    if (
      !message ||
      !(file instanceof File) ||
      !file.size ||
      file.size > 10 * 1024 * 1024 ||
      !/\.(jpe?g|png|gif|mp4|mov)$/i.test(file.name)
    ) {
      setError("Add a caption and a JPG, PNG, GIF, MP4, or MOV up to 10 MB.");
      return;
    }

    setBusy(true);
    try {
      await createPost(token, message, file);
      form.reset();
      setNotice("Published. Search again if indexing is still in progress.");
      onPublished();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) onExpired();
      else setError(cause instanceof Error ? cause.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={publish} aria-label="Create a post">
      <h2 className="text-xl font-semibold">Create a post</h2>
      <label>
        Caption <textarea name="message" required maxLength={500} />
      </label>
      <label>
        Media
        <input name="media" type="file" accept=".jpg,.jpeg,.png,.gif,.mp4,.mov" required />
      </label>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <button disabled={busy}>{busy ? "Publishing..." : "Publish"}</button>
    </form>
  );
}
