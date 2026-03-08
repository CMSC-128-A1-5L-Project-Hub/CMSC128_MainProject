import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import promptSync from 'prompt-sync';


export default class extends BaseSeeder {
  async run() {
    const prompt = promptSync();
    const first_name = prompt("Enter first name: ")
    const last_name = prompt("Enter last name: ")
    const up_mail = prompt("Enter up mail: ")
    const role = prompt("Enter role: ")

    await User.create({
      first_name,
      last_name,
      up_mail,
      role,
    })
  }
}

