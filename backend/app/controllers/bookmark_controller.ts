import type { HttpContext } from '@adonisjs/core/http'
import Bookmark from '#models/bookmark'
import Accommodation from '#models/accommodation'
import Student from '#models/student'

export default class BookmarkController {
    // Students get all bookmarked accommodations
    async index({ auth, response}: HttpContext) {
        const user = auth.user!
        const student = await Student.findByOrFail('userId', user.id)

        const bookmark = await Bookmark.query()
        .where ('student_number', student.studentNumber)
        .preload('accommodation', (q) => {
            q.preload('images', (q) => q.preload('file'))
            q.preload('tags')
            q.preload('manager', (q) => q.preload('user'))
            q.preload('rooms')
        })

    return response.ok(bookmark.map((b) => ({
        bookmarkId: b.id,
        accommodation: b.accommodation.serialize(),
    })))
    }

    // Student: toggle bookmark (add if not bookmarked, remove if already bookmarked)
    async toggle({ params, auth, response }: HttpContext) {
        const user = auth.user!
        const student = await Student.findByOrFail('user_id', user.id)
    
        // Check if accommodation exists
        const accommodation = await Accommodation.find(params.id)
        if (!accommodation) {
        return response.notFound({
            status: 404,
            error: 'Not Found',
            message: 'Accommodation not found.',
        })
        }
    
        // Check if already bookmarked
        const existing = await Bookmark.query()
        .where('student_number', student.studentNumber)
        .where('accommodation_id', params.id)
        .first()
    
        if (existing) {
        // Already bookmarked — remove it
        await existing.delete()
        return response.ok({
            status: 200,
            message: 'Bookmark removed.',
            bookmarked: false,
        })
        }
    
        // Not bookmarked — add it
        await Bookmark.create({
        studentNumber: student.studentNumber,
        accommodationId: params.id,
        })
    
        return response.created({
        status: 201,
        message: 'Accommodation bookmarked.',
        bookmarked: true,
        })
    }

    // Student: check if a specific accommodation is bookmarked
    async status({ params, auth, response }: HttpContext) {
        const user = auth.user!
    
        const student = await Student.findByOrFail('user_id', user.id)
    
        const existing = await Bookmark.query()
        .where('student_number', student.studentNumber)
        .where('accommodation_id', params.id)
        .first()
    
        return response.ok({
        status: 200,
        bookmarked: !!existing,
        })
    }

}