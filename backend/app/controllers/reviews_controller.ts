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
            .whereNotNull('assignments.actual_move_out')
            .first()

        // Check if student has stayed in the accommodation they want to review
        if (!assignment) {
            return response.status(403).json({
                message: 'You can only review accommodations you have finished staying at'
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