import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Room from '#models/room'

export default class RoomTag extends BaseModel {
    static table = 'room_tags'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare roomId: number

    @column()
    declare tagDetail: string

    @column()
    declare type: 'inclusion' | 'preference' // inclusion = di natatanggal; preference = pwedeng tanggalin yuh

    @belongsTo(() => Room, { foreignKey: 'roomId' })
    declare room: BelongsTo<typeof Room>
}