import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../Data/useCart";
import { api } from "../lib/api";

const getPrice = (price) => Number.parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
const CHECKOUT_DRAFT_KEY = "skincare_shop_checkout_draft";

const getDefaultCheckout = () => ({
  name: "",
  email: "",
  address: "",
  carrier: "Skincare Shop Delivery",
  estDelivery: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
});

const getSavedCheckout = () => {
  const defaultCheckout = getDefaultCheckout();
  try {
    const savedCheckout = JSON.parse(localStorage.getItem(CHECKOUT_DRAFT_KEY));
    if (!savedCheckout || typeof savedCheckout !== "object") return defaultCheckout;

    return {
      ...defaultCheckout,
      name: typeof savedCheckout.name === "string" ? savedCheckout.name : defaultCheckout.name,
      email: typeof savedCheckout.email === "string" ? savedCheckout.email : defaultCheckout.email,
      address: typeof savedCheckout.address === "string" ? savedCheckout.address : defaultCheckout.address,
      carrier: typeof savedCheckout.carrier === "string" ? savedCheckout.carrier : defaultCheckout.carrier,
      estDelivery: typeof savedCheckout.estDelivery === "string" ? savedCheckout.estDelivery : defaultCheckout.estDelivery,
    };
  } catch {
    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    return defaultCheckout;
  }
};

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [checkout, setCheckout] = useState(getSavedCheckout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const subtotal = cartItems.reduce((total, item) => total + getPrice(item.price) * item.quantity, 0);
  const orderReference = `SC-${cartItems.map((item) => item.id).join("-")}-${Math.round(subtotal * 100)}`;
  const qrCodeUrl = `/images/qr.png`;

  // Keep the checkout fields after a refresh or browser restart.
  useEffect(() => {
    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(checkout));
  }, [checkout]);

  const updateField = (event) => setCheckout((current) => ({ ...current, [event.target.name]: event.target.value }));
  const placeOrder = async () => {
    if (!checkout.name.trim() || !checkout.email.trim() || !checkout.address.trim()) {
      setError("សូមបញ្ចូលឈ្មោះ,លេខទូរសព្ទ,និងអាសយដ្ឋាន...");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: { name: checkout.name, email: checkout.email },
          items: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
          delivery: { destination: checkout.address, carrier: checkout.carrier, est_delivery: new Date(`${checkout.estDelivery}T12:00:00`).toISOString() },
        }),
      });
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      setPaymentConfirmed(true);
      clearCart();
    } catch (requestError) {
      setError(requestError.message || "Unable to save your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16">
        <div className="max-w-md text-center font-medium">
          <h1 className="font-serif text-3xl font-semibold text-stone-800">មិនមានការបង់ប្រាក់</h1>
          <p className="mt-3 text-stone-500">ដាក់ឥវ៉ាន់ចូលកន្រ្ទកដើម្បីទូទាត់ប្រាក់</p>
          <Link to="/Products1" className="mt-6 inline-block rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-900">Continue shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 px-4 py-10 sm:px-6 lg:px-10 font-medium">
      <div className="mx-auto max-w-4xl">
        <Link to="/cart" className="text-sm text-stone-600 transition hover:text-stone-900">← ត្រឡប់ក្រោយ</Link>
        <div className="mt-5 grid overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:grid-cols-[1fr_0.9fr]">
          <section className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">កន្លែងទូទាត់ប្រាក់</p>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-stone-800">ទូទាត់ប្រាក់ជាមួយ <span className="text-2xl">Pay Way</span></h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">សូមធ្វើការស្កេនQR codeរួចធ្វើការបង់ប្រាក់រួចជាការស្រេច។</p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-stone-700">ឈ្មោះ<input required name="name" value={checkout.name} onChange={updateField} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
              <label className="text-sm text-stone-700">លេខទូរសព្ទ<input required type="text" name="email" value={checkout.email} onChange={updateField} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
              <label className="text-sm text-stone-700 sm:col-span-2">អាសយដ្ឋានដឹកជញ្ជូន<textarea required name="address" value={checkout.address} onChange={updateField} rows="3" className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
              <label className="text-sm text-stone-700">ដឹកជញ្ជូន<select name="carrier" value={checkout.carrier} onChange={updateField} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2"><option>ទៅយកផ្ទាល់</option><option>ដឹកជញ្ជូនដល់កន្លែង</option><option>ដឹកជញ្ជូនតាមខេត្ត</option></select></label>
              <label className="text-sm text-stone-700">ពេលវេលាដឹកជញ្ជូន<input required type="date" name="estDelivery" value={checkout.estDelivery} onChange={updateField} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
            </div>
            <div className="mt-7 divide-y divide-stone-100 rounded-lg border border-stone-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div><p className="font-medium text-stone-800">{item.name}</p><p className="mt-1 text-stone-500">ចំនួន: {item.quantity}</p></div>
                  <span className="font-medium text-stone-700">${(getPrice(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 font-semibold text-stone-800"><span>សរុប</span><span>${subtotal.toFixed(2)}</span></div>
            </div>
          </section>

          <aside className="flex flex-col items-center bg-stone-100 p-6 text-center sm:p-8">
            {paymentConfirmed ? (
              <div
                className="flex h-full flex-col items-center justify-center"
                onClick={(event) => {
                  if (event.target.closest('a[href="/Products1"]')) clearCart();
                }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-2xl text-white">✓</div>
                <h2 className="mt-5 font-serif text-2xl font-semibold text-stone-800">ការបង់ប្រាក់ទទួលបានជោគជ័យ</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">សូមអរគុណ!ទំនិញរបស់អ្នកនឹងត្រូវបានរៀបចំដឹកជញ្ជូនឆាប់ៗ</p>
                <Link to="/Products1" className="mt-6 rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-900">បន្តទៅមុខ</Link>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-stone-700">កម៉្មុង {orderReference}</p>
                <img src={qrCodeUrl} alt={`QR code to pay $${subtotal.toFixed(2)} for order ${orderReference}`} className="mt-5 h-64 w-64 rounded-xl bg-white p-3 shadow-sm" />
                <p className="mt-5 text-2xl font-bold text-stone-800">${subtotal.toFixed(2)}</p>
                <p className="mt-2 text-xs leading-5 text-stone-500">សូមធ្វើការបង់ទឹកប្រាក់ដើម្បីបញ្ចប់ការទូទាត់ទំនិញ</p>
                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button type="button" disabled={isSubmitting} onClick={placeOrder} className="mt-6 w-full rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:bg-stone-400">{isSubmitting ? "Saving order…" : "ពិនិត្យនិងបង់ប្រាក់"}</button>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
