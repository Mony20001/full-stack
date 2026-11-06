import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { CiDark, CiLight } from "react-icons/ci";
import { useCart } from "../Data/useCart";
import { useProducts } from "../Data/productContext";

const Navbar = ({ theme, onToggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  const { totalCartCount } = useCart();
  const { products } = useProducts();

  const filteredProducts =
    query === ""
      ? []
      : products.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category?.toLowerCase().includes(query.toLowerCase())
        );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <nav className="hidden md:flex items-center space-x-8 text-sm text-stone-700 font-medium">
          <Link to="/" className="hover:text-stone-900 transition">ទំព័រដើម</Link>
          <Link to="/Products1" className="hover:text-stone-900 transition">ផលិតផល</Link>
          <Link to="/about" className="hover:text-stone-900 transition">អំពីយើង</Link>
          <Link to="/contact" className="hover:text-stone-900 transition">ទំនាក់ទំនង</Link>
        </nav>

        <Link to="/" className="text-xl sm:text-2xl font-serif font-semibold tracking-wider text-[#2C2A29]">
          SEVENT⁷ CARE
        </Link>

        <div className="flex items-center space-x-3 sm:space-x-5 text-stone-700">
          <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center w-full">
              <label htmlFor="product-search" className="sr-only">ស្វែងរក</label>
              <input
                id="product-search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none bg-white/80"
              />
              <svg className="pointer-events-none absolute left-3 h-4 w-4 stroke-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {open && query.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-xl z-50">
                {filteredProducts.length > 0 ? (
                  <ul className="divide-y divide-stone-100">
                    {filteredProducts.map((product) => (
                      <li key={product.id}>
                        <Link
                          to={`/product/${product.id}`}
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                          className="flex items-center space-x-3 p-3 hover:bg-stone-50 transition"
                        >
                          {product.img && (
                            <img src={product.img} alt={product.name} className="h-10 w-10 object-cover rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                            {product.category && (
                              <p className="text-xs text-stone-500 truncate">{product.category}</p>
                            )}
                          </div>
                          {product.price && (
                            <span className="text-sm font-semibold text-stone-700">{product.price}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-stone-500">
                    រកមិនឃើញផលិតផល "{query}" ទេ
                  </div>
                )}
              </div>
            )}
          </div>

          <button aria-label="User Account" className="hidden sm:block hover:text-stone-900 transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          <Link to="/cart" aria-label="Cart" className="relative hover:text-stone-900 transition flex items-center p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold animate-pulse">
                {totalCartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="rounded-md p-1 transition hover:bg-stone-200"
          >
            {theme === "dark" ? <CiLight className="text-3xl" /> : <CiDark className="text-3xl" />}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden hover:text-stone-900 transition p-1 focus:outline-none"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-slate-50 border-b border-stone-200/60 px-6 pt-2 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base text-stone-700 font-medium">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-stone-900 transition py-1">ទំព័រដើម</Link>
            <Link to="/Products1" onClick={() => setIsMenuOpen(false)} className="hover:text-stone-900 transition py-1">ផលិតផល</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-stone-900 transition py-1">អំពីយើង</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-stone-900 transition py-1">ទំនាក់ទំនង</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
