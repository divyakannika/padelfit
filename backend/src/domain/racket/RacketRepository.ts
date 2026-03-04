import { Racket } from './Racket'

export interface RacketRepository {
  getAll(): Promise<Racket[]>
}