import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { error } from 'console'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    // STEP 1: grab user from auth session (ctx)
    const role = ctx.session.get('role')

    // STEP 2: check if roles exists (not logged in)
    if (!role) {
      return ctx.response.unauthorized({
        status: 401,
        error: 'Unauthorized',
        message: 'Log in to access this resource',
      })
    }
    // STEP 2: check if user's role is allowed (use allowedRoles)

    if (!allowedRoles.includes(role)) {
      return ctx.response.forbidden({
        status: 403,
        error: 'Forbidden',
        message: 'Access denied.',
        yourRole: role,
      })
    }

    // Else, this just goes to the next controller.
    const output = await next()
    return output
  }
}
