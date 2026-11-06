import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const ProductsContext = createContext(null);

const normalizeProduct = (product) => {
  const category = product.category_id?.name || "Uncategorized";
  return {
    id: product._id,
    category,
    type: category,
    img: product.image || "/images/image1.png",
    name: product.name,
    des: product.category_id?.description || "Quality skincare for your everyday routine.",
    price: `$${Number(product.price).toFixed(2)}`,
    stock: product.stock,
  };
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reloadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await api("/api/products?limit=100");
      setProducts((payload.data || []).map(normalizeProduct));
    } catch (requestError) {
      setProducts([]);
      setError(requestError.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reloadProducts(); }, []);

  const value = useMemo(() => ({ products, loading, error, reloadProducts }), [products, loading, error]);
  return createElement(ProductsContext.Provider, { value }, children);
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used inside ProductsProvider");
  return context;
}
