import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Footer from "./components/Footer";
import ProductDetail from "./components/ProductDetail";
import Products1 from "./components/Products1";
import { CartProvider } from "./components/CartContext.jsx";
import Cart from "./components/Cart";
import About from "./components/About";
import Contact from "./components/Contact";
import Checkout from "./components/Checkout";
import { ProductsProvider } from "./Data/productContext";

const THEME_STORAGE_KEY = "ecommerce-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ProductsProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-stone-800 transition-colors duration-200">
          <Navbar
            theme={theme}
            onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail/>} />
            <Route path="/Products1" element={<Products1/>}/>
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
          <Footer/>
        </div>
        </Router>
      </CartProvider>
    </ProductsProvider>
  );
}
export default App;
