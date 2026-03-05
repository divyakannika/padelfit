import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { OllamaAdapter } from './infrastructure/llm/ollamaAdapter'
import { ConversationStore } from './infrastructure/store/conversationStore'
import { RACKET_CATALOGUE } from './infrastructure/store/racketCatalogue'
import { conversationRoutes } from './presentation/routes/conversationRoutes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// swap OllamaAdapter for any other LLMAdapter here
const llm = new OllamaAdapter()
const repo = new ConversationStore()

app.use('/api', conversationRoutes(repo, llm, RACKET_CATALOGUE))

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`PadelFit API running on port ${PORT}`)
})