import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
      appInfo: {
        name: "Automated Billing System",
        version: "0.1.0",
      },
    })
  : ({} as Stripe); // Dummy object to prevent crashes when testing without API keys

