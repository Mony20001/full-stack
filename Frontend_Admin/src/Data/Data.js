import { LayoutDashboard, Package, Grid3X3, ShoppingCart, Boxes, Truck } from "lucide-react";
export const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/" },
  { name: "Products", icon: Package, to: "/products" },
  { name: "Category", icon: Grid3X3, to: "/category" },
  { name: "Order", icon: ShoppingCart, to: "/orders" },
  { name: "Inventory", icon: Boxes, to: "/inventory" },
  { name: "Delivery", icon: Truck, to: "/delivery" },
];
