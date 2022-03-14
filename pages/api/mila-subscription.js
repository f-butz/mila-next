const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { buffer } from "micro";
import Cors from 'micro-cors';

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

const signingSecret = process.env.STRIPE_SIGNING_SECRET;
export const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  if (req.method === "POST") {
    const signature = req.headers["stripe-signature"];
    const reqBuffer = await buffer(req);

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        reqBuffer.toString(),
        signature,
        signingSecret
      );
      console.log({ event });
    } catch (error) {
      console.log(error);
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    console.log(JSON.stringify(event.data));

    res.json({ recieved: true });
  }
};

export default cors(handler);
