import type { Post } from "./api";

export type AgentInput = { interests: string; goal: string };
export type AgentPost = Pick<Post, "id" | "user" | "message">;
export type AgentResult = {
  reply: string;
  posts: AgentPost[];
  searches: { keywords: string; count: number; failed?: boolean }[];
};
