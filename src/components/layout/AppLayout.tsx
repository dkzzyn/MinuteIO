import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSidebar } from "../../context/SidebarContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <>
      <Sidebar />
      <div className={`min-h-screen flex flex-col transition-[margin] duration-200 ease-out ${collapsed ? "ml-16" : "ml-64"}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </>
  );
}
