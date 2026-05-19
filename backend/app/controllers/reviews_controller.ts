import type { HttpContext } from '@adonisjs/core/http'
import Review from '#models/review'
import db from '@adonisjs/lucid/services/db'
import Student from '#models/student'

export default class ReviewsController {

    // ─── STUDENT FUNCTION: REVIEW AN ACCOMMODATION
    async store({ auth, params, request, response }: HttpContext) {
        const user = auth.user!
        const student = await Student.findByOrFail('userId', user.id)
        const accommodationId = params.id

        const { rating, content } = request.only([
            'rating',
            'content'
        ])

        // Get student's accommodations assignment
        const assignment = await db
            .from('assignments')
            .join('rooms', 'assignments.room_id', 'rooms.id')
            .where('assignments.student_number', student.studentNumber)
            .where('rooms.accommodation_id', accommodationId)
            .first()

        // Check if student has stayed (or is currently staying) in the accommodation they want to review
        if (!assignment) {
            return response.status(403).json({
                message: 'You can only review accommodations you have stayed at'
            })
        }

        // Check if there is already an existing review from the student
        const review_exists = await Review.query()
            .where('student_number', student.studentNumber)
            .where('accommodation_id', accommodationId)
            .first()


        if (review_exists) {
            return response.badRequest({
                message: 'You already reviewed this accommodation'
            })
        }

        // Create a review
        const review = await Review.create({
            accommodationId,
            studentNumber: student.studentNumber,
            rating,
            content
        })

        return response.status(201).json({
            message: 'Review submitted successfully',
            data: review,
        })
    }

    // ─── RETRIEVE: GET ALL REVIEWS FOR AN ACCOMMODATION
    async index({ params }: HttpContext) {
        const accommodationId = params.id

        // Get all the reviews for the specified accommodation
        const reviews = await Review.query()
            .where('accommodation_id', accommodationId)
            .orderBy('id', 'desc')

        // Calculate average rating
        const avg_result = await db
            .from('reviews')
            .where('accommodation_id', accommodationId)
            .avg('rating as avg_rating')    
            .first()

        const averageRating = Number(avg_result?.avg_rating || 0)

        return {
            data: reviews,
            meta: {
                average_rating: averageRating
            }
        }
    } 

    // ─── PUBLIC: GET A POOL OF HIGH-RATED REVIEWS FOR THE LANDING PAGE
    async featured({ request, response }: HttpContext) {
        const minRating = Math.max(1, Math.min(5, Number(request.input('minRating', 4))))
        const limit = Math.max(1, Math.min(50, Number(request.input('limit', 20))))

        const reviews = await Review.query()
            .where('rating', '>=', minRating)
            .whereNotNull('content')
            .whereRaw("TRIM(content) <> ''")
            .preload('student', (sq) => {
                sq.preload('user')
            })
            .preload('accommodation')
            .orderBy('id', 'desc')
            .limit(limit)

        const data = reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            content: r.content,
            createdAt: r.createdAt,
            student: r.student
                ? {
                    fname: r.student.user?.fname ?? null,
                    lname: r.student.user?.lname ?? null,
                    college: r.student.college ?? null,
                    degreeProgram: r.student.degreeProgram ?? null,
                }
                : null,
            accommodation: r.accommodation
                ? { id: r.accommodation.id, name: r.accommodation.accommodationName ?? null }
                : null,
        }))

        return response.ok({ data })
    }

    async averageRating({ response }: HttpContext) {
        const avgResult = await db
            .from('reviews')
            .avg('rating as avg_rating')
            .first()

        return response.ok({
            average: Number(avgResult?.avg_rating ?? 0).toFixed(1),
        })
    }
}