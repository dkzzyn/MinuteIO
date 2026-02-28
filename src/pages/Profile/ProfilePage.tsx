import { useEffect, useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import { getMyProfile, updateMyProfile, type UserProfile } from "../../services/profileApi";

function createFallbackProfile(): UserProfile {
  return {
    id: "",
    name: "Usuário",
    email: "usuario@minuteio.local",
    role: "user",
    avatarUrl: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(createFallbackProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setError(null);
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) return <div>Carregando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {error && (
        <div className="fixed right-4 top-4 z-[60] w-full max-w-md rounded-lg border border-red-500/50 bg-slate-900 px-4 py-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              aria-label="Fechar aviso"
            >
              X
            </button>
          </div>
        </div>
      )}

      <ProfileHeader profile={profile} />
      <ProfileTabs
        profile={profile}
        onError={setError}
        onProfileSave={async (input) => {
          const updated = await updateMyProfile(input);
          setProfile(updated);
        }}
      />
    </div>
  );
}
