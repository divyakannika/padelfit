import { LLMAdapter } from './llmAdapter'
import { Message } from '../../domain/conversation/message'

export class OllamaAdapter implements LLMAdapter {
  private readonly baseUrl: string
  private readonly model: string

  constructor() {
    this.baseUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434'
    this.model = process.env.OLLAMA_MODEL ?? 'llama3.2'
  }

  async chat(
    systemPrompt: string,
    history: Message[],
    userMessage: string
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })), // strip timestamp, Ollama doesn't need it
          { role: 'user', content: userMessage }
        ],
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    // typed explicitly to avoid any
    const data = await response.json() as { message: { content: string } }
    return data.message.content
  }
}