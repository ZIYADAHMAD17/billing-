import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Verify Authorization (Vercel Cron standard)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all active schedules where nextRunDate is today or earlier
    const now = new Date();
    const schedules = await prisma.recurringSchedule.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: now },
      },
      include: {
        client: true,
      },
    });

    if (schedules.length === 0) {
      return NextResponse.json({ success: true, message: "No recurring schedules due." });
    }

    let processedCount = 0;

    // 3. Process each schedule
    for (const schedule of schedules) {
      // In a real app, you would clone the previous invoice's line items.
      // For this implementation, we will create a generic "Recurring Billing" item.
      const invoiceNumber = `INV-REC-${Date.now().toString().slice(-4)}`;
      const subtotal = 100.0; // Placeholder: this would come from a defined subscription plan
      const taxTotal = 10.0;
      const total = subtotal + taxTotal;
      
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + (schedule.client.paymentTerms || 30));

      await prisma.invoice.create({
        data: {
          invoiceNumber,
          clientId: schedule.clientId,
          status: "DRAFT",
          issueDate: now,
          dueDate,
          subtotal,
          taxTotal,
          total,
          recurringId: schedule.id,
          items: {
            create: [
              {
                description: `Recurring Subscription (${schedule.interval})`,
                quantity: 1,
                unitPrice: subtotal,
                taxPercent: 10,
                discount: 0,
              },
            ],
          },
        },
      });

      // Calculate next run date
      let nextRunDate = new Date(schedule.nextRunDate);
      if (schedule.interval === "MONTHLY") {
        nextRunDate.setMonth(nextRunDate.getMonth() + 1);
      } else if (schedule.interval === "QUARTERLY") {
        nextRunDate.setMonth(nextRunDate.getMonth() + 3);
      } else if (schedule.interval === "ANNUALLY") {
        nextRunDate.setFullYear(nextRunDate.getFullYear() + 1);
      }

      await prisma.recurringSchedule.update({
        where: { id: schedule.id },
        data: { nextRunDate },
      });

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} recurring invoices successfully.`,
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
