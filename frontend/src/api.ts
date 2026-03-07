import type { Match } from "./types"

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`

const checkOk = async (res: Response) => {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res
}

export const api = {
  async startConversation() {
    const res = await fetch(`${BASE_URL}/conversations`, { method: "POST" })
    return (await checkOk(res)).json() as Promise<{ conversationId: string; message: string }>
  },

  async sendMessage(conversationId: string, message: string) {
    const res = await fetch(
      `${BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      },
    )
    return (await checkOk(res)).json() as Promise<{
      message: string
      state: string
      readyToMatch: boolean
    }>
  },

  async getRecommendations(conversationId: string) {
    const res = await fetch(
      `${BASE_URL}/conversations/${conversationId}/recommendations`,
    )
    return (await checkOk(res)).json() as Promise<{ matches: Match[] }>
  },
}
