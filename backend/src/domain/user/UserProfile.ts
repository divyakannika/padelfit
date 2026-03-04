import { PlayStyle } from './PlayStyle'

export interface UserProfile {
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  playStyle: PlayStyle
  height: number
  strength: 'low' | 'medium' | 'high'
  budget: 'low' | 'mid' | 'premium'
}