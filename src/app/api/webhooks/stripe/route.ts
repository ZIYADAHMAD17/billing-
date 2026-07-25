import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing stripe signature or webhook secret");
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Retrieve the invoice ID from the metadata
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      try {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { 
            status: "PAID",
            stripePaymentId: session.payment_intent as string || session.id 
          },
        });
        console.log(`Invoice ${invoiceId} marked as PAID.`);
      } catch (error) {
        console.error("Failed to update invoice status:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
