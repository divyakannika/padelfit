import { ConversationStore } from '../src/infrastructure/store/conversationStore'
import { ConversationState } from '../src/domain/conversation/conversationState'
import { sendMessage } from '../src/application/sendMessage'
import { getRecommendations } from '../src/application/getRecommendations'
import { startConversation } from '../src/application/startConversation'
import { RACKET_CATALOGUE } from '../src/infrastructure/store/racketCatalogue'
import { jest } from '@jest/globals'

const mockLLM = {
  chat: jest.fn()
} as any

describe('startConversation', () => {
  let repo: ConversationStore

  beforeEach(() => {
    repo = new ConversationStore()
    jest.clearAllMocks()
  })

  it('returns a conversation id and opening message', async () => {
    mockLLM.chat.mockResolvedValue('Are you a beginner, intermediate, or advanced player?')

    const result = await startConversation(repo, mockLLM).execute()

    expect(result.conversationId).toBeDefined()
    expect(result.message).toBe('Are you a beginner, intermediate, or advanced player?')
  })
})

describe('sendMessage', () => {
  let repo: ConversationStore

  beforeEach(() => {
    repo = new ConversationStore()
    jest.clearAllMocks()
  })

  it('returns the next question while gathering', async () => {
    mockLLM.chat.mockResolvedValue('Are you a beginner, intermediate, or advanced player?')
    const { conversationId } = await startConversation(repo, mockLLM).execute()

    mockLLM.chat.mockResolvedValue('Do you prefer power, control, or balanced?')
    const result = await sendMessage(repo, mockLLM).execute(conversationId, 'beginner')

    expect(result.message).toBe('Do you prefer power, control, or balanced?')
    expect(result.readyToMatch).toBe(false)
    expect(result.state).toBe(ConversationState.GATHERING)
  })

  it('transitions to matching when profile is complete', async () => {
    mockLLM.chat.mockResolvedValue('Are you a beginner, intermediate, or advanced player?')
    const { conversationId } = await startConversation(repo, mockLLM).execute()

    mockLLM.chat.mockResolvedValue(JSON.stringify({
      complete: true,
      profile: {
        skillLevel: 'beginner',
        playStyle: 'CONTROL',
        height: 154,
        weight: 58,
        budget: 'low'
      }
    }))

    const result = await sendMessage(repo, mockLLM).execute(conversationId, 'low')

    expect(result.readyToMatch).toBe(true)
    expect(result.state).toBe(ConversationState.MATCHING)
  })

  it('throws on unknown conversation id', async () => {
    await expect(
      sendMessage(repo, mockLLM).execute('invalid-id', 'hello')
    ).rejects.toThrow('Conversation not found')
  })
})

describe('getRecommendations', () => {
  let repo: ConversationStore

  beforeEach(() => {
    repo = new ConversationStore()
    jest.clearAllMocks()
  })

  it('returns 3 ranked matches', async () => {
    mockLLM.chat.mockResolvedValue('Are you a beginner, intermediate, or advanced player?')
    const { conversationId } = await startConversation(repo, mockLLM).execute()

    mockLLM.chat.mockResolvedValue(JSON.stringify({
      complete: true,
      profile: {
        skillLevel: 'beginner',
        playStyle: 'CONTROL',
        height: 154,
        weight: 58,
        budget: 'low'
      }
    }))
    await sendMessage(repo, mockLLM).execute(conversationId, 'low')

    mockLLM.chat.mockResolvedValue(JSON.stringify({
      matches: [
        { racketId: 'siux-astra-control-2026', score: 85, reason: 'Great for beginners' },
        { racketId: 'adidas-drive-light-2026', score: 78, reason: 'Lightweight and forgiving' },
        { racketId: 'nox-x-hero-white-2026', score: 71, reason: 'Solid entry point' }
      ]
    }))

    const matches = await getRecommendations(repo, mockLLM, RACKET_CATALOGUE).execute(conversationId)

    expect(matches).toHaveLength(3)
    expect(matches[0].score).toBe(85)
    expect(matches[0].racket).toBeDefined()
    expect(matches[0].reason).toBe('Great for beginners')
  })

  it('throws if profile is not complete', async () => {
    mockLLM.chat.mockResolvedValue('Are you a beginner, intermediate, or advanced player?')
    const { conversationId } = await startConversation(repo, mockLLM).execute()

    await expect(
      getRecommendations(repo, mockLLM, RACKET_CATALOGUE).execute(conversationId)
    ).rejects.toThrow('Profile not complete yet')
  })
})