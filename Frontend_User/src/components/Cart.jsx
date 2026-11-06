import { Link } from "react-router-dom";
import { useCart } from "../Data/useCart";

const getPrice = (price) => Number.parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const subtotal = cartItems.reduce(
    (total, item) => total + getPrice(item.price) * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-serif font-semibold text-stone-800">នៅក្នុងកន្រ្ទកទទេ</h1>
          <p className="mt-3 text-stone-500">បន្ថែមផលិតផលដើម្បីមើលឃើញ</p>
          <Link to="/Products1" className="mt-6 inline-block rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-900">
            ចូលទៅកាន់ផលិតផល
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-serif font-semibold text-stone-800">ពិនិត្យទំនិញ</h1>
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            {cartItems.map((item) => (
              <article key={item.id} className="flex gap-4 border-b border-stone-100 p-4 last:border-b-0 sm:p-5">
                <img src={item.img} alt={item.name} className="h-24 w-24 rounded-lg bg-stone-50 object-contain p-2" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{item.type}</p>
                  <h2 className="mt-1 font-semibold text-stone-800">{item.name}</h2>
                  <p className="mt-1 font-bold text-red-700">{item.price}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-stone-200">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 text-lg hover:bg-stone-50" aria-label={`Decrease ${item.name}`}>−</button>
                      <span className="min-w-9 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 text-lg hover:bg-stone-50" aria-label={`Increase ${item.name}`}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-600 hover:text-red-800">ដកចេញ</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="h-fit rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-stone-800">ទូទាត់ការបង់ប្រាក់</h2>
            <div className="mt-4 flex justify-between border-t border-stone-100 pt-4 text-stone-600"><span>ចំនួនសរុប</span><span className="font-semibold text-stone-800">${subtotal.toFixed(2)}</span></div>
            <Link to="/checkout" className="mt-5 block w-full rounded-lg bg-stone-800 py-3 text-center text-sm font-medium text-white hover:bg-stone-900">បន្តការបង់ប្រាក់</Link>
            <Link to="/Products1" className="mt-3 block text-center text-sm text-stone-600 hover:text-stone-900">ត្រឡប់ក្រោយ</Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
