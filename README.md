# WEDA RIMC Landing Page - Deploy to Vercel

A static landing page (`index.html`) plus two serverless functions that run the
Razorpay payment securely. Your **Key Secret never lives in the page** - it sits
in a Vercel Environment Variable and is only used on the server.

```
weda-vercel/
├─ index.html              # the landing page (Key ID embedded - that's fine)
├─ api/
│  ├─ create-order.js      # creates a Razorpay order (uses secret, server-side)
│  └─ verify-payment.js    # verifies the payment signature (uses secret)
├─ package.json
├─ vercel.json
├─ .gitignore
└─ .env.example
```

---

## ⚠️ Step 0 - Regenerate your Razorpay keys first

Because the secret was shared in chat, treat it as compromised:

1. Razorpay Dashboard → **Settings → API Keys → Regenerate Key**
2. Copy the new **Key ID** and new **Key Secret**.
3. If the new Key ID is different from `rzp_live_SmNMV8EgL3iP0o`, update it in
   two places: `index.html` (the `RAZORPAY_KEY_ID` line near the bottom) and the
   Vercel env var below.

---

## Option A - Deploy from the Vercel website (easiest, no terminal)

1. Go to **vercel.com** and sign in (GitHub/Google/email).
2. Click **Add New → Project**.
3. Either:
   - **Drag-and-drop:** zip the `weda-vercel` folder contents and upload, **or**
   - Push the folder to a GitHub repo and **Import** it.
4. Framework Preset: **Other** (it's static + serverless). Leave build settings empty.
5. Before deploying, open **Environment Variables** and add:
   | Name | Value |
   |------|-------|
   | `RAZORPAY_KEY_ID` | your (regenerated) Key ID, e.g. `rzp_live_xxxxxxxx` |
   | `RAZORPAY_KEY_SECRET` | your (regenerated) Key Secret |
   Set them for **Production** (and Preview if you want test deploys).
6. Click **Deploy**. In ~30s you get a live URL like `your-project.vercel.app`.

> If you add the env vars *after* the first deploy, click **Redeploy** so they take effect.

---

## Option B - Deploy from the terminal

```bash
npm i -g vercel          # install Vercel CLI (once)
cd weda-vercel
vercel                   # first deploy (answer the prompts)

# add your secrets:
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET

vercel --prod            # promote to production
```

For local testing: copy `.env.example` to `.env`, fill in the keys, then run `vercel dev`.

---

## How the payment flow works

1. Visitor fills the form and clicks **Pay Securely**.
2. Browser calls **`/api/create-order`** → server (with the secret) asks Razorpay
   to create an order and returns just the `orderId`.
3. Razorpay checkout opens with your **Key ID** (public).
4. After payment, the browser calls **`/api/verify-payment`** → server checks the
   signature with the secret and confirms success.

The secret only ever exists inside the two `api/` files at runtime, loaded from
the environment variable. It is not in `index.html` and not in your git history.

---

## Going further (optional)

- **Save orders:** in `create-order.js` (mark PENDING) and `verify-payment.js`
  (mark PAID), drop in your database calls where the comments indicate.
- **WhatsApp/email confirmation:** trigger after successful verification.
- **Webhook backup:** add `/api/webhook` for `payment.captured` and set it in the
  Razorpay Dashboard for extra reliability.
- **Custom domain:** Vercel → Project → **Domains** → add `rimc.wedabooks.com` etc.
- **Analytics/Pixel:** paste GA4 / Meta Pixel snippets just before `</head>` in
  `index.html`.

---

### Quick checklist before going live
- [ ] Regenerated Razorpay keys
- [ ] `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` set in Vercel env vars
- [ ] Key ID in `index.html` matches the live Key ID
- [ ] Did a real ₹1 test (or test-mode keys) end-to-end
- [ ] Confirmed shipping/refund policy links point to your live pages
