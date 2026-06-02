// /api/verify-payment  —  verifies the Razorpay payment signature.
// This proves the payment is genuine. Never trust the browser's word alone.

import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  if (!KEY_SECRET) {
    return res.status(500).json({ error: "Razorpay secret not configured" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      amount,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: "failed", error: "Missing fields" });
    }

    const expected = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = expected === razorpay_signature;

    if (valid) {
      // Payment verified.
      // (Optional) Mark the order PAID in your database, send WhatsApp/email,
      // and trigger fulfilment here using `customer` and `amount`.
      return res.status(200).json({ status: "success", paymentId: razorpay_payment_id });
    }

    return res.status(400).json({ status: "failed" });
  } catch (err) {
    return res.status(500).json({ status: "failed", error: "Server error" });
  }
}
