// /api/create-order  —  creates a Razorpay order on the server.
// The Key Secret is read from the RAZORPAY_KEY_SECRET environment variable.
// It is NEVER sent to the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const KEY_ID = process.env.RAZORPAY_KEY_ID;
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!KEY_ID || !KEY_SECRET) {
    return res.status(500).json({ error: "Razorpay keys not configured on server" });
  }

  try {
    const { amount, customer } = req.body || {};
    const rupees = Number(amount);
    if (!rupees || rupees < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Razorpay expects the amount in paise (smallest unit)
    const payload = {
      amount: Math.round(rupees * 100),
      currency: "INR",
      receipt: "weda_" + Date.now(),
      notes: {
        product: customer?.product || "",
        student: customer?.studentName || "",
        mobile: customer?.mobile || "",
      },
    };

    // Basic-auth with key_id:key_secret (secret stays here, server-side)
    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const order = await rzpRes.json();

    if (!rzpRes.ok) {
      return res.status(502).json({ error: "Razorpay order failed", detail: order });
    }

    // (Optional) Save a PENDING order to your database here using `customer`.

    return res.status(200).json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
