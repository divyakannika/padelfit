import { v4 as uuid } from 'uuid'
import { ConversationState } from '../domain/conversation/conversationState'
import { ConversationStore } from '../infrastructure/store/conversationStore'
import { LLMAdapter } from '../infrastructure/llm/llmAdapter'
import { CONVERSATION_PROMPT } from '../infrastructure/llm/padelPrompts'
import { Message } from '../domain/conversation/message'
import { Conversation } from '../domain/conversation/conversation'

export const startConversation = (repo: ConversationStore, llm: LLMAdapter) => ({
  async execute(): Promise<{ conversationId: string; message: string }> {
    const conversation: Conversation = {
      id: uuid(),
      messages: [] as Message[],
      state: ConversationState.GATHERING,
      profile: {}
    }

    const opening = await llm.chat(
      CONVERSATION_PROMPT.system,
      [],
      'Begin'
    )

    conversation.messages.push({
      role: 'assistant',
      content: opening,
      timestamp: new Date()
    })

    repo.save(conversation)
    return { conversationId: conversation.id, message: opening }
  }
})