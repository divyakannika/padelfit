import { PlayStyle } from './playStyle'

export interface UserProfile {
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  playStyle: PlayStyle
  height: number
  weight: number
  budgetRange: 'low' | 'mid' | 'premium'
}