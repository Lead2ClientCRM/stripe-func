import express from "express";
import dotenv from "dotenv";
const port = process.env.PORT || 8080;
const app = express();
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post(
  "/new-card",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "customer.updated") {
      const customerId = event.data.object.id;
      const customer = await stripe.customers.retrieve(customerId);
      const newPaymentMethodId =
        customer.invoice_settings.default_payment_method;

      // Use new payment method to retry failed payments
      // Implement your logic here
    }

    res.status(200).send("Webhook received and processed");
  }
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
