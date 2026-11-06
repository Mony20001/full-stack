import Card from "./Card";
import Slide from "./Slide";

const Home = () => {
  return (
    <main className="w-full bg-slate-50">
      <Slide />
      <div className="w-full px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <h2 id="cleanser" className="text-xl sm:text-2xl pt-6 font-serif font-semibold tracking-wider text-[#2C2A29]">
          🧼 Cleanser
        </h2>
        <Card category="cleanser" />
        <h2 id="toner" className="text-xl sm:text-2xl pt-10 font-serif font-semibold tracking-wider text-[#2C2A29]">
          🧴 Toner
        </h2>
        <Card category="toner" />
        <h2 id="sun" className="text-xl sm:text-2xl pt-10 font-serif font-semibold tracking-wider text-[#2C2A29]">
          ☀️ Sunscreen
        </h2>
        <Card category="sun" />
      </div>
    </main>
  );
};

export default Home;
