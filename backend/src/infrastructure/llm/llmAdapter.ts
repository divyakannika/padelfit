import { Message } from '../../domain/conversation/message'

export interface LLMAdapter {
  chat(
    systemPrompt: string,
    history: Message[],
    userMessage: string
  ): Promise<string>
}