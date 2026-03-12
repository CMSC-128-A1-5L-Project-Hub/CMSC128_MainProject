import User from '#models/user'

export default class ProvisioningService {
  /**
   * Accepts a profile object from Google and handles the "Upsert"
   */
  public async provision(profile: { email: string, firstName: string, lastName: string }) {
    let user = await User.findBy('email', profile.email)
    if (user) {
      user.firstName = profile.firstName
      user.lastName = profile.lastName
      await user.save()
      return user
    }

    return await User.create({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: 'unassigned'
    })
  }
}