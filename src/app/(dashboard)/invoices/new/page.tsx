"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/app/actions/client";
import { createInvoice } from "@/app/actions/invoice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0, taxPercent: 0, discount: 0 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClients().then(res => setClients(res.success ? res.clients || [] : []));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, taxPercent: 0, discount: 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createInvoice({
      clientId,
      dueDate: new Date(dueDate),
      items,
    });
    setLoading(false);
    if (res.success) {
      alert("Invoice created!");
      router.push("/invoices");
    } else {
      alert("Error creating invoice");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Create New Invoice</h2>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={clientId} 
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Line Items</h3>
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end border p-4 rounded-md">
                  <div className="flex-1 space-y-2">
                    <Label>Description</Label>
                    <Input value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} required />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Qty</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} required />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))} required />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Tax (%)</Label>
                    <Input type="number" value={item.taxPercent} onChange={(e) => handleItemChange(index, "taxPercent", Number(e.target.value))} />
                  </div>
                  <Button type="button" variant="destructive" onClick={() => setItems(items.filter((_, i) => i !== index))}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddItem}>Add Line Item</Button>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Generate Draft Invoice"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
