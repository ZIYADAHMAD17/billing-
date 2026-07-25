import Link from "next/link";
import { Users, FileText, LayoutDashboard, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/50 px-4 flex flex-col">
        <div className="flex h-16 items-center px-2 border-b">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Nexus Billing
          </h1>
        </div>
        <nav className="flex-1 space-y-1 py-4">
          <Link href="/" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/clients" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-md bg-primary/10 text-primary">
            <Users className="mr-3 h-5 w-5" />
            Clients
          </Link>
          <Link href="/invoices" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
            <FileText className="mr-3 h-5 w-5" />
            Invoices
          </Link>
        </nav>
        <div className="p-4 border-t mt-auto">
          <Link href="/settings" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
