export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface Match {
  racket: {
    id: string
    name: string
    brand: string
    price: number
    shape: string
    level: string
    bestFor: string
    limitations: string
  }
  score: number
  reason: string
}
