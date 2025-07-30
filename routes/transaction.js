const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { requireSignin, isAuth } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { create_checkout_session } = require("../controllers/braintree");
const { Order } = require("../models/order");

const endpointSecret = process.env.WEBHOOK_SECRET;

// Checkout session route
router.post("/stripe/checkout/:userId", requireSignin, isAuth, create_checkout_session);

// Transaction check
router.get("/stripe/transaction/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === "paid") {
      return res.json({ status: "succeeded", transactionId: session.payment_intent });
    } else {
      return res.json({ status: "failed" });
    }
  } catch (error) {
    console.error("Stripe transaction error:", error);
    return res.status(500).json({ error: "Failed to retrieve transaction" });
  }
});

router.param("userId", userById);

// Export routes
const stripeRouter = router;

// Separate router for Stripe webhook (raw body)
const webhookRoute = express
  .Router()
  .post("/", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;

    switch (event.type) {
      case "checkout.session.completed":
        console.log("✅ Checkout completed");
        try {
          const newOrder = {
            transaction_id: session.payment_intent,
            products:JSON.parse(session.metadata.products),
            full_name: session.metadata.full_name,
            address: session.metadata.address,
            phone_no: session.metadata.phone_no,
            payment_status: session.payment_status,
            stripe_session_id: session.id,
            stripe_customer_email: session.customer_details?.email,
          };
          const saved = await new Order(newOrder).save();
          console.log("✅ Order saved:", saved._id);
        } catch (err) {
          console.error("❌ Failed to save order:", err.message);
        }
        break;

      case "payment_intent.succeeded":
        console.log("💰 Payment succeeded:", session.id);
        break;

      default:
        console.log(`⚠️ Unhandled event: ${event.type}`);
    }

    res.status(200).send("Received");
  });

module.exports = { stripeRouter, webhookRoute };
