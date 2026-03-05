import { PlayStyle } from '../user/playStyle'

export interface Racket {
  id: string
  name: string
  brand: string
  shape: 'round' | 'diamond' | 'teardrop'
  level: 'beginner' | 'intermediate' | 'advanced'
  style: PlayStyle
  price: number
  priceRange: 'low' | 'mid' | 'premium'
  weight: number
  description: string
  bestFor: string
  limitations: string
}