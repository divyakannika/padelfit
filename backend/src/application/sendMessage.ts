import { ConversationStore } from '../infrastructure/store/conversationStore'
import { LLMAdapter } from '../infrastructure/llm/llmAdapter'
import { CONVERSATION_PROMPT } from '../infrastructure/llm/padelPrompts'
import { ConversationState } from '../domain/conversation/conversationState'

export const sendMessage = (repo: ConversationStore, llm: LLMAdapter) => ({
  async execute(conversationId: string, userMessage: string): Promise<{
    message: string; state: ConversationState; readyToMatch: boolean }> { 
      const conversation = repo.findById(conversationId)

      if (!conversation) throw new Error('Conversation not found')
      if (conversation.state === ConversationState.DONE) {
        throw new Error('Conversation already complete')
    }

    conversation.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    })

    const response = await llm.chat(
      CONVERSATION_PROMPT.system,
      conversation.messages.slice(0, -1), // exclude last message, passed separately as userMessage
      userMessage
    )

    // if LLM has collected all profile fields it returns JSON
    try {
      const parsed = JSON.parse(response)
      if (parsed.complete === true) {
        conversation.profile = parsed.profile
        conversation.state = ConversationState.MATCHING
        repo.save(conversation)
        return {
          message: 'Perfect, I have everything I need. Finding your top 3 rackets now...',
          state: conversation.state,
          readyToMatch: true
        }
      }
    } catch {
      // still gathering
    }

    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    })

    repo.save(conversation)
    return {
      message: response,
      state: conversation.state,
      readyToMatch: false
    }
  }
})