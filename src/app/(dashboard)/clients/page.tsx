import { getClients } from "@/app/actions/client";
import ClientList from "@/components/clients/ClientList";
import ClientForm from "@/components/clients/ClientForm";

export default async function ClientsPage() {
  const res = await getClients();
  const clients = res.success && res.clients ? res.clients : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <div className="flex items-center space-x-2">
          <ClientForm />
        </div>
      </div>
      <div className="mt-4">
        <ClientList clients={clients} />
      </div>
    </div>
  );
}
