import type { Room } from './room'

export interface RoomTag {
  id: number

  roomId: number
  tagDetail: string

  type: 'inclusion' | 'preference' // inclusion = di natatanggal; preference = pwedeng tanggalin

  room?: Room
}