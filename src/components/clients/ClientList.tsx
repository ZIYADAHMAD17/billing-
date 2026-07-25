"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteClient } from "@/app/actions/client";
import { toast } from "@/components/ui/toast";
// Note: We need a ToastProvider to use useToast, or we can use the simpler toast function from sonner if we install it. 
// For now, we'll build the basic structure.

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  paymentTerms: number | null;
};

export default function ClientList({ clients }: { clients: Client[] }) {
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    const res = await deleteClient(id);
    if (res.success) {
      alert("Client deleted");
    } else {
      alert("Failed to delete client");
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Terms</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.company || "-"}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>Net {client.paymentTerms || 30}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
