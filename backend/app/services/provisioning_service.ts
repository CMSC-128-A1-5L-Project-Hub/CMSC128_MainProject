import User from '#models/user'
import FileMetadata from '#models/file_metadata'

export default class ProvisioningService {
  public async provision(profile: { email: string; fname: string; lname: string }) {
    // Get the default placeholder pfp
    const defaultPfp = await FileMetadata.findByOrFail('file_path', 'defaults/default_pfp.png')

    let user = await User.findBy('email', profile.email)

    if (user) {
      user.fname = profile.fname
      user.lname = profile.lname
      await user.save()
      return user
    }

    return await User.create({
      email: profile.email,
      fname: profile.fname,
      lname: profile.lname,
      role: 'unassigned',
      pfpFileId: defaultPfp.fileId,
    })
  }
}
