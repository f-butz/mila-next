import Cors from "micro-cors";
import ShortUniqueId from "short-unique-id";
import client from "../../apollo-clients";
import { gql } from "@apollo/client";

const mailchimp = require("@mailchimp/mailchimp_transactional")(
  "6I8EXhaRJFWbKjha7-Ja0w"
);

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const uid = new ShortUniqueId({ length: 10 });

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookHandler = async (req, res) => {
  let input = {};
  const code = await uid();
  console.log(code);

  const today = new Date()
  console.log(today)
  input = {
    code: code,
    value: 12,
  };

  try {
    const response = await client.mutate({
      mutation: gql`mutation createCode($input: CodeInput! ) {
          createCode(input: $input) {
              code
              value
          }
      }`,
      variables: {
        input: input
      }
    })
    console.log(response)
  } catch (err) {
    console.log(err);
    res.status(400).send("FUCK")
  }




  // Successfully constructed event
  res.status(200).send({ code: code.toString() });
};

export default cors(webhookHandler);
