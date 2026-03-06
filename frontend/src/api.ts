import type { Match } from "./types";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const api = {
  async startConversation() {
    const res = await fetch(`${BASE_URL}/conversations`, { method: "POST" });
    return res.json() as Promise<{ conversationId: string; message: string }>;
  },

  async sendMessage(conversationId: string, message: string) {
    const res = await fetch(
      `${BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      },
    );
    return res.json() as Promise<{
      message: string;
      state: string;
      readyToMatch: boolean;
    }>;
  },

  async getRecommendations(conversationId: string) {
    const res = await fetch(
      `${BASE_URL}/conversations/${conversationId}/recommendations`,
    );
    return res.json() as Promise<{ matches: Match[] }>;
  },
};
