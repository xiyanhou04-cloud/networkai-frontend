"use client";

import { useState, type FormEvent } from "react";
import { createPost } from "@/lib/api";

export function Studio({ token, onPublished }: {
  token: string;
  onPublished: () => void;
}) {
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reference = form.get("image");
    if (!(reference instanceof File) || !reference.size) form.delete("image");
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await response.json();
      if (!response.ok || typeof result.image !== "string") {
        throw new Error(result.error ?? "Image generation failed.");
      }
      setImage(result.image);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image generation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const caption = String(data.get("caption")).trim();
    if (!caption || !image) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const png = await (await fetch(image)).blob();
      await createPost(token, caption, new File([png], "networkai.png", { type: png.type }));
      setImage("");
      setNotice("Image published.");
      onPublished();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3" aria-label="AI Studio">
      <h2 className="text-xl font-semibold">AI Studio</h2>
      <form onSubmit={generate}>
        <label>Image prompt <textarea name="prompt" required maxLength={4000} /></label>
        <label>
          Reference image (optional)
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
        </label>
        <button disabled={busy}>{busy ? "Working..." : "Generate image"}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {image && (
        <form onSubmit={publish}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Generated image preview" className="max-w-xs" />
          <label>Caption <input name="caption" required maxLength={500} /></label>
          <button disabled={busy}>Publish generated image</button>
        </form>
      )}
    </section>
  );
}
