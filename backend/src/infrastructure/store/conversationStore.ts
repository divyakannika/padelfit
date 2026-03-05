import { Conversation } from '../../domain/conversation/conversation'

export class ConversationStore {
  private readonly store = new Map<string, Conversation>()

  save(conversation: Conversation): void {
    this.store.set(conversation.id, conversation)
  }

  findById(id: string): Conversation | undefined {
    return this.store.get(id)
  }
}