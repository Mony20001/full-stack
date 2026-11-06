import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { api, apiList } from "../lib/api";

const emptyForm = { name: "", description: "" };

function Category() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try { setCategories(await apiList("/api/categories?limit=100")); }
    catch (requestError) { setError(requestError.message); }
  };

  useEffect(() => { loadCategories(); }, []);

  const filteredCategories = categories.filter(({ name, description }) =>
    `${name} ${description}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, description: category.description });
    setError("");
    setIsFormOpen(true);
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const duplicate = categories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase() && category._id !== editingId
    );

    if (duplicate) {
      setError("A category with this name already exists.");
      return;
    }

    const savedCategory = { name, description: form.description.trim() || "Product category" };
    try {
      await api(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(savedCategory),
      });
      await loadCategories();
      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setError("");
    } catch (requestError) { setError(requestError.message); }
  };

  const removeCategory = async (id) => {
    try { await api(`/api/categories/${id}`, { method: "DELETE" }); await loadCategories(); }
    catch (requestError) { setError(requestError.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">Catalog</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage your product categories.</p>
        </div>
        <button type="button" onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
          <Plus size={17} /> Add category
        </button>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative border-b border-slate-100 p-4 sm:p-5">
          <Search size={17} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
          />
        </div>

        <ul className="divide-y divide-slate-100">
          {filteredCategories.map((category) => (
            <li key={category._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Tag size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{category.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{category.description}</p>
                </div>
              </div>
              <div className="flex justify-end gap-1">
                <button type="button" aria-label={`Edit ${category.name}`} onClick={() => openEditForm(category)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <Pencil size={16} />
                </button>
                <button type="button" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category._id)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {filteredCategories.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-slate-500">No categories found.</li>
          )}
        </ul>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="category-form-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="category-form-title" className="text-lg font-semibold text-slate-900">{editingId !== null ? "Edit category" : "Add category"}</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the category details below.</p>
              </div>
              <button type="button" aria-label="Close form" onClick={() => setIsFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={saveCategory} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Category name
                <input required maxLength={40} autoFocus value={form.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); setError(""); }} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea maxLength={120} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">{editingId !== null ? "Save changes" : "Add category"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Category;
