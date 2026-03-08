import User from '#models/user'

export default class ProvisioningService {
  /**
   * Accepts a profile object from Google and handles the "Upsert"
   */
  public async provision(profile: { email: string, firstName: string, lastName: string }) {
    let user
    try {
        user = await User
        .query()
        .where('email', profile.email) // only checks email if existing because it might still create a new user if the user changes their name
        .firstOrFail()

        user.updatedAt = new Date()
        await user.save()
    } catch (error) {
        user = await User.create({email: profile.email, first_name: profile.firstName, last_name: profile.lastName, role: 'unassigned'})
    }
    return user
  }
}