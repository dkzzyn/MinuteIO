import { FormEvent, useEffect, useState } from "react";
import type { UserProfile } from "../../services/profileApi";

type Props = {
  profile: UserProfile;
  onSave: (input: { name: string; avatarUrl: string | null }) => Promise<void>;
  onError: (message: string) => void;
};

export default function DadosPessoaisTab({ profile, onSave, onError }: Props) {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile.name, profile.avatarUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave({
        name: name.trim() || profile.name,
        avatarUrl: avatarUrl.trim() || null,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-lg font-medium mb-3">Dados Pessoais</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="profile-name" className="block text-sm mb-1">
            Nome
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="profile-avatar" className="block text-sm mb-1">
            URL do avatar
          </label>
          <input
            id="profile-avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">Upload pode ser conectado depois; por enquanto, URL.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </section>
  );
}
