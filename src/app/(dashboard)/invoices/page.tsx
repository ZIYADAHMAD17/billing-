import { getInvoices } from "@/app/actions/invoice";
import InvoiceList from "@/components/invoices/InvoiceList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function InvoicesPage() {
  const res = await getInvoices();
  // @ts-ignore
  const invoices = res.success && res.invoices ? res.invoices : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2">
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <InvoiceList invoices={invoices} />
      </div>
    </div>
  );
}
