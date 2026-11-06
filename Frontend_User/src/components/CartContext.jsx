import { useEffect, useMemo, useState } from "react";
import { CartContext } from "../Data/cartContext";

const CART_STORAGE_KEY = "ecommerce-cart";

const loadCart = () => {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((items) =>
      quantity <= 0
        ? items.filter((item) => item.id !== productId)
        : items.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((items) => items.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalCartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    }),
    [cartItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
