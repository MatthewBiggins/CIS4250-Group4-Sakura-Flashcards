import Glossary from "@/components/Glossary";

export default function DashboardPage() {
  return (
    <div className="w-full rounded-lg bg-globalBackground border border-violet-900 p-4 lg:p-6">
      <div className="space-y-10">
        <Glossary />
      </div>
    </div>
  );
}
