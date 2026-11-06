import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, CircleDollarSign, Package, ShoppingBag, Truck } from "lucide-react";
import { apiList } from "../lib/api";

const initialOrders = [
  { id: "ORD-1001", customer: "Ava Johnson", date: "2026-09-24", items: 3, total: 105, status: "Delivered" },
  { id: "ORD-1002", customer: "Noah Williams", date: "2026-09-24", items: 1, total: 42, status: "Processing" },
  { id: "ORD-1003", customer: "Mia Chen", date: "2026-09-23", items: 2, total: 63, status: "Shipped" },
  { id: "ORD-1004", customer: "Liam Garcia", date: "2026-09-22", items: 4, total: 128, status: "Pending" },
  { id: "ORD-1005", customer: "Sophia Patel", date: "2026-09-21", items: 2, total: 76, status: "Cancelled" },
];

const initialInventory = [
  { id: "PRD-001", name: "Vitamin C Serum", stock: 82, reorderLevel: 20 },
  { id: "PRD-002", name: "Daily Hydrating Cream", stock: 64, reorderLevel: 20 },
  { id: "PRD-003", name: "Mineral Sunscreen SPF 50", stock: 12, reorderLevel: 20 },
  { id: "PRD-004", name: "Gentle Foam Cleanser", stock: 38, reorderLevel: 15 },
  { id: "PRD-005", name: "Clay Detox Mask", stock: 0, reorderLevel: 10 },
  { id: "PRD-006", name: "Overnight Repair Oil", stock: 27, reorderLevel: 12 },
];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-sky-50 text-sky-700",
  Shipped: "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-700",
};

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    Promise.all([apiList("/api/orders?limit=100"), apiList("/api/inventory?limit=100")])
      .then(([orderData, inventoryData]) => {
        setOrders(orderData.map((order) => ({
          id: order._id,
          customer: order.customer_id?.userName || order.customer_id?.userEmail || "Unknown customer",
          date: order.order_date || order.createdAt,
          items: order.items.reduce((sum, item) => sum + item.quantity, 0),
          total: order.total,
          status: `${order.status[0].toUpperCase()}${order.status.slice(1)}`,
        })));
        setInventory(inventoryData.map((item) => ({
          id: item._id,
          name: item.product_id?.name || "Unknown product",
          stock: item.quantity,
          reorderLevel: item.reorder_level,
        })));
      })
      .catch(console.error);
  }, []);
  const validOrders = orders.filter((order) => order.status !== "Cancelled");
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const unitsOrdered = validOrders.reduce((sum, order) => sum + order.items, 0);
  const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowStockItems = inventory.filter((item) => item.stock <= item.reorderLevel);
  const recentOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const dailyRevenue = [...new Set(validOrders.map((order) => order.date))]
    .sort()
    .map((date) => ({ date, total: validOrders.filter((order) => order.date === date).reduce((sum, order) => sum + order.total, 0) }));
  const maxDailyRevenue = Math.max(...dailyRevenue.map((day) => day.total), 1);
  const orderStatuses = Object.keys(statusStyles).map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-7 border-b border-slate-200 pb-6">
        <p className="mb-1 text-sm font-medium text-emerald-600">Overview</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Summary calculated from the current sample orders and inventory.</p>
      </header>

      <section aria-label="Store summary" className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sales (excl. cancelled)", value: `$${revenue.toFixed(2)}`, icon: CircleDollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total orders", value: orders.length, icon: ShoppingBag, color: "bg-sky-50 text-sky-600" },
          { label: "Units ordered", value: unitsOrdered, icon: Package, color: "bg-violet-50 text-violet-600" },
          { label: "Inventory units", value: totalUnits, icon: Boxes, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-lg p-2.5 ${color}`}><Icon size={20} /></div>
            <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="mb-7 grid gap-6 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-semibold text-slate-900">Sales by order date</h2><p className="mt-1 text-sm text-slate-500">Non-cancelled orders in the current sample</p></div>
            <p className="text-xl font-bold text-slate-900">${revenue.toFixed(2)}</p>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3 border-b border-slate-100 pb-1">
            {dailyRevenue.map(({ date, total }) => (
              <div key={date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-medium text-slate-600">${total}</span>
                <div title={`${date}: $${total}`} className="w-full max-w-16 rounded-t-md bg-emerald-400 transition-colors hover:bg-emerald-600" style={{ height: `${Math.max((total / maxDailyRevenue) * 75, 8)}%` }} />
                <span className="text-xs text-slate-400">{new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Order statuses</h2><p className="mt-1 text-sm text-slate-500">{orders.length} orders total</p></div><ShoppingBag className="text-slate-400" size={20} /></div>
          <div className="mt-5 space-y-4">
            {orderStatuses.map(({ status, count }) => (
              <div key={status}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="text-slate-600">{status}</span><span className="font-medium text-slate-800">{count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${statusStyles[status].split(" ")[0].replace("50", "500")}`} style={{ width: `${orders.length ? (count / orders.length) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between p-5 sm:p-6"><div><h2 className="font-semibold text-slate-900">Recent orders</h2><p className="mt-1 text-sm text-slate-500">Order totals include cancelled orders as listed</p></div><Link to="/orders" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all</Link></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase text-slate-500"><tr><th scope="col" className="px-6 py-3">Order</th><th scope="col" className="px-4 py-3">Customer</th><th scope="col" className="px-4 py-3">Date</th><th scope="col" className="px-4 py-3">Total</th><th scope="col" className="px-6 py-3">Status</th></tr></thead>
            <tbody>{recentOrders.map((order) => <tr key={order.id} className="border-b border-slate-100"><td className="px-6 py-4 font-medium text-slate-800">{order.id}<span className="mt-1 block text-xs font-normal text-slate-400">{order.items} {order.items === 1 ? "item" : "items"}</span></td><td className="px-4 py-4 text-slate-600">{order.customer}</td><td className="px-4 py-4 text-slate-600">{new Date(`${order.date}T00:00:00`).toLocaleDateString()}</td><td className="px-4 py-4 font-medium text-slate-800">${order.total.toFixed(2)}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}>{order.status}</span></td></tr>)}</tbody>
          </table></div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Restock watch</h2><p className="mt-1 text-sm text-slate-500">At or below reorder level</p></div><Truck className="text-slate-400" size={20} /></div>
          <div className="mt-6 space-y-5">{lowStockItems.map((item) => <div key={item.id}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{item.name}</span><span className={`shrink-0 font-semibold ${item.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>{item.stock} left</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.stock === 0 ? "bg-rose-500" : "bg-amber-400"}`} style={{ width: `${Math.max((item.stock / item.reorderLevel) * 100, 2)}%` }} /></div><p className="mt-1 text-xs text-slate-400">Reorder at {item.reorderLevel}</p></div>)}</div>
          <Link to="/inventory" className="mt-7 block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">Manage inventory</Link>
        </article>
      </section>

    </div>
  );
}

export default Dashboard;
