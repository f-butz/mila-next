
import { buffer } from "micro";
import Cors from "micro-cors";
import ShortUniqueId from 'short-unique-id';

const Stripe = require("stripe");
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  "6I8EXhaRJFWbKjha7-Ja0w"
)

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const uid = new ShortUniqueId({ length: 10 });

let stripe = Stripe("sk_test_7vkO11bNgkcywcTqo3mwUC3Y00fK5Yg5vn");

const webhookSecret =
  "whsec_KvVgfiiVt5qzFADkLazZyBJ5hhYeX89d";

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

        const code = uid()

        const message = {
          from_email: "noreply@ruoka.app",
          from_name: "Shapeschool",
          subject: "Dein Aktivierungscode für Mila",
          html: `<p>Hallo ${name},</p>
                <p>wir freuen uns, dass du dich für Mila entschieden hast.</p>
                <p>Mit folgendem Code erhältst du Zugang zu allen Features der App:</p>
                <p><strong>${code}</strong></p>
                <p>Liebe Grüße<br/>
                Dein Team von Mila </p>
        `,
          to: [
            {
              email: values.email,
              type: "to",
            },
          ],
        }

        const response = await mailchimp.messages
          .send({
            message,
          })
          .catch(e => console.log(e))
          .then(res => {
            console.log(res)
          })
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }


    // Successfully constructed event
    res.status(200).send("✅ Success:", event.id);
  }
};

export default cors(webhookHandler);
