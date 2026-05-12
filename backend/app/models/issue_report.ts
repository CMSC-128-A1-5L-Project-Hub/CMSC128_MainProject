import { DateTime } from "luxon";
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import User from "./user.ts";

export default class IssueReport extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare reporterId: number

    @column()
    declare reportableType: 'manager' | 'accommodation'

    @column()
    declare reportableId: number

    @column()
    declare reason:
        | 'unprofessional_behavior'
        | 'harassment'
        | 'unresponsive'
        | 'fraudulent_activity'
        | 'violation_of_policies'
        | 'inaccurate_listing'
        | 'unsafe'
        | 'fraudulent_listing'
        | 'inappropriate_photos'
        | 'unavailable'
        |'other'

    @column()
    declare additionalDetails: string

    @column()
    declare status: 'pending' | 'resolved'

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => User, {
        foreignKey: 'reporterId'
    })
    declare reporter: BelongsTo<typeof User>
}