// app/transformers/user_transformer.ts
import type User from '#models/user'

export function transformUser(user: User) {
  return {
    userId: user.userId,
    fname: user.fname,
    mname: user.mname,
    lname: user.lname,
    suffix: user.suffix,
    email: user.email,
    facebookAccount: user.facebookAccount,
    role: user.role,
    pfpFileId: user.pfpFileId,
  }
}

/*()

Evoke niyo na lang like this:
return response.ok({
  status: 200,
  data: transformUser(user)
})

*/
