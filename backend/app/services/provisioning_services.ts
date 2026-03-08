import User from '#models/user'

export async function checkUser(up_mail: string, first_name: string, last_name: string) {
    try{
        const user = await User
        .query()
        .where('up_mail', up_mail)
        .where('first_name', first_name)
        .where('last_name', last_name)
        .firstOrFail()

        user.updatedAt = new Date()
        await user.save()
    }
    catch (error)
    {
        await User.create({up_mail, first_name, last_name, role: 'unassigned'})
    }
}