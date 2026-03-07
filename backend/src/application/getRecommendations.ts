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
      MATCHING_PROMPT.user(conversation.profile as UserProfile, rackets)
    )
    // console.log('LLM matching response:', response)

    // const trimmed = response.trim()
    // const cleaned = trimmed.endsWith('}') ? trimmed : trimmed + '}'
    // const parsed = JSON.parse(cleaned.replace(/```json\n?|\n?```/g, '').trim())
    const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim())

    if (!parsed.matches || !Array.isArray(parsed.matches)) {
      throw new Error('Invalid response from LLM')
    }
    const matches: RacketMatch[] = parsed.matches
      .map((m: { racketId: string; score: number; reason: string }) => {
        const racket = rackets.find((r) => r.id === m.racketId)
        if (!racket) return null 
        return { racket, score: m.score, reason: m.reason }
      })
      .filter(Boolean)

    conversation.matches = matches
    conversation.state = ConversationState.DONE
    repo.save(conversation)
    return matches
  }
})