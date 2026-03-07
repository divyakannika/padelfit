import { Request, Response } from 'express'
import { startConversation } from '../../application/startConversation'
import { sendMessage } from '../../application/sendMessage'
import { getRecommendations } from '../../application/getRecommendations'
import { ConversationStore } from '../../infrastructure/store/conversationStore'
import { LLMAdapter } from '../../infrastructure/llm/llmAdapter'
import { Racket } from '../../domain/racket/racket'

export const conversationController = (
  repo: ConversationStore,
  llm: LLMAdapter,
  rackets: Racket[]
) => ({
  async start(req: Request, res: Response): Promise<void> {
    try {
      const result = await startConversation(repo, llm).execute()
      res.status(201).json(result)
    } catch (err) {
      res.status(500).json({ error: 'Failed to start conversation' })
    }
  },

  async message(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string
      const { message } = req.body
      if (!message) {
        res.status(400).json({ error: 'Message is required' })
        return
      }
      const result = await sendMessage(repo, llm).execute(id, message)
      res.json(result)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async recommendations(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string
      const matches = await getRecommendations(repo, llm, rackets).execute(id)
      res.json({ matches })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  }
})