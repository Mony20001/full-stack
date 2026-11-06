import { useEffect, useMemo, useState } from "react";
import { Package, Pencil, Plus, Search, SlidersHorizontal, Trash2, Upload, X } from "lucide-react";
import { api, apiList } from "../lib/api";

const initialProducts = [
  { id: "PRD-001", name: "Vitamin C Serum", category: "Serums", price: 42, stock: 82, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=240&q=60" },
  { id: "PRD-002", name: "Daily Hydrating Cream", category: "Moisturizers", price: 35, stock: 64, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&q=60" },
  { id: "PRD-003", name: "Mineral Sunscreen SPF 50", category: "Sun care", price: 28, stock: 12, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=240&q=60" },
  { id: "PRD-004", name: "Gentle Foam Cleanser", category: "Cleansers", price: 24, stock: 38, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=240&q=60" },
  { id: "PRD-005", name: "Clay Detox Mask", category: "Masks", price: 31, stock: 0, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=240&q=60" },
  { id: "PRD-006", name: "Overnight Repair Oil", category: "Serums", price: 48, stock: 27, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=240&q=60" },
];

const getStatus = (stock) => stock === 0 ? "Out of stock" : stock < 20 ? "Low stock" : "Active";
const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700",
  "Low stock": "bg-amber-50 text-amber-700",
  "Out of stock": "bg-rose-50 text-rose-700",
};
const emptyForm = { name: "", category: "", price: "", stock: "", image: "" };

// Resize + compress so base64 images fit comfortably in localStorage.
const fileToCompressedDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Could not read file"));
  reader.onload = () => {
    const img = new Image();
    img.onerror = () => reject(new Error("Invalid image"));
    img.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function ProductThumb({ product, className = "h-11 w-11" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = Boolean(product.image) && product.image !== failedSrc;
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-emerald-50`}>
      {showImage ? (
        <img src={product.image} alt={product.name} loading="lazy" onError={() => setFailedSrc(product.image)} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-emerald-600"><Package size={18} /></div>
      )}
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageError, setImageError] = useState("");

  const categories = useMemo(() => ["All categories", ...new Set(products.map((product) => product.category))], [products]);

  const loadData = async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        apiList("/api/products?limit=100"), apiList("/api/categories?limit=100"),
      ]);
      setProducts(productData.map((product) => ({
        ...product,
        id: product._id,
        category: product.category_id?.name || "Uncategorized",
        category_id: product.category_id?._id || product.category_id,
      })));
      setCategoryRecords(categoryData);
    } catch (requestError) { setImageError(requestError.message); }
  };

  useEffect(() => { loadData(); }, []);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.id} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (category === "All categories" || product.category === category);
  }), [products, search, category]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, category: product.category_id, price: String(product.price), stock: String(product.stock), image: product.image || "" });
    setImageError("");
    setIsFormOpen(true);
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImageError("Please choose an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setImageError("Image must be smaller than 8 MB."); return; }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setForm((current) => ({ ...current, image: dataUrl }));
      setImageError("");
    } catch {
      setImageError("Could not process that image. Try another file.");
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const savedProduct = { category_id: form.category, name: form.name, image: form.image, price: Number(form.price), stock: Number(form.stock) };
    try {
      await api(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(savedProduct),
      });
      await loadData();
      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (requestError) { setImageError(requestError.message); }
  };

  const removeProduct = async (id) => {
    try { await api(`/api/products/${id}`, { method: "DELETE" }); await loadData(); }
    catch (requestError) { setImageError(requestError.message); }
  };

  const hasUploadedImage = form.image.startsWith("data:");

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="mb-1 text-sm font-medium text-emerald-600">Catalog</p><h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1><p className="mt-1 text-sm text-slate-500">Manage your store products, pricing, and stock.</p></div>
        <button type="button" onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"><Plus size={17} /> Add product</button>
      </header>

      <section aria-label="Product summary" className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total products</p><p className="mt-2 text-2xl font-bold text-slate-900">{products.length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">In stock</p><p className="mt-2 text-2xl font-bold text-slate-900">{products.filter((product) => product.stock > 0).length}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Needs restocking</p><p className="mt-2 text-2xl font-bold text-amber-600">{products.filter((product) => product.stock < 20).length}</p></article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-xs"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>
          <label className="flex items-center gap-2 text-sm text-slate-500"><SlidersHorizontal size={16} /><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-5 py-3 font-medium">Product</th><th scope="col" className="px-4 py-3 font-medium">Category</th><th scope="col" className="px-4 py-3 font-medium">Price</th><th scope="col" className="px-4 py-3 font-medium">Stock</th><th scope="col" className="px-4 py-3 font-medium">Status</th><th scope="col" className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const status = getStatus(product.stock);
                return <tr key={product.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><ProductThumb product={product} /><div><p className="font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 text-xs text-slate-400">{product.id}</p></div></div></td>
                  <td className="px-4 py-4 text-slate-600">{product.category}</td><td className="px-4 py-4 font-medium text-slate-800">${product.price.toFixed(2)}</td>
                  <td className={`px-4 py-4 font-medium ${product.stock < 20 ? "text-amber-700" : "text-slate-600"}`}>{product.stock} units</td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" aria-label={`Edit ${product.name}`} onClick={() => openEditForm(product)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={16} /></button><button type="button" aria-label={`Remove ${product.name}`} onClick={() => removeProduct(product.id)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></div></td>
                </tr>;
              })}
              {filteredProducts.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No products match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Showing {filteredProducts.length} of {products.length} products</div>
      </section>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="product-form-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-start justify-between"><div><h2 id="product-form-title" className="text-lg font-semibold text-slate-900">{editingId ? "Edit product" : "Add product"}</h2><p className="mt-1 text-sm text-slate-500">Enter the product details below.</p></div><button type="button" aria-label="Close form" onClick={() => setIsFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>
          <form onSubmit={saveProduct} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Product name<input required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
            <label className="block text-sm font-medium text-slate-700">Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="">Select a category</option>{categoryRecords.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>

            <div className="block text-sm font-medium text-slate-700">
              Product image
              <div className="mt-1.5 flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-emerald-50">
                  {form.image ? (
                    <img src={form.image} alt="Product preview" className="h-full w-full object-cover" onError={() => setImageError("That image URL could not be loaded.")} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-600"><Package size={26} /></div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Upload size={15} /> Upload image<input type="file" accept="image/*" onChange={handleImageFile} className="sr-only" /></label>
                  {form.image && <button type="button" onClick={() => { setForm({ ...form, image: "" }); setImageError(""); }} className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">Remove</button>}
                </div>
              </div>
              <input type="url" aria-label="Product image URL" value={hasUploadedImage ? "" : form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder={hasUploadedImage ? "Uploaded image selected" : "or paste an image URL (https://...)"} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              <p className="mt-1.5 text-xs font-normal text-slate-400">Uploads are resized and stored in your browser.</p>
              {imageError && <p className="mt-1 text-xs font-normal text-rose-600">{imageError}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Price ($)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label><label className="block text-sm font-medium text-slate-700">Stock quantity<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label></div>
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">{editingId ? "Save changes" : "Add product"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

export default Products;
