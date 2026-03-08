import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up(){
    // file_metadata table
    this.schema.createTable('file_metadata', (table) => {
      table.increments('file_id').primary()
      table.string('file_name', 100).notNullable()
      table.string('file_path', 500).notNullable()
      table.enum('file_type', ['document', 'image']).notNullable()
    })

    // accommodation_images table
    this.schema.createTable('accommodation_image', (table) =>{
      table.increments('images_id').primary()
      table.bigInteger('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.integer('image_file_id').unsigned().notNullable().unique().references('file_id').inTable('file_metadata')
    })
  }

  async down(){
    this.schema.dropTable('accommodation_image')
    this.schema.dropTable('file_metadata')
  }

}