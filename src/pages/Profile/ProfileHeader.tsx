import type { UserProfile } from "../../services/profileApi";

type Props = {
  profile: UserProfile;
};

function roleLabel(role: string) {
  const normalized = role.toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "supervisor") return "Supervisor";
  return "User";
}

export default function ProfileHeader({ profile }: Props) {
  const initial = (profile.name?.trim()?.charAt(0) || "U").toUpperCase();

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
      <div className="flex items-center gap-4">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name} className="h-20 w-20 rounded-full object-cover border border-slate-600" />
        ) : (
          <div className="h-20 w-20 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-2xl font-semibold">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">{profile.name}</h1>
          <p className="text-sm text-slate-300 truncate">{profile.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-slate-600 px-2 py-1">Papel: {roleLabel(profile.role)}</span>
            <span className="rounded-full border border-slate-600 px-2 py-1">Empresa: Não vinculada</span>
          </div>
        </div>
      </div>
    </section>
  );
}
