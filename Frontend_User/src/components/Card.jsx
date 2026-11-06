import { useNavigate } from 'react-router-dom';
import { useCart } from "../Data/useCart";
import { useProducts } from "../Data/productContext";

const Card = ({ category }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // ហៅ function addToCart

  const { products, loading, error } = useProducts();
  const filteredProducts = category
    ? products.filter((product) => product.category.toLowerCase().includes(category.toLowerCase()))
    : products;

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // ការពារកុំឱ្យវា Jump ទៅ Navigate Page Detail
    addToCart(product);   // បញ្ជូន Product ទៅ Cart Context
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
      {loading && <p className="col-span-full py-8 text-center text-sm text-stone-500">Loading products...</p>}
      {error && <p className="col-span-full py-8 text-center text-sm text-rose-600">{error}</p>}
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => navigate(`/product/${product.id}`)}
          className="group w-full bg-white rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out flex flex-col border border-[#f0ede9] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] cursor-pointer"
        >
          {/* Image area */}
          <div className="relative aspect-square bg-[#f7f5f2] flex items-center justify-center p-6 overflow-hidden">
            {product.dis && (
              <span className="absolute top-3 left-3 z-10 h-6 px-2 bg-red-500 text-white text-xs font-semibold flex items-center justify-center rounded-md">
                {product.dis}
              </span>
            )}
            <img
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              src={product.img}
              alt={product.name}
              loading="lazy"
            />
          </div>

          {/* Content Area */}
          <div className="p-4 flex flex-col flex-grow justify-between">
            <div>
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider">
                {product.type}
              </p>
              <h3 className="text-stone-800 font-semibold text-base mt-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                {product.des}
              </p>
            </div>

            {/* Price & Add to Cart Action */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-red-700 font-bold text-lg">
                {product.price}
              </p>

              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                className="flex items-center space-x-1.5 bg-green-900 hover:bg-stone-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>ថែមក្នុងកន្ត្រក</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
