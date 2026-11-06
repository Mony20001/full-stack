import { useState } from "react";
const TELEGRAM_BOT_TOKEN = "8850741467:AAFk2oeAAQhC-MUh6zwDfpiTn2meBibOTOc";
const TELEGRAM_CHAT_ID = "1954501737";

const TELEGRAM_MAX_LEN = 4096;

// Escape user input so it can't break parse_mode: "HTML"
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Trim to Telegram's limit without leaving a broken HTML entity behind
const clamp = (text) =>
  text.length <= TELEGRAM_MAX_LEN
    ? text
    : text.slice(0, TELEGRAM_MAX_LEN).replace(/&[a-zA-Z]{0,5}$/, "");

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Capture form BEFORE await — prevents "Cannot read 'reset' of null"
    const form = event.currentTarget;

    setLoading(true);
    setError("");
    setSubmitted(false);

    const formData = new FormData(form);
    const name = escapeHtml(formData.get("name"));
    const email = escapeHtml(formData.get("email"));
    const subject = escapeHtml(formData.get("subject"));
    const message = escapeHtml(formData.get("message"));

    const telegramMessage = clamp(
      `
📬 <b>មានការផ្ញើសារថ្មីពីទម្រង់ទំនាក់ទំនង</b>

👤 <b>ឈ្មោះ:</b> ${name}
📧 <b>អ៊ីមែល:</b> ${email}
📌 <b>ប្រធានបទ:</b> ${subject}
📝 <b>សារ:</b>
${message}
      `.trim()
    );

    try {
      if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === "PASTE_YOUR_NEW_TOKEN_HERE") {
        throw new Error("សូមដាក់ Telegram Bot Token ថ្មីនៅក្នុងកូដ (TELEGRAM_BOT_TOKEN)។");
      }

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        // Show the REAL Telegram error so we know what's wrong
        throw new Error(
          result?.description || `HTTP ${response.status} ${response.statusText}`
        );
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      console.error("Telegram API Error:", err);
      // Show real error temporarily for debugging
      setError(`មិនអាចផ្ញើសារ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-slate-50 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            ទំនាក់ទំនងយើងខ្ញុំ
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-stone-800">
            យើងខ្ញុំរីករាយនឹងទទួលសារពីអ្នក។
          </h1>
          <p className="mt-4 leading-7 text-stone-600">
            មានសំណួរអំពីផលិតផល ឬវិធីថែរក្សាស្បែកមែនទេ? ផ្ញើសារមកកាន់យើងខ្ញុំ
            ក្រុមការងារនឹងឆ្លើយតបទៅអ្នកវិញ។
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-2xl bg-stone-800 p-7 text-stone-50 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold">
              ព័ត៌មានទំនាក់ទំនង
            </h2>
            <div className="mt-7 space-y-6 text-sm">
              <div>
                <p className="font-semibold text-stone-200">អ៊ីមែល</p>
                <a
                  className="mt-1 block text-stone-300 hover:text-white"
                  href="mailto:hello@seventcare.com"
                >
                  hello@seventcare.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-stone-200">ម៉ោងធ្វើការ</p>
                <p className="mt-1 text-stone-300">
                  ថ្ងៃចន្ទ–ថ្ងៃសុក្រ, ៩:០០ ព្រឹក – ៥:០០ ល្ងាច
                </p>
              </div>
              <div>
                <p className="font-semibold text-stone-200">ការគាំទ្រ</p>
                <p className="mt-1 text-stone-300">
                  យើងខ្ញុំជាទូទៅឆ្លើយតបក្នុងកំឡុងពេល ២ ថ្ងៃធ្វើការ។
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            {submitted && (
              <p
                role="status"
                className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800"
              >
                អរគុណសម្រាប់ការផ្ញើសារ! យើងខ្ញុំនឹងទាក់ទងទៅអ្នកវិញក្នុងពេលឆាប់ៗនេះ។
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-stone-700">
                  ឈ្មោះ
                  <input
                    required
                    name="name"
                    className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-800 focus:ring-2 focus:ring-stone-200"
                  />
                </label>
                <label className="text-sm font-medium text-stone-700">
                  អ៊ីមែល
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-800 focus:ring-2 focus:ring-stone-200"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-stone-700">
                ប្រធានបទ
                <input
                  required
                  name="subject"
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-800 focus:ring-2 focus:ring-stone-200"
                />
              </label>

              <label className="block text-sm font-medium text-stone-700">
                សារ
                <textarea
                  required
                  name="message"
                  rows="5"
                  className="mt-2 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-stone-800 focus:ring-2 focus:ring-stone-200"
                />
              </label>

              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-900 disabled:opacity-50"
              >
                {loading ? "កំពុងផ្ញើ..." : "ផ្ញើសារ"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Contact;