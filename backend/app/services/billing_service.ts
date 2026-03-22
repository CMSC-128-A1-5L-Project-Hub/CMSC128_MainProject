import Fee from "#models/fee";
import Payment from "#models/payment";
import db from "@adonisjs/lucid/services/db";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";

export default class BillingService {
    /*
        Student makes a payment for a fee
        Make payment entry
    */
    static async payFee(
        feeId: number,
        paymentAmount: number,
        modeOfPayment: string,
        proofFileId: number | null = null //for cash payments that do not require proofs
    ): Promise<Payment> {
        //Get fee to be paid for
        const fee = await Fee.query()
        .where('id', feeId)
        .firstOrFail()

        //Check if payment amount exceeds the fee's balance
        if (paymentAmount > fee.feeBalance) {
            throw new Error('Payment amount exceeds remaining fee balance')
        }

        //Make payment (status defaults to pending)
        const payment = await Payment.create({
            feeId: fee.id,
            paymentAmount,
            modeOfPayment,
            proofFileId
        })

        return payment
    }

   /*
        Landlord verifies payment
        Fee gets updated (status and balance)
   */
    static async verifyPayment(
        paymentId: number 
    ): Promise<Fee>{
        return db.transaction(async (trx: TransactionClientContract) => {
            //Get payment to be verified
            const payment = await Payment.query({ client: trx })
            .where('id', paymentId)
            .preload('fee')
            .firstOrFail()

            //Check if payment is still unverified (pending)
            if (payment.paymentStatus === 'verified') {
                throw new Error('Payment has already been verified')
            }

            //Update payment status to verified
            payment.paymentStatus = 'verified'
            await payment.useTransaction(trx).save()

            //Get fee
            const fee = payment.fee

            //Update fee balance
            fee.feeBalance -= payment.paymentAmount

            //Update fee status
            if (fee.feeBalance === 0) {
                fee.feeStatus = 'paid'
            } else if (fee.dueDate && fee.dueDate < DateTime.now()) {
                fee.feeStatus = 'overdue'
            } else {
                fee.feeStatus = 'partial'
            }

            await fee.useTransaction(trx).save()
            return fee
        })
    }
}