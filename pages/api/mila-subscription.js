const stripe = require('stripe')('sk_test_7vkO11bNgkcywcTqo3mwUC3Y00fK5Yg5vn');
import { buffer } from "micro";

const signingSecret = 'whsec_ac56d1880946bf787da6a833692aac5b2ca79a44b4bd935f8c7e6301748960bf';
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