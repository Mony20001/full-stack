import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { api, apiList } from "../lib/api";

const initialOrders = [
  { id: "ORD-1001", customer: "Ava Johnson", date: "2026-09-24", items: 3, total: 105, status: "Delivered" },
  { id: "ORD-1002", customer: "Noah Williams", date: "2026-09-24", items: 1, total: 42, status: "Processing" },
  { id: "ORD-1003", customer: "Mia Chen", date: "2026-09-23", items: 2, total: 63, status: "Shipped" },
  { id: "ORD-1004", customer: "Liam Garcia", date: "2026-09-22", items: 4, total: 128, status: "Pending" },
  { id: "ORD-1005", customer: "Sophia Patel", date: "2026-09-21", items: 2, total: 76, status: "Cancelled" },
];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-sky-50 text-sky-700",
  Shipped: "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-700",
};
const orderStatuses = Object.keys(statusStyles);

function Order() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const loadOrders = async () => {
    const data = await apiList("/api/orders?limit=100");
    setOrders(data.map((order) => ({
      id: order._id,
      customer: order.customer_id?.userName || order.customer_id?.userEmail || "Unknown customer",
      date: order.order_date || order.createdAt,
      items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.total,
      status: `${order.status[0].toUpperCase()}${order.status.slice(1)}`,
    })));
  };

  useEffect(() => { loadOrders().catch(console.error); }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (statusFilter === "All statuses" || order.status === statusFilter);
  }), [orders, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try { await api(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status: status.toLowerCase() }) }); await loadOrders(); }
    catch (error) { console.error(error); }
  };

  const totalRevenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-7 border-b border-slate-200 pb-6">
        <p className="mb-1 text-sm font-medium text-emerald-600">Sales</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Review orders and update their fulfillment status.</p>
      </header>

      <section aria-label="Order summary" className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{orders.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Awaiting fulfillment</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{orders.filter((order) => ["Pending", "Processing"].includes(order.status)).length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Order value (excludes cancelled)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-xs">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search orders" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order or customer..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <label className="text-sm text-slate-500">
            <span className="sr-only">Filter by status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option>All statuses</option>
              {orderStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th scope="col" className="px-5 py-3 font-medium">Order</th><th scope="col" className="px-4 py-3 font-medium">Customer</th><th scope="col" className="px-4 py-3 font-medium">Date</th><th scope="col" className="px-4 py-3 font-medium">Items</th><th scope="col" className="px-4 py-3 font-medium">Total</th><th scope="col" className="px-5 py-3 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ShoppingBag size={17} /></div><span className="font-semibold text-slate-800">{order.id}</span></div></td>
                  <td className="px-4 py-4 text-slate-600">{order.customer}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-slate-600">{order.items}</td>
                  <td className="px-4 py-4 font-medium text-slate-800">${order.total.toFixed(2)}</td>
                  <td className="px-5 py-4"><label className="sr-only" htmlFor={`status-${order.id}`}>Status for {order.id}</label><select id={`status-${order.id}`} value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${statusStyles[order.status]}`}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                </tr>
              ))}
              {filteredOrders.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No orders match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Showing {filteredOrders.length} of {orders.length} orders</div>
      </section>
    </div>
  );
}

export default Order;
