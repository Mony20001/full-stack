import { useEffect, useMemo, useState } from "react";
import { Search, Truck } from "lucide-react";
import { api, apiList } from "../lib/api";

const initialDeliveries = [
  { id: "DLV-2001", order: "ORD-1001", customer: "Ava Johnson", address: "18 Sukhumvit Road, Bangkok", date: "2026-09-26", carrier: "Seven Care Express", status: "In transit" },
  { id: "DLV-2002", order: "ORD-1002", customer: "Noah Williams", address: "42 Silom Road, Bangkok", date: "2026-09-27", carrier: "Flash Express", status: "Preparing" },
  { id: "DLV-2003", order: "ORD-1003", customer: "Mia Chen", address: "7 Nimmanahaeminda Road, Chiang Mai", date: "2026-09-25", carrier: "Thailand Post", status: "Delivered" },
  { id: "DLV-2004", order: "ORD-1004", customer: "Liam Garcia", address: "91 Beach Road, Phuket", date: "2026-09-28", carrier: "Seven Care Express", status: "Preparing" },
  { id: "DLV-2005", order: "ORD-1005", customer: "Sophia Patel", address: "5 Rama IV Road, Bangkok", date: "2026-09-24", carrier: "Flash Express", status: "Delayed" },
];

const deliveryStatuses = ["Pending", "Picked up", "In transit", "Delivered", "Failed"];
const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  "Picked up": "bg-sky-50 text-sky-700",
  "In transit": "bg-sky-50 text-sky-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Failed: "bg-rose-50 text-rose-700",
};

function Delivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const formatStatus = (status) => status.split("_").map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(" ");
  const loadDeliveries = async () => {
    const data = await apiList("/api/deliveries?limit=100");
    setDeliveries(data.map((delivery) => ({
      id: delivery._id,
      order: delivery.order_id?._id || delivery.order_id,
      customer: delivery.customer_id?.userName || delivery.customer_id?.userEmail || "Unknown customer",
      address: delivery.destination,
      date: delivery.est_delivery,
      carrier: delivery.carrier,
      status: formatStatus(delivery.status),
    })));
  };

  useEffect(() => { loadDeliveries().catch(console.error); }, []);

  const filteredDeliveries = useMemo(() => deliveries.filter((delivery) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = `${delivery.id} ${delivery.order} ${delivery.customer} ${delivery.carrier}`.toLowerCase().includes(query);
    return matchesSearch && (statusFilter === "All statuses" || delivery.status === statusFilter);
  }), [deliveries, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try { await api(`/api/deliveries/${id}`, { method: "PATCH", body: JSON.stringify({ status: status.toLowerCase().replace(" ", "_") }) }); await loadDeliveries(); }
    catch (error) { console.error(error); }
  };

  const activeCount = deliveries.filter((delivery) => delivery.status === "Pending" || delivery.status === "Picked up" || delivery.status === "In transit").length;
  const deliveredCount = deliveries.filter((delivery) => delivery.status === "Delivered").length;
  const delayedCount = deliveries.filter((delivery) => delivery.status === "Failed").length;

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-7 border-b border-slate-200 pb-6">
        <p className="mb-1 text-sm font-medium text-emerald-600">Fulfillment</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery</h1>
        <p className="mt-1 text-sm text-slate-500">Track shipments, delivery dates, carriers, and fulfillment status.</p>
      </header>

      <section aria-label="Delivery summary" className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Active deliveries</p><p className="mt-2 text-2xl font-bold text-sky-600">{activeCount}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Delivered</p><p className="mt-2 text-2xl font-bold text-emerald-600">{deliveredCount}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Delayed</p><p className="mt-2 text-2xl font-bold text-rose-600">{delayedCount}</p></article>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-xs">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search deliveries" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search shipment or customer..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <label className="text-sm text-slate-500">
            <span className="sr-only">Filter by delivery status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
              <option>All statuses</option>{deliveryStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th scope="col" className="px-5 py-3 font-medium">Shipment</th><th scope="col" className="px-4 py-3 font-medium">Customer</th><th scope="col" className="px-4 py-3 font-medium">Destination</th><th scope="col" className="px-4 py-3 font-medium">Carrier</th><th scope="col" className="px-4 py-3 font-medium">Est. delivery</th><th scope="col" className="px-5 py-3 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Truck size={17} /></div><div><p className="font-semibold text-slate-800">{delivery.id}</p><p className="mt-0.5 text-xs text-slate-400">{delivery.order}</p></div></div></td>
                  <td className="px-4 py-4 text-slate-600">{delivery.customer}</td>
                  <td className="max-w-xs px-4 py-4 text-slate-600">{delivery.address}</td>
                  <td className="px-4 py-4 text-slate-600">{delivery.carrier}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(delivery.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4"><label className="sr-only" htmlFor={`delivery-status-${delivery.id}`}>Status for {delivery.id}</label><select id={`delivery-status-${delivery.id}`} value={delivery.status} onChange={(event) => updateStatus(delivery.id, event.target.value)} className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${statusStyles[delivery.status]}`}>{deliveryStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                </tr>
              ))}
              {filteredDeliveries.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No deliveries match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Showing {filteredDeliveries.length} of {deliveries.length} deliveries</div>
      </section>
    </div>
  );
}

export default Delivery;
