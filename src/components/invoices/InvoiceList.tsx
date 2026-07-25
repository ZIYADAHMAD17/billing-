"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  dueDate: Date;
  client: { name: string };
};

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const [payingId, setPayingId] = useState<string | null>(null);

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/checkout`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      alert("Error initiating payment");
    }
    setPayingId(null);
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                <TableCell>{inv.client?.name}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === "PAID" ? "default" : "secondary"}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">${inv.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/invoice/${inv.id}`} target="_blank">
                      <Button variant="outline" size="sm" title="View Public Portal">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    {inv.status !== "PAID" && (
                      <Button 
                        size="sm" 
                        onClick={() => handlePay(inv.id)} 
                        disabled={payingId === inv.id}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> 
                        {payingId === inv.id ? "..." : "Pay"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
