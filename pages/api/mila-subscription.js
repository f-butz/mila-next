import { buffer } from "micro";
import Cors from "micro-cors";

const Stripe = require("stripe");

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

let stripe = Stripe("sk_test_7vkO11bNgkcywcTqo3mwUC3Y00fK5Yg5vn");

const webhookSecret =
  "whsec_U6jh96gqd1LCPkvUuemfqcPUxvWeedar";

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookHandler = async (req, res) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        webhookSecret
      );
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(
          subscription.customer
        );
        const { email, name } = customer
        console.log("CUSTOMER:", email)
        console.log("SUB:", subscription.plan)
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }


    // Successfully constructed event
    res.status(200).send("✅ Success:", event.id);
  }
};

export default cors(webhookHandler);
