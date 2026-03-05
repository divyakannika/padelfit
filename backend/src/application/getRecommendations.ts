import { ConversationStore } from '../infrastructure/store/conversationStore'
import { LLMAdapter } from '../infrastructure/llm/llmAdapter'
import { MATCHING_PROMPT } from '../infrastructure/llm/padelPrompts'
import { ConversationState } from '../domain/conversation/conversationState'
import { UserProfile } from '../domain/user/userProfile'
import { Racket } from '../domain/racket/racket'
import { RacketMatch } from '../domain/racket/racketMatch'

export const getRecommendations = (repo: ConversationStore, llm: LLMAdapter, rackets: Racket[]) => ({
  async execute(conversationId: string): Promise<RacketMatch[]> {
    const conversation = repo.findById(conversationId)

    if (!conversation) throw new Error('Conversation not found')
    if (conversation.state !== ConversationState.MATCHING) {
      throw new Error('Profile not complete yet')
    }

    // fresh prompt, no chat history needed, just profile and catalogue
    const response = await llm.chat(
      MATCHING_PROMPT.system,
      [],
      MATCHING_PROMPT.user(
        conversation.profile as UserProfile,
        rackets
      )
    )

    const parsed = JSON.parse(response)
    
    // validate LLM response shape before mapping
    if (!parsed.matches || !Array.isArray(parsed.matches)) {
      throw new Error('Invalid response from LLM')
    }
    const matches: RacketMatch[] = parsed.matches.map((m: {
      racketId: string
      score: number
      reason: string
    }) => ({
      racket: rackets.find(r => r.id === m.racketId)!,
      score: m.score,
      reason: m.reason
    }))

    conversation.matches = matches
    conversation.state = ConversationState.DONE
    repo.save(conversation)
    return matches
  }
})