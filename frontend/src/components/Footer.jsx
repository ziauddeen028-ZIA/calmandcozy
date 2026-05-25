import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-brand-600 mb-4 block">
              Calm&Cozy
            </Link>
            <p className="text-gray-500 text-sm mb-4">
              Your one-stop destination for comfortable and stylish home essentials.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <FiInstagram className="h-5 w-5" />
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
              <li><Link to="/profile" className="text-gray-500 hover:text-brand-600 text-sm">My Account</Link></li>
              <li><Link to="/cart" className="text-gray-500 hover:text-brand-600 text-sm">Order Status</Link></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-600 text-sm">Shipping Info</a></li>
              <li><a href="#" className="text-gray-500 hover:text-brand-600 text-sm">Returns</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-500 text-sm mb-4">Subscribe to get special offers and updates.</p>
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
          <div className="flex space-x-4 mt-4 md:mt-0 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
