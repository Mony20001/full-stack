import { Link } from "react-router-dom";
import { values } from "../Data/Products";

const About = () => (
  <main className="flex-1 bg-slate-50 px-4 py-12 sm:px-6 lg:px-10">
    <div className="mx-auto max-w-5xl">
      {/* Hero section */}
      <section className="rounded-2xl bg-stone-800 px-6 py-14 text-center text-stone-50 shadow-sm sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-300">
          អំពី Sevent Care
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
          ផលិតផលថែរក្សាស្បែក សម្រាប់ការថែរក្សាប្រចាំថ្ងៃ។
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-300">
          យើងខ្ញុំជឿថា ការថែរក្សាស្បែកដ៏ល្អ គួរតែមានអារម្មណ៍ស្ងប់ស្ងាត់ ច្បាស់លាស់
          និងងាយស្រួលធ្វើជាប្រចាំ។ Sevent Care ប្រមូលផ្តុំផលិតផលចាំបាច់ៗ
          សម្រាប់ស្បែកដែលមើលទៅមានសុខភាពល្អ។
        </p>
      </section>

      {/* Values section */}
      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <article
            key={value.title}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 font-serif text-lg font-bold text-stone-800">
              S
            </div>
            <h2 className="mt-5 text-lg font-semibold text-stone-800">
              {value.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {value.description}
            </p>
          </article>
        ))}
      </section>

      {/* Approach section */}
      <section className="mt-12 grid items-center gap-8 rounded-2xl border border-stone-200 bg-white p-7 sm:p-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            វិធីសាស្ត្ររបស់យើង
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-stone-800">
            ទម្លាប់តូចៗ ការថែរក្សាដ៏មានអត្ថន័យ។
          </h2>
        </div>
        <div>
          <p className="leading-7 text-stone-600">
            ចាប់ពីការលាងសម្អាត ដល់ការការពារពន្លឺព្រះអាទិត្យ យើងខ្ញុំធ្វើឱ្យវាកាន់តែងាយស្រួល
            ក្នុងការបង្កើតទម្លាប់ថែរក្សាស្បែក ដែលផ្តល់អារម្មណ៍ល្អ និងគាំទ្រស្បែករបស់អ្នកជារៀងរាល់ថ្ងៃ។
          </p>
          <Link
            to="/Products1"
            className="mt-5 inline-block rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-900"
          >
            ស្វែងរកផលិតផល
          </Link>
        </div>
      </section>
    </div>
  </main>
);

export default About;