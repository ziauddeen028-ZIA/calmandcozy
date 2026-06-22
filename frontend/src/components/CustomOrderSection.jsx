import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';

const CustomOrderSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    quantity: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Format WhatsApp message
    const text = `*New Custom Order Enquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Category:* ${formData.category}%0A*Quantity:* ${formData.quantity || 'Not specified'}%0A*Message:* ${formData.message || 'None'}`;
    
    // Open WhatsApp
    window.open(`https://wa.me/918300932172?text=${text}`, '_blank');
    
    // Show success toast
    toast.success('Redirecting to WhatsApp...');
    
    // Reset form optionally
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: '',
      quantity: '',
      message: ''
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
          
          {/* Left Column: Contact Info */}
          <div className="bg-blue-600 text-white p-10 sm:p-14 lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-700 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-blue-200 font-semibold tracking-wider uppercase text-sm mb-3">
                Get In Touch
              </h3>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white leading-tight">
                Ready to Order Custom Products?
              </h2>
              <p className="text-blue-100 text-base sm:text-lg mb-10 leading-relaxed">
                Share your custom design ideas or bulk order requirements. We'll provide pricing and delivery timelines within 24 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4 group-hover:bg-blue-500/50 transition-colors">
                    <FiPhone className="w-5 h-5 text-blue-100" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Phone</p>
                    <p className="text-blue-100">+91 8300932172</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4 group-hover:bg-blue-500/50 transition-colors">
                    <FiMail className="w-5 h-5 text-blue-100" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <a href="mailto:contact@calmandcozy.in" className="text-blue-100 hover:text-white transition-colors">contact@calmandcozy.in</a>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4 group-hover:bg-blue-500/50 transition-colors">
                    <FiMapPin className="w-5 h-5 text-blue-100" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Location</p>
                    <p className="text-blue-100">Chennai, Tamil Nadu</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-4 group-hover:bg-blue-500/50 transition-colors">
                    <FiClock className="w-5 h-5 text-blue-100" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Hours</p>
                    <p className="text-blue-100">Mon-Sat, 9AM-7PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="p-10 sm:p-14 lg:w-3/5 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-gray-100 focus:bg-white"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-gray-100 focus:bg-white"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-gray-100 focus:bg-white"
                    placeholder="+91 83009 32172"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Product Category *</label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-700 appearance-none"
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="Custom T-Shirts">Custom T-Shirts</option>
                      <option value="Oversized T-Shirts">Oversized T-Shirts</option>
                      <option value="Mugs">Mugs</option>
                      <option value="Mouse Pads">Mouse Pads</option>
                      <option value="Desk Pads">Desk Pads</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-gray-100 focus:bg-white"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-gray-100 focus:bg-white resize-none"
                  placeholder="Tell us about your custom design ideas or specific requirements..."
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center py-4 px-8 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all mt-4"
              >
                <FiSend className="w-5 h-5 mr-2" />
                SUBMIT ENQUIRY
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomOrderSection;
