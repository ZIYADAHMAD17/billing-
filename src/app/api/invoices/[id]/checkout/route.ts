import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: invoiceId } = await context.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    // Build line items for Stripe
    const line_items = invoice.items.map((item) => {
      // Calculate unit amount in cents, factoring in tax but NOT discount (simplified for this scope)
      // For real-world, Stripe supports discounts/coupons directly or you subtract it manually.
      const unitPriceWithTax = item.unitPrice * (1 + item.taxPercent / 100);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(unitPriceWithTax * 100), // convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Determine the base URL for success/cancel redirects
    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "") {
      // Simulate payment for local testing without Stripe API Keys
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID", stripePaymentId: `sim_payment_${Date.now()}` }
      });
      return NextResponse.json({ url: `${baseUrl}/invoice/${invoiceId}?success=true` });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${baseUrl}/invoice/${invoiceId}?success=true`,
      cancel_url: `${baseUrl}/invoice/${invoiceId}?canceled=true`,
      customer_email: invoice.client.email,
      metadata: {
        invoiceId: invoice.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
