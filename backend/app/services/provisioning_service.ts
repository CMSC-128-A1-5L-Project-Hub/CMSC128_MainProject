import User from '#models/user'

export default class ProvisioningService {
  /**
   * Accepts a profile object from Google and handles the "Upsert"
   */
  public async provision(profile: { email: string, firstName: string, lastName: string }) {
    // STEP 1: Find the user by email or create a new one if he doesn't exist
    
    // Then just return user
    //return user
  }
}