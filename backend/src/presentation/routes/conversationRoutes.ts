import { Router } from 'express'
import { conversationController } from '../controllers/conversationController'
import { ConversationStore } from '../../infrastructure/store/conversationStore'
import { LLMAdapter } from '../../infrastructure/llm/llmAdapter'
import { Racket } from '../../domain/racket/racket'

export const conversationRoutes = (
  repo: ConversationStore,
  llm: LLMAdapter,
  rackets: Racket[]
): Router => {
  const router = Router()
  const controller = conversationController(repo, llm, rackets)

  router.post('/conversations', controller.start)
  router.post('/conversations/:id/messages', controller.message)
  router.get('/conversations/:id/recommendations', controller.recommendations)

  return router
}