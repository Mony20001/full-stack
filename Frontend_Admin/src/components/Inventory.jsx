import { useEffect, useMemo, useState } from "react";
import { Boxes, Search } from "lucide-react";
import { api, apiList } from "../lib/api";

const initialInventory = [
  { id: "PRD-001", name: "Vitamin C Serum", category: "Serums", stock: 82, reorderLevel: 20 },
  { id: "PRD-002", name: "Daily Hydrating Cream", category: "Moisturizers", stock: 64, reorderLevel: 20 },
  { id: "PRD-003", name: "Mineral Sunscreen SPF 50", category: "Sun care", stock: 12, reorderLevel: 20 },
  { id: "PRD-004", name: "Gentle Foam Cleanser", category: "Cleansers", stock: 38, reorderLevel: 15 },
  { id: "PRD-005", name: "Clay Detox Mask", category: "Masks", stock: 0, reorderLevel: 10 },
  { id: "PRD-006", name: "Overnight Repair Oil", category: "Serums", stock: 27, reorderLevel: 12 },
];

const getStockStatus = (item) => item.stock === 0 ? "Out of stock" : item.stock <= item.reorderLevel ? "Low stock" : "In stock";
const statusStyles = {
  "In stock": "bg-emerald-50 text-emerald-700",
  "Low stock": "bg-amber-50 text-amber-700",
  "Out of stock": "bg-rose-50 text-rose-700",
};

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All stock levels");

  const loadInventory = async () => {
    const data = await apiList("/api/inventory?limit=100");
    setInventory(data.map((item) => ({
      id: item._id,
      name: item.product_id?.name || "Unknown product",
      category: item.category_id?.name || "Uncategorized",
      stock: item.quantity,
      reorderLevel: item.reorder_level,
    })));
  };

  useEffect(() => { loadInventory().catch(console.error); }, []);

  const filteredInventory = useMemo(() => inventory.filter((item) => {
    const matchesSearch = `${item.id} ${item.name} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase());
    const status = getStockStatus(item);
    return matchesSearch && (filter === "All stock levels" || status === filter);
  }), [inventory, search, filter]);

  const updateStock = async (id, value) => {
    const stock = Math.max(0, Number(value) || 0);
    try { await api(`/api/inventory/${id}`, { method: "PATCH", body: JSON.stringify({ quantity: stock }) }); await loadInventory(); }
    catch (error) { console.error(error); }
  };

  const lowStockCount = inventory.filter((item) => item.stock > 0 && item.stock <= item.reorderLevel).length;
  const outOfStockCount = inventory.filter((item) => item.stock === 0).length;
  const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-7 border-b border-slate-200 pb-6">
        <p className="mb-1 text-sm font-medium text-emerald-600">Catalog</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor stock levels and update product quantities.</p>
      </header>

      <section aria-label="Inventory summary" className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total units</p><p className="mt-2 text-2xl font-bold text-slate-900">{totalUnits}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Low stock</p><p className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Out of stock</p><p className="mt-2 text-2xl font-bold text-rose-600">{outOfStockCount}</p></article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-xs">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <label className="text-sm text-slate-500">
            <span className="sr-only">Filter by stock level</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option>All stock levels</option><option>In stock</option><option>Low stock</option><option>Out of stock</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-5 py-3 font-medium">Product</th><th scope="col" className="px-4 py-3 font-medium">Category</th><th scope="col" className="px-4 py-3 font-medium">Reorder level</th><th scope="col" className="px-4 py-3 font-medium">Quantity</th><th scope="col" className="px-5 py-3 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                return <tr key={item.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Boxes size={17} /></div><div><p className="font-semibold text-slate-800">{item.name}</p><p className="mt-0.5 text-xs text-slate-400">{item.id}</p></div></div></td>
                  <td className="px-4 py-4 text-slate-600">{item.category}</td>
                  <td className="px-4 py-4 text-slate-600">{item.reorderLevel} units</td>
                  <td className="px-4 py-4"><label className="sr-only" htmlFor={`stock-${item.id}`}>Quantity for {item.name}</label><input id={`stock-${item.id}`} type="number" min="0" step="1" value={item.stock} onChange={(event) => updateStock(item.id, event.target.value)} className="w-24 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span></td>
                </tr>;
              })}
              {filteredInventory.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-500">No inventory items match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Showing {filteredInventory.length} of {inventory.length} products</div>
      </section>
    </div>
  );
}

export default Inventory;
