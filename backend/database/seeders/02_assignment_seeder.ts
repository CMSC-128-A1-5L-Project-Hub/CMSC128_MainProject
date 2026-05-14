import db from "@adonisjs/lucid/services/db";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { DateTime } from "luxon";
import Student from "#models/student";
import Accommodation from "#models/accommodation";
import Room from "#models/room";

interface AssignmentSeedData {
    student_number: string
    room_id: number
    confirmed_date: DateTime
    confirmation_status: 'pending_confirmation' | 'active' | 'rejected' | 'cancelled'
    move_in: DateTime
    expected_move_out: DateTime
    grace_period_days: number
}

/*
    If you want to run this with only the fake students, modify the 00_user_seeder.ts file to only seed the fake students.

      Room restriction logic:
    - Dorm is 'male-only' or 'female-only' → all rooms inherit that gender; room-level
        tenantRestriction adds no new information, any room is safe to assign.
    - Dorm is 'coed' + room is 'coed'      → any student may be assigned.
    - Dorm is 'coed' + room is 'non-coed'  → gender is inferred from current occupants.
        If the room already has occupants, only students matching that gender may be assigned.
        If the room is empty (no existing occupants and no in-session assignments yet),
        any student may be assigned
        The first assignment sets the room's effective gender
        for the remainder of this seeding run.
 */
export default class AssignmentSeeder extends BaseSeeder {
    async run() {
        const students = await Student.all();
        const unassigned = [...students];

        // load accommodations and their available rooms
        const accommodations = await Accommodation.query()
            .where("status", "verified")
            .preload("rooms", (q) => {
                q.where("room_availability", "available")
                .whereRaw("room_current_occupancy < room_capacity")
                .preload("assignments", (aq) => {
                    aq.where("confirmation_status", "active")
                    .preload("student");
                });
            });

        // added guard just to be sure
        const dormWithRooms = accommodations.filter((a) => a.rooms.length > 0);

        const assignments: AssignmentSeedData[] = [];
        // For keeping track of room occupancy count (to be updated in the db in the end)
        const roomOccupancyDelta: Record<number, number> = {};

        // For non-coed rooms in coed dorms, this tracks the gender restriction based on assigned tenants to non-coed room
        const roomEffectiveGender: Record<number, string> = {};

        const getRoomSlots = (room: Room): number => {
            const capacity = room.roomCapacity - room.roomCurrentOccupancy;
            const filled = roomOccupancyDelta[room.id] ?? 0;
            return capacity - filled;
        }

        const resolveNonCoedRoomGender = (room: Room): string | null => {
            if (roomEffectiveGender[room.id] !== undefined) {
                return roomEffectiveGender[room.id]
            }

            const occupantGenders = room.assignments
                .map((a) => a.student?.gender)
                .filter(Boolean) as string[];

            if (occupantGenders.length === 0) return null;

            // Since all occupants share the same gender, return first instance
            return occupantGenders[0];
        }

        // Checks if a room is eligible to be assigned to student
        const isRoomEligible = (
            room: Room,
            dorm: typeof dormWithRooms[number],
            studentGender: string
        ): Boolean => {
            if (getRoomSlots(room) <= 0) return false;

            // Check tenant restriction
            if (room.tenantRestriction === "coed") return true;

            if (dorm.tenantRestriction === "male-only") return studentGender === "male";
            if (dorm.tenantRestriction === "female-only") return studentGender === "female";

            // Check dorm room tenant restriction
            const lockedGender = resolveNonCoedRoomGender(room);
            if (lockedGender === null) return true;
            return studentGender === lockedGender;
        }

        // Pick student that satisfies dorm restriction
        const pickStudent = (dormRestriction: string): Student | null => {
            const idx = unassigned.findIndex((s) => {
                if (dormRestriction === "male-only" && s.gender !== "male") return false;
                if (dormRestriction === "female-only" && s.gender !== "female") return false;
                return true;
            })

            if (idx === -1) return null;
            const [student] = unassigned.splice(idx, 1);
            return student;
        }

        const makeAssignment = (
            student: Student,
            room: Room,
            dorm: (typeof dormWithRooms)[number]
        ): void => {
            roomOccupancyDelta[room.id] = (roomOccupancyDelta[room.id] ?? 0) + 1;

            if (dorm.tenantRestriction === "coed" && room.tenantRestriction === "non-coed") {
                roomEffectiveGender[room.id] ??= student.gender;
            }

            assignments.push({
                student_number: student.studentNumber,
                room_id: room.id,
                confirmed_date: DateTime.now(),
                confirmation_status: "active",
                move_in: DateTime.now(),
                expected_move_out: DateTime.now().plus({months: 6}),
                grace_period_days: 7
            })
        }

        /*
            Comment this out if you don't need each accommodation to have at least one student.

            This block of code guarantees that there is at least one student per dorm
        */
        // Pass 1
        for (const dorm of dormWithRooms) {
            if (unassigned.length === 0) break;

            const candidate = unassigned.find((s) => {
                if (dorm.tenantRestriction === "male-only" && s.gender !== "male") return false;
                if (dorm.tenantRestriction === "female-only" && s.gender !== "female") return false;
                return true;
            });

            if (!candidate) continue;

            const room = dorm.rooms.find((r) => isRoomEligible(r, dorm, candidate.gender));
            if (!room) continue;

            const student = pickStudent(dorm.tenantRestriction)!;
            makeAssignment(student, room, dorm);
        }

        // Pass 2: Assign remaining students evenly across dorms (round-robin)
        // Remove 100 assignments cap if more fake students are to be assigned
        let hasAssigned = true;
        while (hasAssigned && unassigned.length > 0 && assignments.length < 100) {
            hasAssigned = false;

            for (const dorm of dormWithRooms) {
                if (unassigned.length === 0 || assignments.length >= 100) break;

                const candidate = unassigned.find((s) => {
                    if (dorm.tenantRestriction === "male-only" && s.gender !== "male") return false;
                    if (dorm.tenantRestriction === "female-only" && s.gender !== "female") return false;
                    return true;
                });

                if (!candidate) continue;

                const room = dorm.rooms.find((r) => isRoomEligible(r, dorm, candidate.gender));
                if (!room) continue;

                const student = pickStudent(dorm.tenantRestriction)!;
                makeAssignment(student, room, dorm);
                hasAssigned = true;
            }
        }

        // Insert assignments to db
        for (const assignment of assignments) {
            const existing = await db
                .from("assignments")
                .where("student_number", assignment.student_number)
                .first()

            if (existing) {
                // Feel free to comment out the logging
                console.log(`[skipped] Student ${assignment.student_number} already assigned.`);
                continue
            }

            await db.table("assignments").insert(assignment);
        }

        // Update occupancy counts
        for (const [roomId, delta] of Object.entries(roomOccupancyDelta)) {
            await db
                .from("rooms")
                .where("id", roomId)
                .increment("room_current_occupancy", delta);
        }

        console.log(`[seeded] ${assignments.length} students assigned to ${dormWithRooms.length} dorms.`);
    }
}