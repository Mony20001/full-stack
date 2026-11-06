import { NavLink } from "react-router-dom";
import { Leaf } from "lucide-react";
import { menuItems } from "../Data/Data";

function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white"><Leaf size={18} /></div>
        <div><h1 className="text-lg font-semibold leading-tight text-slate-800">SEVEN CARE</h1><p className="text-xs text-slate-400">Admin</p></div>
      </div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-5">
        {menuItems.map(({ name, icon: Icon, to }) => to ? (
          <NavLink key={name} to={to} end={to === "/"} className={({ isActive }) => `flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
            <Icon size={18} className="shrink-0" /><span>{name}</span>
          </NavLink>
        ) : (
          <button key={name} type="button" disabled title="This section is not available yet" className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-300">
            <Icon size={18} className="shrink-0" /><span>{name}</span>
          </button>
        ))}
      </nav>
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">A</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-700">Admin</p><p className="truncate text-xs text-slate-400">admin@sevencare.com</p></div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
