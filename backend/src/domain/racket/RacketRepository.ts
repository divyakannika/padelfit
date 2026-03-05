import { Racket } from './racket'

export interface RacketRepository {
  getAll(): Promise<Racket[]>
}