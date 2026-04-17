import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    // STEP 1: Check if user is authenticated
    const authUser = ctx.auth.user

    if (!authUser) {
      return ctx.response.unauthorized({
        status: 401,
        error: 'Unauthorized',
        message: 'Log in to access this resource',
      })
    }

    // STEP 2: Always read role from DB — not session (prevents session tampering)
    const user = await User.findOrFail(authUser.id)

    // STEP 3: Check if user's role is allowed
    if (!allowedRoles.includes(user.role)) {
      return ctx.response.forbidden({
        status: 403,
        error: 'Forbidden',
        message: 'Access denied.',
        yourRole: user.role,
      })
    }

    const output = await next()
    return output
  }
}