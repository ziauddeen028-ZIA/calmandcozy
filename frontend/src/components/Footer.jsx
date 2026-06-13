import { Link } from 'react-router-dom';
import { FiInstagram, FiMail } from 'react-icons/fi';
import logo from '../assets/Black logo.PNG';
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-14 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-brand-600 mb-4 block">
              <img src={logo} alt="calm & cozy" className="h-16 w-auto object-contain" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Premium comfort essentials crafted to bring warmth, style, and elegance to every home.
            </p>
            <div className="space-y-3">


              <a
                href="https://www.instagram.com/calmandcozy.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-brand-600 transition-colors"
              >
                <FiInstagram className="h-5 w-5" />
                <span>@calmandcozy.in</span>
              </a>

              <a href="mailto:contact@calmandcozy.in" className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-brand-600 transition-colors">
                <FiMail className="h-5 w-5" />
                <span>contact@calmandcozy.in</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-500 hover:text-brand-600 text-sm">All Products</Link></li>
              <li><Link to="/shop" className="text-gray-500 hover:text-brand-600 text-sm">New Arrivals</Link></li>
              <li><Link to="/shop" className="text-gray-500 hover:text-brand-600 text-sm">Best Sellers</Link></li>
              <li><Link to="/shop" className="text-gray-500 hover:text-brand-600 text-sm">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/shipping-policy" className="text-gray-500 hover:text-brand-600 text-sm">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="text-gray-500 hover:text-brand-600 text-sm">Return & Refund Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-brand-600 text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-brand-600 text-sm">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Newsletter</h3>

            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 text-sm focus:ring-brand-500 focus:border-brand-500"
              />
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors">
                <FiMail className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Calm&Cozy. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0 text-sm text-gray-400">
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>

            <Link to="/terms" className="hover:text-gray-900 transition-colors">
              Terms & Conditions
            </Link>

            <Link to="/shipping-policy" className="hover:text-gray-900 transition-colors">
              Shipping Policy
            </Link>

            <Link to="/refund-policy" className="hover:text-gray-900 transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
