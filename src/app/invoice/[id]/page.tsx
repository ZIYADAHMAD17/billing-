"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, CreditCard, CheckCircle2 } from "lucide-react";

export default function PublicInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccess(true);
    }
    
    // For simplicity in Phase 4 without creating a new action, we'll fetch via a direct route or mock fetch. 
    // In a production app, we'd have a public API route to fetch this specific invoice.
    // For this boilerplate, let's assume we have a simple fetch endpoint or we pass the data.
    // I'll create a quick fetch to an imaginary public route, but wait, we need an endpoint to get the invoice data!
    fetch(`/api/invoices/${typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''}/public`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setInvoice(null);
        } else {
          setInvoice(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id, searchParams]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}/checkout`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Failed to initiate payment");
      }
    } catch (error) {
      console.error(error);
    }
    setPaying(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Invoice...</div>;
  if (!invoice) return <div className="min-h-screen flex items-center justify-center">Invoice Not Found</div>;

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {success && (
          <div className="mb-8 p-4 bg-green-50 text-green-900 border border-green-200 rounded-md flex items-center">
            <CheckCircle2 className="mr-3 h-6 w-6 text-green-600" />
            <p className="font-medium">Thank you! Your payment was successful.</p>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
            <div>
              <CardTitle className="text-3xl font-bold">Invoice</CardTitle>
              <p className="text-muted-foreground mt-1">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Nexus Billing
              </h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-8">
              <div>
                <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Billed To</h3>
                <p className="font-medium">{invoice.client.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-1">Status</h3>
                  <Badge variant={invoice.status === "PAID" ? "default" : "secondary"}>
                    {invoice.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-1">Due Date</h3>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-right font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${invoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total Due</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end space-x-4 border-t pt-6">
              <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </a>
              {invoice.status !== "PAID" && (
                <Button onClick={handlePayment} disabled={paying}>
                  <CreditCard className="mr-2 h-4 w-4" /> 
                  {paying ? "Processing..." : "Pay Now securely via Stripe"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
