import db from "@adonisjs/lucid/services/db";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { DateTime } from "luxon";
import { FileMetadataSeedData } from "#database/seed_data/users";
import FileMetadata from "#models/file_metadatum";

interface FeeSeedData {
    landlord_id: number
    student_number: string
    due_date: DateTime
    fee_category: 'rent' | 'utilities' | 'miscellaneous'
    fee_amount: number
    fee_balance: number
    fee_status: 'paid' | 'unpaid' | 'overdue' | 'partial'
    allow_installments: boolean
}

interface PaymentSeedData {
    fee_id: number
    proof_file_id: number | null
    payment_amount: number
    mode_of_payment: string
    payment_status: 'pending' | 'verified' | 'rejected'
}

// For seeding purposes
const MODE_OF_PAYMENTS = ["bank_transfer", "cash", "gcash", "maya"];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = <T>(arr: T[]): T => arr[rand(0, arr.length -1)];

// for making fake payment proofs
const makePaymentProof = (studentNumber: string, feeId: number, paymentIndex: number): FileMetadataSeedData => {
    const slug = studentNumber.replace('-', '_');
    return {
        fileName: `payment_proof_${slug}_fee_${feeId}_${paymentIndex}.pdf`,
        filePath: `/uploads/documents/payment_proof_${slug}_fee_${feeId}_${paymentIndex}.pdf`,
        fileType: 'document'
    }
}

export default class FeeSeeder extends BaseSeeder {
    async run() {
        // Uncomment to wipe first
        // await db.from("payments").delete();
        // await db.from("fees").delete();

        const assignments = await db
            .from("assignments")
            .join("rooms", "rooms.id", "assignments.room_id")
            .join("accommodations", "accommodations.id", "rooms.accommodation_id")
            .where("assignments.confirmation_status", "active")
            .select(
                "assignments.student_number",
                "rooms.room_rent",
                "accommodations.landlord_id"
            );

        if (assignments.length === 0) {
            console.log("[warn] No active assignments found. If this is a mistake, run AssignmentSeeder first.");
            return;
        }

        const fees: FeeSeedData[] = [];

        for (const assignment of assignments) {
            const rent = Number(assignment.room_rent);

            // Randomizes between 1 to 5 fees
            const feeCount = rand(1,5);

            for (let i=0; i < feeCount; i++) {
                const monthsOffset = i < 2 ? -(i + 1): (i - 1);
                const dueDate = DateTime.now().minus({ months: monthsOffset });
                const isPast = dueDate < DateTime.now();
                let status: FeeSeedData["fee_status"];

                // Change weights as needed
                // Vary fee status
                if (isPast) {
                    // Past due date: can only be overdue, partial, or paid
                    const roll = Math.random();
                    if (roll < 0.65) status = "overdue";
                    else if (roll < 0.85) status = "partial";
                    else status = "paid";
                } else {
                    // Future due date: can only be unpaid or partial
                    const roll = Math.random();
                    if (roll < 0.75) status = "unpaid";
                    else status = "partial";
                }

                // Vary category
                const categoryRoll = Math.random();
                const feeCategory: FeeSeedData["fee_category"] = 
                categoryRoll < 0.6
                    ? "rent"
                    : categoryRoll < 0.85
                        ? "utilities"
                        : "miscellaneous";
                        
                // Randomize fee amount if utilities/misc 
                const feeAmount = 
                feeCategory === "rent"
                    ? rent
                    : feeCategory === "utilities"
                        ? rand(500, 1500)
                        : rand(100, 500);

                let feeBalance: number;
                if (status === "paid") feeBalance = 0;
                else if (status === "partial") feeBalance = rand(
                    // randomize partial payment
                    Math.floor(feeAmount * 0.3),
                    Math.floor(feeAmount * 0.8)
                );
                // for unpaid/overdue fees
                else feeBalance = feeAmount;

                fees.push({
                    landlord_id: assignment.landlord_id,
                    student_number: assignment.student_number,
                    due_date: dueDate,
                    fee_category: feeCategory,
                    fee_amount: feeAmount,
                    fee_balance: feeBalance,
                    fee_status: status,
                    // 50-50
                    allow_installments: Math.random() < 0.5
                });
            }
        }

        for (const fee of fees) {
            const [feeId] = await db.table("fees").insert(fee);

            const amountPaid = fee.fee_amount - fee.fee_balance;

            if (fee.fee_status === "paid" || fee.fee_status === "partial") {
                // randomize payment counts 
                const paymentCount = fee.fee_status === "partial" ? rand(1,2) : 1;
                let remaining = amountPaid;

                for (let p=0; p < paymentCount; p++) {
                    const isLast = p === paymentCount - 1;
                    const paymentAmount = isLast
                        ? remaining
                        : rand(
                            // randomize payment amount
                            Math.floor(remaining * 0.3),
                            Math.floor(remaining * 0.7)
                        );
                    remaining -= paymentAmount;

                    // randomize mode of payment
                    const modeOfPayment = randItem(MODE_OF_PAYMENTS);
                    let proofFileId: number | null = null;

                    // generate proof if MOP isn't cash
                    if (modeOfPayment !== "cash") {
                        const proofData = makePaymentProof(fee.student_number, feeId, p);
                        const proof = await FileMetadata.firstOrCreate(
                            { fileName: proofData.fileName },
                            { ...proofData }
                        );
                        proofFileId = proof.id;
                    }

                    const payment: PaymentSeedData = {
                        fee_id: feeId,
                        proof_file_id: proofFileId,
                        payment_amount: paymentAmount,
                        mode_of_payment: modeOfPayment,
                        payment_status: "verified"
                    };

                    await db.table("payments").insert(payment);
                }
            }
        }

        // for notifying fees count
        const overdueCount = fees.filter((f) => f.fee_status === "overdue").length;
        const paidCount = fees.filter((f) => f.fee_status === "paid").length;
        const partialCount = fees.filter((f) => f.fee_status === "partial").length;
        const unpaidCount = fees.filter((f) => f.fee_status === "unpaid").length;

        console.log(`[seeded] ${fees.length} fees for ${assignments.length} students`);
        console.log(`overdue: ${overdueCount}, unpaid: ${unpaidCount}, partial: ${partialCount}, paid: ${paidCount}`)
    }
}