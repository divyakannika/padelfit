import { Message } from './Message'
import { ConversationState } from './ConversationState'
import { UserProfile } from '../user/UserProfile'
import { RacketMatch } from '../racket/RacketMatch'

export interface Conversation {
  id: string
  messages: Message[]
  state: ConversationState
  profile: Partial<UserProfile>
  matches?: RacketMatch[]
}