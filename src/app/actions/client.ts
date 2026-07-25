"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(data: { name: string; company?: string; email: string; billingAddress?: string; paymentTerms?: number }) {
  try {
    const client = await prisma.client.create({
      data,
    });
    revalidatePath("/clients");
    return { success: true, client };
  } catch (error: any) {
    console.error("Create Client Error:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "A client with this email already exists." };
    }
    return { success: false, error: "Failed to create client. Please check your connection." };
  }
}

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, clients };
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return { success: false, error: "Failed to fetch clients" };
  }
}

export async function updateClient(id: string, data: { name?: string; company?: string; email?: string; billingAddress?: string; paymentTerms?: number }) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    revalidatePath("/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Failed to update client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete client:", error);
    return { success: false, error: "Failed to delete client" };
  }
}
