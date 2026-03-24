import { test } from '@japa/runner'
import User from '#models/user'
import Notification from '#models/notification'

test.group('Admin Notifications Controller', (group) => {
    // test the Index Method
  test('retrieve a list of notifications for the authenticated admin', async ({ client, assert }) => {
    // create an admin user and some notifications
    const adminUser = await User.create({ 
        fname: 'System (test)', 
        lname: 'Administrator', 
        email: 'admin@usat.com', 
        role: 'super_admin'     
    })
    
    await Notification.createMany([
      { userId: adminUser.id, notificationContent: 'System Alert', readStatus: 'unread', notificationType: 'system' },
      { userId: adminUser.id, notificationContent: 'Maintenance', readStatus: 'read', notificationType: 'system' }
    ])

    // make the request logged in as the admin, using the new path
    const response = await client.get('/admin/notifications').loginAs(adminUser)

    // assertions
    response.assertStatus(200)
    response.assertBodyContains({ message: 'Notifications retrieved successfully' })
    
    const data = response.body().data
    assert.lengthOf(data, 2)
  })

  // test the Update Method (Success)
  test('successfully mark a notification as read via admin path', async ({ client, assert }) => {
    // setup
    const adminUser = await User.create({ 
        fname: 'System (update test)', 
        lname: 'Administrator', 
        email: 'admin@usat.com', 
        role: 'super_admin'     
    })

    const notification = await Notification.create({ 
      userId: adminUser.id, 
      notificationContent: 'Please read me', 
      readStatus: 'unread', 
      notificationType: 'system' 
    })

    // send PATCH request to the new admin path
    const response = await client
      .patch(`/admin/notifications/${notification.id}`)
      .loginAs(adminUser)
      .json({ readStatus: 'read' })

    // assertions
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Notification updated successfully',
      data: { readStatus: 'read' }
    })

    await notification.refresh()
    assert.equal(notification.readStatus, 'read')
  })

  // test authentication enforcement
  test('fails if the user is not authenticated', async ({ client }) => {
    // attempting to access the admin route without using .loginAs()
    const response = await client.get('/admin/notifications')

    response.assertStatus(401)
  })
})