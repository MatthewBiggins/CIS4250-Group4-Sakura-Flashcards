import Login from "@/components/Login";

export default function LoginPage() {
  return (
    <div className="container max-md:px-4 flex flex-col justify-between items-center">
      <div className="relative overflow-hidden w-full rounded-lg bg-black border border-violet-900 p-4 lg:p-6">
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-bold">Login</h1>
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
}
