import User from '#models/user'
import FileMetadata from '#models/file_metadatum'
import Manager from '#models/manager'
import Accommodation from '#models/accommodation'

export default class ProvisioningService {
  public async provision(profile: { email: string; fname: string; lname: string }) {
    const defaultPfp = await FileMetadata.firstOrCreate(
      { filePath: 'defaults/default_pfp.png' },
      {
        fileName: 'default_pfp.png',
        filePath: 'defaults/default_pfp.png',
        fileType: 'image',
      }
    )

    let user = await User.findBy('email', profile.email)

    if (user) {
      user.fname = profile.fname
      user.lname = profile.lname
      await user.save()
      return user
    }

    user = await User.create({
      email: profile.email,
      fname: profile.fname,
      lname: profile.lname,
      role: 'unassigned',
      pfpFileId: defaultPfp.id,
    })

    // Check if this email was invited to manage an accommodation
    const pendingAccommodation = await Accommodation.query()
      .where('invited_manager_email', profile.email)
      .first()

    if (pendingAccommodation) {
      // Auto-activate as manager — no admin approval needed
      user.role = 'manager'
      user.accountStatus = 'active'
      await user.save()

      // Create Manager record
      await Manager.create({
        userId: user.id,
        managerStatus: 'active',
      })

      // Link to accommodation and clear the invite
      pendingAccommodation.managerId = user.id
      pendingAccommodation.invitedManagerEmail = null
      await pendingAccommodation.save()
    }

    return user
  }
}