"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: {
  clientId: string;
  dueDate: Date;
  items: { description: string; quantity: number; unitPrice: number; taxPercent: number; discount: number }[];
}) {
  try {
    let subtotal = 0;
    let taxTotal = 0;

    data.items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice - item.discount;
      subtotal += lineTotal;
      taxTotal += lineTotal * (item.taxPercent / 100);
    });

    const total = subtotal + taxTotal;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: data.clientId,
        dueDate: data.dueDate,
        subtotal,
        taxTotal,
        total,
        status: "DRAFT",
        items: {
          create: data.items,
        },
      },
    });

    revalidatePath("/invoices");
    return { success: true, invoice };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, invoices };
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return { success: false, error: "Failed to fetch invoices" };
  }
}
