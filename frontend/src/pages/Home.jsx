import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import StoreLoadingBanner from '../components/StoreLoadingBanner';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import Banner from '../assets/Banner.jpeg';
import Banner2 from '../assets/Banner2.png';
import BannerMobile from '../assets/Banner Mobile.png';
import Customize from '../assets/Cutomize.png';
import Tshirt from '../assets/Tshirt.jpg';
import Oversized from '../assets/oversized.png';
import Mug from '../assets/Mug.jpg';
import MousePad from '../assets/mousepad.jpg';
import DeskPad from '../assets/deskpad.jpg';

const categories = [
  {
    name: 'Custom T-Shirts',
    image: Customize,
    link: '/shop?category=t-shirt-customize',
  },
  {
    name: 'T-Shirts',
    image: Tshirt,
    link: '/shop?category=t-shirts',
  },
  {
    name: 'Oversized T-Shirts',
    image: Oversized,
    link: '/shop?category=oversized-t-shirts',
  },
  {
    name: 'Mugs',
    image: Mug,
    link: '/shop?category=mugs',
  },
  {
    name: 'Mouse Pad',
    image: MousePad,
    link: '/shop?category=mouse-pad',
  },
  {
    name: 'Desk Pad',
    image: DeskPad,
    link: '/shop?category=desk-pad',
  },
];

const heroSlides = [
  {
    image: Banner,
    mobileImage: BannerMobile,
    heading: '',
    subtitle: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=90&w=2560',
    heading: 'Minimal Fits. Maximum Comfort.',
    subtitle:
      'Discover oversized fashion essentials crafted for everyday style, comfort, and confidence.',
  },
  {
    image: 'https://images.unsplash.com/photo-1670813008792-66dc45a5e1a4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    heading: 'Elevate Your Streetwear Game.',
    subtitle:
      'Premium oversized apparel designed with clean aesthetics, relaxed fits, and modern fashion culture.',
  },
  {
    image: 'https://images.unsplash.com/photo-1559697242-b472e57aa95e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    heading: 'Fashion Built for Everyday Life.',
    subtitle:
      'From minimal oversized tees to lifestyle essentials, redefine your daily wardrobe with Calm & Cozy.',
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homepageFeaturedProduct, setHomepageFeaturedProduct] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [featuredRes, homepageRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/products?filters[featured][$eq]=true&populate[0]=images&populate[1]=category&fields[0]=title&fields[1]=sellingPrice&fields[2]=actualPrice&fields[3]=stock&fields[4]=documentId&fields[5]=bundleOfferEnabled&fields[6]=bundleQty&fields[7]=bundlePrice`
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/products?filters[homepageFeatured][$eq]=true&populate[0]=images&fields[0]=title&fields[1]=sellingPrice&fields[2]=description&fields[3]=documentId`
          ),
        ]);
        setFeaturedProducts(featuredRes.data.data || []);
        setHomepageFeaturedProduct(homepageRes.data.data?.[0] || null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);


  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* ── 1. HERO SECTION ─────────────────────────────── */}
      <section
        className="relative h-[85vh] min-h-[420px] sm:min-h-[600px] overflow-hidden flex items-center justify-center group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slide Images */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <div
              className={`absolute inset-0 z-10 ${index === 0
                ? 'bg-black/20'
                : 'bg-gradient-to-b from-black/40 via-black/20 to-black/60'
                }`}
            />
            <img
              src={
                window.innerWidth <= 768
                  ? slide.mobileImage || slide.image
                  : slide.image
              }
              alt={slide.heading || 'Calm & Cozy'}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center w-full">
          {currentSlide !== 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl px-4 sm:px-0"
            >
              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-xl max-w-[90%] mx-auto mb-4 sm:mb-6">
                {heroSlides[currentSlide].heading}
              </h1>
              <p className="text-sm sm:text-xl text-gray-100 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed drop-shadow-md px-2">
                {heroSlides[currentSlide].subtitle}
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-full transition-all hover:-translate-y-0.5 shadow-xl"
              >
                <FiShoppingBag className="h-4 w-4 mr-2" />
                Shop Collection
              </Link>
            </motion.div>
          )}
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20 flex justify-center gap-2 sm:gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'w-6 sm:w-8 bg-white'
                : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── 2. CATEGORIES ───────────────────────────────── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-wide uppercase">
            Shop by Category
          </h2>
          <div className="w-14 sm:w-16 h-0.5 bg-blue-600 mx-auto mt-3 sm:mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-3 lg:flex gap-5 sm:gap-6 md:gap-8 justify-items-center lg:justify-center">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group cursor-pointer flex flex-col items-center"
            >
              <Link
                to={category.link}
                className="block w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-white mb-3 sm:mb-4 relative"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              </Link>

              <h3 className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-center">
                {category.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. NEW ARRIVALS ─────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                New Arrivals
              </h2>
              <p className="text-sm sm:text-base text-gray-500">
                Discover our latest cozy essentials
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center text-blue-600 font-medium hover:text-blue-700 hover:underline text-sm sm:text-base"
            >
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <StoreLoadingBanner loading={loading} />

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No new arrivals found.</div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}

          <div className="mt-6 sm:mt-8 text-center sm:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full max-w-xs"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED PRODUCT ─────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl min-h-[380px] sm:min-h-[400px]">
            {!homepageFeaturedProduct ? (
              <div className="flex items-center justify-center h-full min-h-[380px]">
                <div className="text-white text-lg">No featured product currently available.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Text Side */}
                <div className="p-8 sm:p-12 lg:p-20 flex flex-col justify-center relative z-10 text-white">
                  <div className="text-blue-300 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 font-satoshi">
                    Featured Essential
                  </div>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                    {homepageFeaturedProduct.title}
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md leading-relaxed line-clamp-3">
                    {homepageFeaturedProduct.description}
                  </p>
                  <div>
                    <Link
                      to={`/product/${homepageFeaturedProduct.documentId}`}
                      className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-blue-900 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all hover:-translate-y-0.5 font-satoshi"
                    >
                      Shop Now — ₹{homepageFeaturedProduct.sellingPrice}
                    </Link>
                  </div>
                </div>

                {/* Image Side */}

                <div className="relative min-h-[500px] bg-white">
                  <img
                    src={homepageFeaturedProduct?.images?.[0]?.url}
                    alt={homepageFeaturedProduct.title}
                    className="absolute inset-0 w-full h-full object-cover"
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
