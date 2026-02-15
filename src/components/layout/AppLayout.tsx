import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Sidebar fixa: navegação + usuário e Sair */}
      <Sidebar />
      {/* Conteúdo principal com margem para não ficar por baixo da sidebar */}
      <div className="min-h-screen flex flex-col ml-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </>
  );
}
