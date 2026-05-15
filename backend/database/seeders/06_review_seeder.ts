import db from "@adonisjs/lucid/services/db";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { DateTime } from "luxon";
import Accommodation from "#models/accommodation";

/*
    Seeds reviews for each verified accommodation using ONLY students who have
    an active assignment to that accommodation (strict eligibility — a student
    can only review a place they actually stayed at).

    Per accommodation: random 3–8 reviews (capped by the size of the assignee
    pool, so smaller dorms get whatever they have).

    Safe to run standalone:
        node ace db:seed --files ./database/seeders/06_review_seeder.ts
    Dedupes on (student_number, accommodation_id), so re-runs insert 0 new rows.
*/

interface ReviewSeedData {
    accommodation_id: number
    student_number: string
    rating: number
    content: string | null
    created_at: Date
}

// ─── content pools, loose mapping to rating buckets ─────────────────────────

const CONTENT_RATING_5 = [
    "Great place — clean, quiet, and the manager is super responsive.",
    "Honestly the best dorm I've stayed in. Highly recommended!",
    "Spacious rooms, fast wifi, and very close to campus. 10/10.",
    "Felt safe the entire stay. Staff is friendly and helpful.",
    "Excellent value for the price. Will stay here again next sem.",
];

const CONTENT_RATING_4 = [
    "Good overall. Wifi sometimes drops but otherwise solid.",
    "Comfortable rooms, decent amenities. Could use better lighting.",
    "Nice place to stay. Just a bit pricey for what you get.",
    "Pretty quiet and clean. Bathroom queue gets long in the morning.",
    "Recommended! Just be ready for the walk to the main road.",
];

const CONTENT_RATING_3 = [
    "It's okay. Nothing special but nothing terrible either.",
    "Average dorm experience. Mid.",
    "Decent for short stays. Wouldn't commit to a full year.",
    "Some issues with maintenance but they get addressed eventually.",
];

const CONTENT_RATING_1_2 = [
    "Water pressure is bad and the wifi barely works.",
    "Cramped rooms and noisy hallways. Hard to study.",
    "Maintenance requests take forever to be addressed.",
    "Not great. Look elsewhere if you have other options.",
    "Hidden fees popped up after move-in. Disappointing.",
];

// ─── helpers ────────────────────────────────────────────────────────────────

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

// Weighted rating tuned so E[rating] ≈ 4.5:
//   5: 65%, 4: 25%, 3: 5%, 2: 3%, 1: 2%
//   → 5*0.65 + 4*0.25 + 3*0.05 + 2*0.03 + 1*0.02 = 4.48
const weightedRating = (): number => {
    const r = Math.random();
    if (r < 0.65) return 5;
    if (r < 0.90) return 4;
    if (r < 0.95) return 3;
    if (r < 0.98) return 2;
    return 1;
};

const contentForRating = (rating: number): string | null => {
    // ~15% of reviews are content-less (rating-only)
    if (Math.random() < 0.15) return null;

    if (rating === 5) return randItem(CONTENT_RATING_5);
    if (rating === 4) return randItem(CONTENT_RATING_4);
    if (rating === 3) return randItem(CONTENT_RATING_3);
    return randItem(CONTENT_RATING_1_2);
};

const shuffleInPlace = <T>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = rand(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// ─── seeder ─────────────────────────────────────────────────────────────────

export default class ReviewSeeder extends BaseSeeder {
    async run() {
        // Uncomment to wipe first
        // await db.from("reviews").delete();

        const accommodations = await Accommodation.query()
            .where("status", "verified")
            .preload("rooms", (q) => {
                q.preload("assignments", (aq) => {
                    aq.where("confirmation_status", "active");
                });
            });

        const reviews: ReviewSeedData[] = [];
        let accomsTouched = 0;
        let skippedAccoms = 0;

        for (const dorm of accommodations) {
            // Collect unique student_numbers assigned to any room of this accom
            const studentSet = new Set<string>();
            for (const room of dorm.rooms) {
                for (const a of room.assignments) {
                    if (a.studentNumber) studentSet.add(a.studentNumber);
                }
            }

            const pool = Array.from(studentSet);
            if (pool.length === 0) {
                skippedAccoms++;
                continue;
            }

            const target = Math.min(rand(3, 8), pool.length);
            const reviewers = shuffleInPlace([...pool]).slice(0, target);

            for (const studentNumber of reviewers) {
                const rating = weightedRating();
                const content = contentForRating(rating);
                const daysAgo = rand(0, 180);
                const createdAt = DateTime.now().minus({ days: daysAgo }).toJSDate();

                reviews.push({
                    accommodation_id: dorm.id,
                    student_number: studentNumber,
                    rating,
                    content,
                    created_at: createdAt,
                });
            }

            accomsTouched++;
        }

        // Insert with dedupe on (student_number, accommodation_id)
        let inserted = 0;
        let skipped = 0;
        for (const r of reviews) {
            const existing = await db
                .from("reviews")
                .where("student_number", r.student_number)
                .andWhere("accommodation_id", r.accommodation_id)
                .first();

            if (existing) {
                skipped++;
                continue;
            }

            await db.table("reviews").insert(r);
            inserted++;
        }

        console.log(
            `[seeded] ${inserted} reviews across ${accomsTouched} accommodations ` +
            `(skipped duplicates: ${skipped}, accoms with no assignees: ${skippedAccoms}).`
        );
    }
}
