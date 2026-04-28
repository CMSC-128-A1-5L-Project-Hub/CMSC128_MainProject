import scheduler from 'adonisjs-scheduler/services/main'

scheduler.command('applications:expire').everyMinute()