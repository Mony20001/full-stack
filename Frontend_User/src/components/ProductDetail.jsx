import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiHeart, FiPackage, FiTruck, FiChevronDown } from "react-icons/fi";
import { useCart } from "../Data/useCart";
import { useProducts } from "../Data/productContext";

const sizes = ["30 ml", "50 ml", "100 ml", "150 ml"];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[1]);
  const [isSaved, setIsSaved] = useState(false);
  const product = products.find((item) => item.id === id);
  const gallery = useMemo(() => {
    if (!product) return [];
    const relatedImages = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3).map((item) => item.img);
    return [product.img, ...relatedImages];
  }, [product]);

  if (loading) return <main className="mx-auto flex min-h-[55vh] items-center justify-center text-stone-600">Loading product...</main>;
  if (!product) return <main className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 text-center"><h1 className="text-2xl font-semibold text-stone-900">Product not found</h1><button onClick={() => navigate(-1)} className="mt-5 border-b border-stone-900 pb-1 text-sm font-medium">Return to shopping</button></main>;

  const showImage = (index) => setActiveImage((index + gallery.length) % gallery.length);

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-5 sm:px-6 lg:px-10">
        <div className="mb-5 flex items-center gap-3 text-xs text-stone-500"><Link to="/" className="hover:text-stone-900">Home</Link><span>/</span><Link to="/Products1" className="hover:text-stone-900">Products</Link><span>/</span><span className="truncate text-stone-700">{product.name}</span></div>
        <button onClick={() => navigate(-1)} aria-label="Go back" className="fixed left-3 top-24 z-20 grid h-10 w-10 place-items-center rounded-full bg-white text-stone-600 shadow-md transition hover:-translate-x-0.5 hover:text-stone-950 sm:left-5"><FiArrowLeft size={20} /></button>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.62fr)_minmax(360px,.85fr)] xl:gap-12">
          <section className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[94px_minmax(0,1fr)] sm:gap-5">
            <div className="flex max-h-[620px] flex-col gap-3 overflow-y-auto pr-1">
              {gallery.map((image, index) => <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} aria-label={`View product image ${index + 1}`} className={`aspect-square shrink-0 border bg-white p-1 transition ${activeImage === index ? "border-stone-900" : "border-transparent hover:border-stone-300"}`}><img src={image} alt="" className="h-full w-full object-contain" /></button>)}
            </div>
            <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden bg-[#fafafa] sm:min-h-[620px]">
              <img src={gallery[activeImage]} alt={product.name} className="h-full max-h-[620px] w-full object-contain p-8 sm:p-12" />
              <button onClick={() => showImage(activeImage - 1)} aria-label="Previous image" className="absolute left-3 grid h-11 w-11 place-items-center bg-stone-950 text-white transition hover:bg-stone-700 sm:left-5"><FiChevronLeft size={27} /></button>
              <button onClick={() => showImage(activeImage + 1)} aria-label="Next image" className="absolute right-3 grid h-11 w-11 place-items-center bg-stone-950 text-white transition hover:bg-stone-700 sm:right-5"><FiChevronRight size={27} /></button>
            </div>
          </section>
          <aside className="xl:pt-1">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-stone-500">{product.type}</p><h1 className="mt-2 text-3xl font-medium leading-tight text-stone-900 sm:text-4xl">{product.name}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">{product.des}</p>
            <div className="mt-6 flex items-baseline gap-3"><span className="text-2xl font-semibold text-[#b3261e]">{product.price}</span><span className="text-base font-medium text-stone-900">{product.dis} off</span><span className="text-sm text-stone-400 line-through">$32.00</span></div>
            <div className="mt-8 border-t border-stone-200 pt-6"><p className="text-sm font-semibold text-stone-900">Choose your size</p><div className="mt-4 grid grid-cols-4 gap-2">{sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`min-h-12 border px-2 text-sm transition ${selectedSize === size ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-500"}`}>{size}</button>)}</div></div>
            <div className="mt-7 flex gap-3"><button onClick={() => addToCart({ ...product, size: selectedSize })} className="min-h-14 flex-1 bg-green-800 px-5 text-base font-semibold text-white transition hover:bg-green-950">ដាក់ឥវ៉ាន់ចូលកន្រ្ទក</button><button onClick={() => setIsSaved(!isSaved)} aria-label={isSaved ? "Remove from favourites" : "Add to favourites"} className={`grid min-h-14 w-14 place-items-center border transition ${isSaved ? "border-stone-900 bg-green-800 text-white" : "border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-500"}`}><FiHeart size={22} fill={isSaved ? "currentColor" : "none"} /></button></div>
            <div className="mt-8 grid grid-cols-2 gap-5 border-b border-stone-200 py-6 text-sm text-stone-800"><div className="flex items-center gap-3"><FiTruck size={27} strokeWidth={1.4} /><span><strong className="block font-semibold">Global shipping</strong><span className="text-xs text-stone-500">Delivered to your door</span></span></div><div className="flex items-center gap-3"><FiPackage size={27} strokeWidth={1.4} /><span><strong className="block font-semibold">14-day returns</strong><span className="text-xs text-stone-500">Easy returns, on us</span></span></div></div>
            <details className="group border-b border-stone-200 py-5" open><summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-stone-900">Product details <FiChevronDown className="transition group-open:rotate-180" /></summary><p className="mt-4 text-sm leading-6 text-stone-600">{product.des} Made for a simple, comfortable everyday routine.</p><p className="mt-3 text-xs text-stone-500">Product code: SK-{String(product.id).padStart(6, "0")}</p></details>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
