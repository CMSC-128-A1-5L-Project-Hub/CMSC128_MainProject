import type { HttpContext } from '@adonisjs/core/http'
// Imports: Room, Accommodation, etc.

export default class RoomsController {
  
  // ─── MANAGER: VIEW ALL ROOMS IN A DORM ───
  // GET /accommodations/:accommodationId/rooms
  async index({ params, serialize }: HttpContext) {
    // Logic: Fetch all rooms where accommodationId matches the param
  }

  // ─── RETRIEVE: BY ID ───
  // GET something
  async show({ params, serialize }: HttpContext) {
    // DB Doc Requirement: Retrieve by ID
  }

  // ─── MANAGER: ADD A NEW ROOM ───
  // POST /accommodations/:accommodationId/rooms
  async store({ params, request, serialize }: HttpContext) {
    // Logic: Create a new room linked to the accommodationId. 
    // Set initial current_occupancy to 0.
  }

  // ─── MANAGER: UPDATE ROOM DETAILS ───
  // PUT /rooms/:id
  async update({ params, request, serialize }: HttpContext) {
    // Logic: Update capacity, price, or room type. 
    // Guard: Prevent lowering capacity below current_occupancy!
  }

  // ─── MANAGER: DELETE A ROOM ───
  // DELETE /rooms/:id
  async destroy({ params, response, serialize }: HttpContext) {
    // Logic: Check if current_occupancy == 0. 
    // If > 0, return 400 Bad Request. If 0, delete the room.
  }
}