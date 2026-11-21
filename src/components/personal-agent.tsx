"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import type { AgentResult } from "@/lib/content-agent";

export function PersonalAgent({ token, onExpired }: {
  token: string;
  onExpired: () => void;
}) {
  const [result, setResult] = useState<AgentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;

    const form = new FormData(event.currentTarget);
    const request = new AbortController();
    activeRequest.current = request;
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interests: String(form.get("interests") ?? ""),
          goal: String(form.get("goal") ?? ""),
        }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(75_000)]),
      });

      if (request.signal.aborted) return;
      if (response.status === 401) {
        onExpired();
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed (${response.status}).`);
      }
      if (typeof data?.reply !== "string" || !Array.isArray(data.posts) ||
          !Array.isArray(data.searches)) {
        throw new Error("Invalid agent response.");
      }
      if (!request.signal.aborted) setResult(data);
    } catch (cause) {
      if (!request.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "Please try again.");
      }
    } finally {
      activeRequest.current = null;
      if (!request.signal.aborted) setBusy(false);
    }
  }

  return (
    <section className="space-y-3" aria-label="Networking assistant">
      <h2 className="text-2xl font-semibold">Networking assistant</h2>
      <form onSubmit={submit}>
        <label>
          Your interests
          <input
            name="interests"
            maxLength={200}
            disabled={busy}
            placeholder="For example, React beginner, frontend interviews"
          />
        </label>
        <label>
          Your goal
          <textarea
            name="goal"
            required
            maxLength={2000}
            disabled={busy}
            placeholder="Find React project posts and draft a study partner introduction."
          />
        </label>
        <p className="text-sm">Interests apply to this request. They are not saved.</p>
        <button disabled={busy}>{busy ? "Working..." : "Ask agent"}</button>
      </form>
      {busy && <p role="status">Choosing tools and preparing your answer...</p>}
      {error && <p role="alert">{error}</p>}
      {result && (
        <div className="panel space-y-3" aria-live="polite">
          <h3 className="font-semibold">Agent answer</h3>
          <p className="whitespace-pre-wrap">{result.reply}</p>
          <h3 className="font-semibold">Search activity</h3>
          {result.searches.length === 0 ? (
            <p>No search tool was used.</p>
          ) : (
            <ul>
              {result.searches.map((search, index) => (
                <li key={index}>
                  {search.failed ? "Search failed" : `${search.keywords}: ${search.count} records returned`}
                </li>
              ))}
            </ul>
          )}
          <h3 className="font-semibold">Retrieved posts</h3>
          {result.posts.length === 0 && <p>No records were retrieved.</p>}
          {result.posts.map((post) => (
            <article key={post.id}>
              <p>{post.message}</p>
              <p className="text-sm">By {post.user}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
