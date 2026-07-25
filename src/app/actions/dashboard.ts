"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const now = new Date();

    // Total Revenue (All PAID invoices)
    const paidInvoices = await prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    });

    // Outstanding (SENT invoices that are not yet due or just pending)
    const outstandingInvoices = await prisma.invoice.aggregate({
      where: { 
        status: { in: ["SENT", "DRAFT"] },
        dueDate: { gte: now }
      },
      _sum: { total: true },
    });

    // Overdue (Not PAID and past due date)
    const overdueInvoices = await prisma.invoice.aggregate({
      where: {
        status: { not: "PAID" },
        dueDate: { lt: now },
      },
      _sum: { total: true },
    });

    // MRR (Estimate from active Monthly recurring schedules)
    const activeMonthlySchedules = await prisma.recurringSchedule.findMany({
      where: { 
        isActive: true,
        interval: "MONTHLY"
      },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    let mrr = 0;
    activeMonthlySchedules.forEach(schedule => {
      if (schedule.invoices.length > 0) {
        mrr += schedule.invoices[0].total; // Approximate MRR based on last invoice total
      }
    });

    return {
      success: true,
      stats: {
        totalRevenue: paidInvoices._sum.total || 0,
        outstanding: outstandingInvoices._sum.total || 0,
        overdue: overdueInvoices._sum.total || 0,
        mrr,
      }
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: "Failed to load stats" };
  }
}

export async function getRecentActivity() {
  try {
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { client: true },
    });
    return { success: true, activity: recentInvoices };
  } catch (error) {
    console.error("Recent Activity Error:", error);
    return { success: false, error: "Failed to load activity" };
  }
}
