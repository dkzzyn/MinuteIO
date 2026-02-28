import { useMemo, useState } from "react";
import type { UserProfile } from "../../services/profileApi";
import DadosPessoaisTab from "./DadosPessoaisTab";
import TimeTab from "./TimeTab";
import PontuacaoTab from "./PontuacaoTab";
import DashboardTab from "./DashboardTab";

type TabId = "dados" | "time" | "pontuacao" | "dashboard";

type Props = {
  profile: UserProfile;
  onProfileSave: (input: { name: string; avatarUrl: string | null }) => Promise<void>;
  onError: (message: string) => void;
};

export default function ProfileTabs({ profile, onProfileSave, onError }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("dados");

  const tabs = useMemo(
    () => [
      { id: "dados" as const, label: "Dados Pessoais" },
      { id: "time" as const, label: "Time" },
      { id: "pontuacao" as const, label: "Pontuação" },
      { id: "dashboard" as const, label: "Dashboard" },
    ],
    []
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-3 py-2 text-sm ${
              activeTab === tab.id ? "bg-emerald-500 text-slate-950 font-medium" : "bg-slate-800 text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dados" && <DadosPessoaisTab profile={profile} onSave={onProfileSave} onError={onError} />}
      {activeTab === "time" && <TimeTab profile={profile} onError={onError} />}
      {activeTab === "pontuacao" && <PontuacaoTab />}
      {activeTab === "dashboard" && <DashboardTab />}
    </section>
  );
}
