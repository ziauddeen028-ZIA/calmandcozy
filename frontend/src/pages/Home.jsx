import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';
import { FiArrowRight, FiMail, FiChevronLeft, FiChevronRight } from 'react-icons/fi';



const categories = [
  {
    name: 'T-Shirt Customize',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=200',
    link: '/shop?category=t-shirt-customize',
  },

  {
    name: 'T-Shirts',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200',
    link: '/shop?category=t-shirts',
  },

  {
    name: 'Oversized T-Shirts',
    image:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=200',
    link: '/shop?category=oversized-t-shirts',
  },

  {
    name: 'Mugs',
    image:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=200',
    link: '/shop?category=mugs',
  },

  {
    name: 'Mouse Pad',
    image:
      'https://images.unsplash.com/photo-1615663245857-ac93100318b3?auto=format&fit=crop&q=80&w=200',
    link: '/shop?category=mouse-pad',
  },

  {
    name: 'Desk Pad',
    image:
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=200',
    link: '/shop?category=desk-pad',
  },
];

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=90&w=2560",
    heading: "Minimal Fits. Maximum Comfort.",
    subtitle: "Discover oversized fashion essentials crafted for everyday style, comfort, and confidence."
  },
  {
    image: "https://images.unsplash.com/photo-1670813008792-66dc45a5e1a4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heading: "Elevate Your Streetwear Game.",
    subtitle: "Premium oversized apparel designed with clean aesthetics, relaxed fits, and modern fashion culture."
  },
  {
    image: "https://images.unsplash.com/photo-1559697242-b472e57aa95e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heading: "Fashion Built for Everyday Life.",
    subtitle: "From minimal oversized tees to lifestyle essentials, redefine your daily wardrobe with Calm & Cozy."
  }

];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_STRAPI_URL}/api/products?filters[featured][$eq]=true&populate=*`);
        setFeaturedProducts(response.data.data || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const featuredProduct = featuredProducts[0] || null;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* 1. HERO SECTION */}
      <section
        className="relative h-[85vh] min-h-[500px] sm:min-h-[600px] overflow-hidden flex items-center justify-center group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slider Images */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10 transition-opacity duration-1000"></div>
            <img
              src={slide.image}
              alt={slide.heading}
              className="w-full h-full object-cover object-center scale-110 sm:scale-100 transition-transform duration-[4000ms]"
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white hidden sm:flex opacity-0 group-hover:opacity-100 transition-all duration-300"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>

        {/* Slider Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl px-4 sm:px-0"
          >
            <h1 className="text-[42px] sm:text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight drop-shadow-xl max-w-[90%] mx-auto mb-6">
              {heroSlides[currentSlide].heading}
            </h1>
            <p className="text-base sm:text-xl text-gray-100 mb-8 max-w-xl mx-auto leading-relaxed drop-shadow-md px-2">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop" className="inline-flex items-center justify-center px-10 py-4 text-base font-medium text-gray-900 bg-white hover:bg-gray-100 rounded-full transition-all hover:-translate-y-0.5 shadow-xl">
                Shop Collection
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center px-10 py-4 text-base font-medium text-white border border-white/50 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md shadow-lg">
                Explore More
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. CATEGORY SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-serif text-gray-900 tracking-wide uppercase">Shop by Category</h2>
          <div className="w-16 h-0.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-6 md:gap-8 justify-start lg:justify-center">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
            >
              <Link to={category.link} className="block w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-white mb-4 relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              </Link>
              <h3 className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-center w-full">
                {category.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-500">Discover our latest cozy essentials</p>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex items-center text-blue-600 font-medium hover:text-blue-700 hover:underline">
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500 text-lg">Loading new arrivals...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 text-lg">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-lg">No new arrivals found.</div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop" className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-full text-base font-medium text-gray-700 bg-white hover:bg-gray-50 w-full">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCT SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-3xl overflow-hidden shadow-xl min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-white text-xl">Loading featured product...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-red-300 text-xl">{error}</div>
              </div>
            ) : !featuredProduct ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-white text-xl">No featured product currently available.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 sm:p-16 lg:p-20 flex flex-col justify-center relative z-10 text-white">
                  <div className="text-blue-300 font-semibold tracking-wider uppercase text-sm mb-4">Featured Essential</div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{featuredProduct.title}</h2>
                  <p className="text-blue-100 text-lg mb-8 max-w-md leading-relaxed">
                    {featuredProduct.description}
                  </p>
                  <div>
                    <Link to={`/product/${featuredProduct.documentId}`} className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-blue-900 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-transform hover:-translate-y-0.5">
                      Shop Now - ₹{featuredProduct.sellingPrice}
                    </Link>
                  </div>
                </div>
                <div className="relative h-64 sm:h-96 lg:h-auto bg-gray-100">
                  <img
                    src={`${import.meta.env.VITE_STRAPI_URL}${featuredProduct.images?.[0]?.url}`}
                    alt={featuredProduct.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
