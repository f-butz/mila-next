import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe("pk_test_9cjt5OOt0QEXSCjtwMSWfiTz00bv8xIWaF");
  }
  return stripePromise;
};

export default getStripe;