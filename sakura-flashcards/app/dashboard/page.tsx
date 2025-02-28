import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <div className="w-full rounded-lg bg-black border border-violet-900 p-4 lg:p-6">
      <div className="space-y-10">
        <Dashboard />
      </div>
    </div>
  );
}
