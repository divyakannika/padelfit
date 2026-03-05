import { Racket } from './racket'

// interface for racket data source, swap RACKET_CATALOGUE for PadelfulApiAdapter here
export interface RacketRepository {
  getAll(): Promise<Racket[]>
}