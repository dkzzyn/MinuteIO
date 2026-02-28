import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../infrastructure/http/api";
import { createPost, deletePost, listPosts, type PostItem, updatePost } from "../services/postsApi";

export default function PostsPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const hasPosts = useMemo(() => posts.length > 0, [posts]);

  async function refreshPosts() {
    if (!token) return;
    try {
      setError(null);
      const data = await listPosts(token);
      setPosts(data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Falha ao carregar posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const content = newContent.trim();
    if (!content) return;
    try {
      setSaving(true);
      setError(null);
      const created = await createPost(token, content);
      setPosts((prev) => [created, ...prev]);
      setNewContent("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Falha ao criar post.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(post: PostItem) {
    setEditingId(post.id);
    setEditingContent(post.content);
  }

  async function handleUpdate(postId: string) {
    if (!token) return;
    const content = editingContent.trim();
    if (!content) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await updatePost(token, postId, content);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setEditingId(null);
      setEditingContent("");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Falha ao atualizar post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!token) return;
    try {
      setSaving(true);
      setError(null);
      await deletePost(token, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (editingId === postId) {
        setEditingId(null);
        setEditingContent("");
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Falha ao remover post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie seus posts salvos no banco de dados.
        </p>
      </header>

      <form onSubmit={handleCreate} className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 mb-5">
        <label htmlFor="new-post-content" className="block text-sm mb-2">
          Novo post
        </label>
        <textarea
          id="new-post-content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Digite o conteúdo do post..."
          className="w-full min-h-24 rounded-md bg-slate-950 border border-slate-700 p-3 text-sm"
          disabled={saving}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving || !newContent.trim()}
            className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-medium disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Criar post"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Carregando posts...</p>
      ) : !hasPosts ? (
        <p className="text-sm text-slate-400">Você ainda não possui posts.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
              {editingId === post.id ? (
                <>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full min-h-20 rounded-md bg-slate-950 border border-slate-700 p-3 text-sm"
                    disabled={saving}
                  />
                  <div className="mt-3 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingContent("");
                      }}
                      className="px-3 py-1.5 rounded-md bg-slate-700 text-sm"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(post.id)}
                      className="px-3 py-1.5 rounded-md bg-blue-500 text-slate-950 text-sm font-medium disabled:opacity-50"
                      disabled={saving || !editingContent.trim()}
                    >
                      Salvar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Criado em {new Date(post.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <div className="mt-3 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="px-3 py-1.5 rounded-md bg-slate-700 text-sm"
                      disabled={saving}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1.5 rounded-md bg-red-500 text-slate-950 text-sm font-medium"
                      disabled={saving}
                    >
                      Apagar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
