const Stripe = require("stripe");
import { buffer } from "micro";

const signingSecret = process.env.STRIPE_SIGNING_SECRET;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const reqBuffer = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
    console.log({ event });
  } catch (error) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  console.log(JSON.stringify(event.data))

  res.send({ recieved: true });
}

export default handler