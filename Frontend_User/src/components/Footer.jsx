import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#2C2A29] text-[#FAF7F2] pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-700">

          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold tracking-wider text-[#FAF7F2]">
              SEVENT⁷ CARE
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              រក្សាសម្រស់ និងថែរក្សាស្បែករបស់អ្នកជាមួយនឹងផលិតផលដែលមានគុណភាពខ្ពស់ និងសុវត្ថិភាព។
            </p>
          </div>
          <div>
            <h4 className="text-lg font-serif font-semibold mb-4 text-[#FAF7F2]">
              តំណភ្ជាប់រហ័ស
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link onClick={()=> window.scrollTo({top: 0, behavior: "smooth"})} to="/Home" className="hover:text-white transition-colors">
                  ទំព័រដើម (Home)
                </Link>
              </li>
              <li>
                <Link onClick={()=> window.scrollTo({top: 0, behavior: "smooth"})} to="/Products1" className="hover:text-white transition-colors">
                  ផលិតផល (Products)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  អំពីយើង (About Us)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  ទំនាក់ទំនង (Contact)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-serif font-semibold mb-4 text-[#FAF7F2]">
              ប្រភេទផលិតផល
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">
                <a href="#cleanser">🧼 Cleanser</a>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <a href="#toner">🧴 Toner</a>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <a href="#sun">☀️ Sunscreen</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-serif font-semibold mb-4 text-[#FAF7F2]">
              ទទួលបានព័ត៌មានថ្មីៗ
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              ចុះឈ្មោះដើម្បីទទួលបានការបញ្ចុះតម្លៃ និងព័ត៌មានពីផលិតផលថ្មីៗ។
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="អ៊ីមែលរបស់អ្នក..."
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-md focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-[#FAF7F2] text-[#2C2A29] font-semibold rounded-md hover:bg-gray-200 transition-colors"
              >
                ផ្ញើ
              </button>
            </form>
          </div>

        </div>
        <div className="pt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()}  SEVENT⁷ CARE. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
