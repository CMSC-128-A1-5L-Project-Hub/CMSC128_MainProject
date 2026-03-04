import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {

    // STEP 1: grab user from auth session (ctx)

    // STEP 2: check if user's role is allowed (use allowedRoles)
      // Return a response if not allowed

    // Else, this just goes to the next controller.
    const output = await next()
    return output
  }
}