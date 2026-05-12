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
                .whereRaw("room_current_occupancy < room_capacity");
            });

        // added guard just to be sure
        const dormWithRooms = accommodations.filter((a) => a.rooms.length > 0);

        const assignments: AssignmentSeedData[] = [];
        // For keeping track of room occupancy count (to be updated in the db in the end)
        const roomOccupancyDelta: Record<number, number> = {};

        const pickStudent = (dormRestriction: string) => {
            const idx = unassigned.findIndex((s) => {
                if (dormRestriction === "male-only" && s.gender !== "male") return false;
                if (dormRestriction === "female-only" && s.gender !== "female") return false;
                return true;
            });
            if (idx === -1) return null;
            const [student] = unassigned.splice(idx, 1);
            return student;
        }

        const makeAssignment = (studentNumber: string, room: Room) => {
            roomOccupancyDelta[room.id] = (roomOccupancyDelta[room.id] ?? 0) + 1;

            assignments.push({
                student_number: studentNumber,
                room_id: room.id,
                confirmed_date: DateTime.now(),
                confirmation_status: "active",
                move_in: DateTime.now(),
                // modify this to vary expected move out 
                expected_move_out: DateTime.now().plus({ months: 6 }),
                grace_period_days: 7
            })
        }

        const getRoomSlots = (room: Room): number => {
            const capacity = room.roomCapacity - room.roomCurrentOccupancy;
            const filled = roomOccupancyDelta[room.id] ?? 0;
            return capacity - filled;
        }

        /*
            Comment this out if you don't need each accommodation to have at least one student.

            This block of code guarantees that there is at least one student per dorm
        */
        // Pass 1
        for (const dorm of dormWithRooms) {
            if (unassigned.length === 0) break;

            for (const room of dorm.rooms) {
                if (getRoomSlots(room) <= 0) continue;
                const student = pickStudent(dorm.tenantRestriction);

                if (!student) break;
                makeAssignment(student.studentNumber, room);
                break;
            }
        }

        // Pass 2: Assign remaining students
        for (const dorm of dormWithRooms) {
            if (unassigned.length === 0 || assignments.length >= 100) break;

            for (const room of dorm.rooms) {
                if (assignments.length >= 100) break;

                const slots = getRoomSlots(room);

                for (let i=0; i < slots; i++) {
                    if (unassigned.length === 0 || assignments.length >= 100) break;

                    const student = pickStudent(dorm.tenantRestriction);

                    if (!student) break;

                    makeAssignment(student.studentNumber, room);
                }
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