import User from '#models/user'
import FileMetadata from '#models/file_metadatum'
import Manager from '#models/manager'
import Accommodation from '#models/accommodation'

export default class ProvisioningService {
  public async provision(profile: { email: string; fname: string; lname?: string }) {
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
      user.lname = profile.lname ?? ''
      await user.save()
      await this.applyPendingManagerInvite(user)
      return user
    }

    user = await User.create({
      email: profile.email,
      fname: profile.fname,
      lname: profile.lname ?? '',
      role: 'unassigned',
      pfpFileId: defaultPfp.id,
    })

    await this.applyPendingManagerInvite(user)

    return user
  }

  private async applyPendingManagerInvite(user: User) {
    const pendingAccommodation = await Accommodation.query()
      .where('invited_manager_email', user.email)
      .first()

    if (!pendingAccommodation) return

    if (user.role !== 'manager') {
      user.role = 'manager'
      user.accountStatus = 'active'
      await user.save()
    }

    const existingManager = await Manager.findBy('userId', user.id)
    if (!existingManager) {
      await Manager.create({
        userId: user.id,
        managerStatus: 'active',
      })
    }

    pendingAccommodation.managerId = user.id
    pendingAccommodation.invitedManagerEmail = null
    await pendingAccommodation.save()
  }
}