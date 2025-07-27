import Navbar from "@/app/dashboard/components/Navbar";
import Search from "./components/Search";
import LiveChat from "@/components/LiveChat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <Navbar />

      <main className="p-2 md:p-4 overflow-y-auto">
        <div className="flex justify-center pt-2 lg:pt-[8rem]">
          <Search />
        </div>

        {children}
      </main>

      {/* Live Chat Component */}
      <LiveChat />
    </div>
  );
}
