import { Message } from './message'
import { ConversationState } from './conversationState'
import { UserProfile } from '../user/userProfile'
import { RacketMatch } from '../racket/racketMatch'

export interface Conversation {
  id: string
  messages: Message[]
  state: ConversationState
  profile: Partial<UserProfile>
  matches?: RacketMatch[]
}