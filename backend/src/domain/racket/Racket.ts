import { PlayStyle } from '../user/PlayStyle'

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
  sweetSpot: string
  feel: string
  description: string
  bestFor: string
  limitations: string
}