import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiCheck, FiArrowLeft, FiUpload, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Loader from '../components/Loader';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductReviews from '../components/ProductReviews';

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http")
    ? url
    : `${API_URL}${url}`;
};

// Preferred display order for sizes
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function sortVariants(variants) {
  if (!variants?.length) return [];
  return [...variants].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf((a.size || '').toUpperCase());
    const bi = SIZE_ORDER.indexOf((b.size || '').toUpperCase());
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCartCheck, setAddedToCartCheck] = useState(false);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [customText, setCustomText] = useState('');
  const [logoPosition, setLogoPosition] = useState('Center');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [backImagePreview, setBackImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Variant-based selection (for non-customizable apparel with variants)
  const [selectedVariant, setSelectedVariant] = useState(null);

  const fileInputRef = useRef(null);
  const backFileInputRef = useRef(null);

  useEffect(() => {
    if (selectedColor !== '') {
      localStorage.setItem(`color_${id}`, selectedColor);
    }
  }, [selectedColor, id]);

  useEffect(() => {
    if (selectedSize !== '') {
      localStorage.setItem(`size_${id}`, selectedSize);
    }
  }, [selectedSize, id]);

  const handleColorChange = (color) => {

    setSelectedColor(color);
    console.log("Selected Color:", color);
    if (product?.customizationType !== 't-shirt') {
      if (product?.images) {
        const exactFileName = `${color.toLowerCase()}.png`;
        const colorName = color.toLowerCase();

        const colorImage = product.images.find(img => {
          const imgName = img.name ? img.name.toLowerCase() : '';
          const imgUrl = img.url ? img.url.toLowerCase() : '';

          return imgName === exactFileName ||
            imgName.startsWith(colorName + '_') ||
            imgName === colorName ||
            imgUrl.includes(exactFileName) ||
            imgUrl.includes(`/${colorName}_`);
        });

        if (colorImage) {
          setActiveImage(colorImage.url);
        }
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}?populate[0]=images&populate[1]=category&populate[2]=variants&populate[3]=colorVariants.frontImage&populate[4]=colorVariants.backImage`);
        console.log(response.data.data);
        const productData = response.data.data;
        setProduct(productData);
        console.log(productData.colorVariants);
        if (productData.colorVariants?.length > 0) {
          setSelectedColor(productData.colorVariants[0].colorName);
        }
        const savedColor = localStorage.getItem(`color_${id}`);
        const savedSize = localStorage.getItem(`size_${id}`);

        if (savedColor) {
          setSelectedColor(savedColor);
        } else if (productData.colorVariants?.length > 0) {
          setSelectedColor(productData.colorVariants[0].colorName);
        } else if (productData?.images?.length > 0) {
          setActiveImage(productData.images?.[0]?.url);
        }

        if (savedSize) {
          setSelectedSize(savedSize);
        }

      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  useEffect(() => {
    if (!activeImage && product?.images?.length > 0) {
      setActiveImage(product.images[0].url);
    }
  }, [product, activeImage]);
  const { addToCart } = useCart();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImageFile(file);
      setUploadedImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageFile(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveBackImage = () => {
    setBackImageFile(null);
    setBackImagePreview(null);
    if (backFileInputRef.current) backFileInputRef.current.value = '';
  };

  const generatePreviewCanvas = async (tshirtUrl, logoUrl, text) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 800;

      const img1 = new Image();
      img1.crossOrigin = "anonymous";
      img1.src = tshirtUrl;
      img1.onload = () => {
        const hRatio = canvas.width / img1.width;
        const vRatio = canvas.height / img1.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (canvas.width - img1.width * ratio) / 2;
        const centerShift_y = (canvas.height - img1.height * ratio) / 2;
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img1, 0, 0, img1.width, img1.height,
          centerShift_x, centerShift_y, img1.width * ratio, img1.height * ratio);

        const finishCanvas = () => {
          if (text) {
            ctx.fillStyle = '#111827';
            ctx.font = '900 48px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2 + (logoUrl ? 80 : 0));
          }
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        };

        if (logoUrl) {
          const img2 = new Image();
          img2.crossOrigin = "anonymous";
          img2.src = logoUrl;
          img2.onload = () => {
            const maxLogoWidth = canvas.width * 0.4;
            const maxLogoHeight = canvas.height * 0.4;
            const logoHRatio = maxLogoWidth / img2.width;
            const logoVRatio = maxLogoHeight / img2.height;
            const logoRatio = Math.min(logoHRatio, logoVRatio);

            const logoW = img2.width * logoRatio;
            const logoH = img2.height * logoRatio;

            const logoX = (canvas.width - logoW) / 2;
            const logoY = (canvas.height - logoH) / 2 - (text ? 40 : 0);

            ctx.drawImage(img2, logoX, logoY, logoW, logoH);
            finishCanvas();
          };
          img2.onerror = () => finishCanvas();
        } else {
          finishCanvas();
        }
      };
      img1.onerror = () => {
        resolve(null);
      }
    });
  };

  // Determine if this product uses variant-based sizing
  // (non-customizable product that has a variants array with at least one entry)
  const hasVariants = !product?.customizable && product?.variants?.length > 0;
  const sortedVariants = hasVariants ? sortVariants(product.variants) : [];

  // Effective stock: for variant products use the selected variant's stock,
  // otherwise fall back to product-level stock.
  const effectiveStock = hasVariants
    ? (selectedVariant ? selectedVariant.stock : null)
    : (product?.stock ?? 0);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      // ── Variant-based (apparel) product ──
      if (hasVariants) {
        if (!selectedVariant) {
          return toast.error('Please select a size');
        }
        if (selectedVariant.stock <= 0) {
          return toast.error('Selected size is out of stock');
        }

        addToCart(product.documentId, 1, {
          variantId: selectedVariant.id,
          variantSize: selectedVariant.size,
          selectedSize: selectedVariant.size,
        });
        setAddedToCartCheck(true);
        setTimeout(() => setAddedToCartCheck(false), 2000);
        return;
      }

      // ── Customizable product ──
      if (product.stock <= 0) return;

      if (product.customizable) {
        if (product.customizationType === 't-shirt') {
          if (!selectedColor && product.colorVariants?.length > 0) return toast.error('Please select a color');
          if (!selectedSize && product.availableSizes?.length > 0) return toast.error('Please select a size');
          if (!uploadedImageFile) {
            return toast.error("Please upload front design");
          }

          if (!backImageFile) {
            return toast.error("Please upload back design");
          }
        }
        if (product.customizationType === 'mug') {
          if (!selectedColor && product.availableColors?.length > 0) {
            return toast.error('Please select a mug color');
          }

          if (!uploadedImageFile) {
            return toast.error('Please upload an image');
          }
        }

        let uploadedImageUrl = null;
        let backImageUrl = null;
        let previewImageUrl = null;
        let previewImageId = null;

        if (uploadedImageFile || backImageFile || customText) {
          setIsUploading(true);
          try {
            if (uploadedImageFile) {
              const formData = new FormData();
              formData.append('files', uploadedImageFile);
              const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              uploadedImageUrl = uploadRes.data[0].url;
            }
            if (backImageFile) {
              const formData = new FormData();
              formData.append('files', backImageFile);

              const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });

              backImageUrl = uploadRes.data[0].url;
            }

            const variant = product.colorVariants?.find(
              v =>
                v.colorName?.trim().toLowerCase() ===
                selectedColor?.trim().toLowerCase()
            );
            const frontImg = variant?.frontImage?.url;
            console.log("selectedColor", selectedColor);
            console.log("variant", variant);

            if (frontImg) {
              const previewBlob = await generatePreviewCanvas(
                getImageUrl(frontImg),
                uploadedImagePreview,
                customText
              );

              if (previewBlob) {
                const previewFile = new File([previewBlob], 'preview.png', { type: 'image/png' });
                const previewFormData = new FormData();
                previewFormData.append('files', previewFile);
                const previewRes = await api.post('/upload', previewFormData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                previewImageUrl = previewRes.data[0].url;
                previewImageId = previewRes.data[0].id;
              }
            }
          } catch (err) {
            console.error(err);
            setIsUploading(false);
            return toast.error('Failed to upload image or generate preview');
          }
          setIsUploading(false);
        }

        const customization = {
          selectedColor,
          selectedSize,
          customText,

          uploadedImageUrl,
          backImageUrl,

          previewImageUrl,
          previewImageId,

          logoPosition,
          specialInstructions,
        };

        addToCart(product.documentId, 1, customization);
        setAddedToCartCheck(true);
        setTimeout(() => setAddedToCartCheck(false), 2000);

        localStorage.removeItem(`color_${id}`);
        localStorage.removeItem(`size_${id}`);
      } else {
        // Plain product (no variants, not customizable)
        addToCart(product.documentId, 1);
        setAddedToCartCheck(true);
        setTimeout(() => setAddedToCartCheck(false), 2000);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const {
    handleToggleWishlist,
    isInWishlist,
  } = useWishlist();

  if (loading) return <Loader />;

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg mb-4">{error || 'Product not found.'}</p>
        <Link to="/shop" className="text-indigo-600 hover:underline">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  const { title, description, sellingPrice, actualPrice, category, stock, images, bundleOfferEnabled, bundleQty, bundlePrice } = product;
  const galleryImages = images || [];
  const inWishlist = isInWishlist(product.documentId);

  // Add to Cart button disabled states
  const isAddToCartDisabled = (() => {
    if (isUploading) return true;
    if (hasVariants) {
      // Disabled if no variant selected or variant is out of stock
      return !selectedVariant || selectedVariant.stock <= 0;
    }
    return stock <= 0;
  })();

  // Button label
  const addToCartLabel = (() => {
    if (isUploading) return 'Uploading...';
    if (hasVariants) {
      if (!selectedVariant) return 'Select a Size';
      if (selectedVariant.stock <= 0) return 'Sold Out';
      return 'Add to Cart';
    }
    return stock > 0 ? 'Add to Cart' : 'Sold Out';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <FiArrowLeft className="mr-2" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* ── T-shirt dual-preview layout ── */}
        {product.customizable && product.customizationType === 't-shirt' ? (
          <div className="flex flex-col gap-6">
            {/* Front Design Card */}
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="px-5 pt-4 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Front Design</span>
              </div>

              {/* Front Preview */}
              <div className="relative flex items-center justify-center bg-gray-50 mx-4 rounded-xl overflow-hidden" style={{ minHeight: '260px' }}>
                {(() => {
                  const variant = product.colorVariants?.find(
                    v =>
                      v.colorName?.trim().toLowerCase() ===
                      selectedColor?.trim().toLowerCase()
                  );
                  const frontImg = variant?.frontImage?.url || activeImage;
                  return frontImg ? (
                    <img
                      src={getImageUrl(frontImg)}
                      alt={title}
                      className="w-full object-contain p-4 transition-all"
                      style={{ maxHeight: '300px' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 h-64">No Image</div>
                  );
                })()}
                {/* Front overlay */}
                {uploadedImagePreview && (
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                    style={
                      logoPosition === 'Left Chest'
                        ? {
                          top: '30%',
                          left: window.innerWidth < 768 ? '57%' : '52%',
                          width: window.innerWidth < 768 ? '12%' : '9%',
                          height: window.innerWidth < 768 ? '12%' : '9%',
                        }
                        : logoPosition === 'Right Chest'
                          ? {
                            top: '30%',
                            left: window.innerWidth < 768 ? '32%' : '40%',
                            width: window.innerWidth < 768 ? '12%' : '9%',
                            height: window.innerWidth < 768 ? '12%' : '9%',
                          } : {
                            top: '30%',
                            left: '35%',
                            width: '30%',
                            height: '30%',
                          }
                    }>
                    <img
                      src={uploadedImagePreview}
                      alt="Front design"
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                    {customText && (
                      <span
                        className="text-xl font-black text-center drop-shadow-md whitespace-pre-wrap max-w-full break-words leading-tight mt-1"
                        style={{ color: '#111827' }}
                      >
                        {customText}
                      </span>
                    )}
                  </div>
                )}
                {!uploadedImagePreview && customText && (
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                    style={
                      logoPosition === 'Left Chest'
                        ? { top: '25%', left: '55%', width: '25%', height: '25%' }
                        : logoPosition === 'Right Chest'
                          ? { top: '25%', left: '20%', width: '25%', height: '25%' }
                          : { top: '25%', left: '25%', width: '50%', height: '50%' }
                    }>
                    <span
                      className="text-xl font-black text-center drop-shadow-md whitespace-pre-wrap max-w-full break-words leading-tight"
                      style={{ color: '#111827' }}
                    >
                      {customText}
                    </span>
                  </div>
                )}
              </div>

              {/* Front Upload */}
              <div className="px-4 py-4">
                <input
                  ref={fileInputRef}
                  id="front-upload-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {uploadedImageFile ? (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5">
                    <span className="text-sm text-indigo-700 font-medium truncate max-w-[70%]">{uploadedImageFile.name}</span>
                    <button
                      type="button"
                      id="front-remove-btn"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-700 font-bold text-lg leading-none ml-2 flex-shrink-0"
                      title="Remove front design"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="front-upload-input"
                    className="flex items-center justify-center gap-3 w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors text-indigo-600 font-semibold text-sm"
                  >
                    <FiUpload className="w-5 h-5" />
                    Upload Front Design
                  </label>
                )}
              </div>
            </div>

            {/* Back Design Card */}
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="px-5 pt-4 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Back Design</span>
              </div>

              {/* Back Preview */}
              <div className="relative flex items-center justify-center bg-gray-50 mx-4 rounded-xl overflow-hidden" style={{ minHeight: '260px' }}>
                {(() => {
                  const variant = product.colorVariants?.find(
                    v =>
                      v.colorName?.trim().toLowerCase() ===
                      selectedColor?.trim().toLowerCase()
                  );
                  const backImg = variant?.backImage?.url;
                  return backImg ? (
                    <img
                      src={getImageUrl(backImg)}
                      alt={title}
                      className="w-full object-contain p-4 transition-all"
                      style={{ maxHeight: '300px' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 h-64">No Image</div>
                  );
                })()}
                {/* Back overlay */}
                {backImagePreview && (
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                    style={{ top: '25%', left: '25%', width: '50%', height: '50%' }}>
                    <img
                      src={backImagePreview}
                      alt="Back design"
                      className="max-w-full max-h-full object-contain drop-shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Back Upload */}
              <div className="px-4 py-4">
                <input
                  ref={backFileInputRef}
                  id="back-upload-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBackImageFile(file);
                      setBackImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {backImageFile ? (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5">
                    <span className="text-sm text-indigo-700 font-medium truncate max-w-[70%]">{backImageFile.name}</span>
                    <button
                      type="button"
                      id="back-remove-btn"
                      onClick={handleRemoveBackImage}
                      className="text-red-500 hover:text-red-700 font-bold text-lg leading-none ml-2 flex-shrink-0"
                      title="Remove back design"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="back-upload-input"
                    className="flex items-center justify-center gap-3 w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors text-indigo-600 font-semibold text-sm"
                  >
                    <FiUpload className="w-5 h-5" />
                    Upload Back Design
                  </label>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Original gallery layout for all other product types ── */
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {galleryImages.length > 0 && (
              <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0 no-scrollbar">
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setActiveImage(img.url);
                      const imgName = img.name?.toLowerCase() || '';
                      if (imgName.includes('blue')) setSelectedColor('Blue');
                      else if (imgName.includes('red')) setSelectedColor('Red');
                      else if (imgName.includes('green')) setSelectedColor('Green');
                      else if (imgName.includes('white')) setSelectedColor('White');
                      else if (imgName.includes('black')) setSelectedColor('Black');
                    }}
                    className={`relative w-20 h-20 sm:w-full sm:h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === img.url ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img src={getImageUrl(img.url)} alt={title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Live Preview */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-start justify-center bg-gray-50">
              {activeImage ? (
                <img
                  src={getImageUrl(activeImage)}
                  alt={title}
                  className="w-full h-full object-contain transition-all p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}

              {/* Live Preview Overlay — mug only */}
              {product.customizable && product.customizationType === 'mug' && (
                <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                  style={{ top: '15%', left: '12%', width: '65%', height: '70%' }}>
                  {uploadedImagePreview && (
                    <img
                      src={uploadedImagePreview}
                      alt="Custom"
                      className="max-w-full max-h-[80%] object-contain drop-shadow-sm"
                    />
                  )}
                  {customText && (
                    <span
                      className="text-lg font-bold text-center mt-2"
                      style={{ color: selectedColor === 'Black' ? '#ffffff' : '#111827' }}
                    >
                      {customText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Info */}
        <div className="flex flex-col pt-0">
          <div className="mb-6">
            <span className="text-sm text-indigo-600 font-semibold uppercase tracking-wider font-satoshi">
              {category?.name || 'Uncategorized'}
            </span>
            <h1 className="mt-2 text-4xl font-bold text-gray-800 tracking-tight">
              {title}
            </h1>

            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center">
                  <FiStar className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1.5 font-bold text-gray-800">{avgRating}</span>
                </div>
                <span className="text-gray-400 text-sm">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                <span className="text-gray-300 mx-2">|</span>
                <a href="#reviews" className="text-indigo-600 text-sm font-medium hover:underline">Read Reviews</a>
              </div>
            )}

            {bundleOfferEnabled && (
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 bg-green-50 text-green-800 text-sm font-bold px-4 py-2.5 rounded-xl border border-green-200 shadow-sm">
                <span className="flex items-center gap-2">
                  <span className="text-base">🎁</span>
                  Buy Any {bundleQty} {category?.name || 'Items'} for ₹{bundlePrice}
                </span>
                <span className="hidden sm:block text-green-300">|</span>
                <span className="text-green-600 text-xs uppercase tracking-wider font-semibold">Bundle Offer</span>
              </div>
            )}
          </div>

          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-800 font-satoshi">₹{sellingPrice}</span>
            {actualPrice && actualPrice > sellingPrice && (
              <span className="text-xl text-gray-400 line-through mb-1 font-satoshi">₹{actualPrice}</span>
            )}
            {actualPrice && actualPrice > sellingPrice && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1 ml-2 font-satoshi">
                Save ₹{actualPrice - sellingPrice}
              </span>
            )}
          </div>

          <div className="mb-8">
            <ul className="space-y-4">
              {description?.split("\n").map((line, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-indigo-600 text-xl leading-none mt-1">
                    •
                  </span>
                  <span className="text-gray-700 leading-relaxed">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stock indicator */}
          <div className="mb-6">
            <div className="flex items-center text-sm">
              {hasVariants ? (
                // For variant products, show per-variant stock after selection
                selectedVariant ? (
                  selectedVariant.stock > 0 ? (
                    <span className="flex items-center text-green-600 font-medium">
                      <FiCheck className="mr-1.5 w-5 h-5" /> In Stock ({selectedVariant.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock for this size</span>
                  )
                ) : (
                  <span className="text-gray-500 font-medium">Select a size to see availability</span>
                )
              ) : (
                stock > 0 ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <FiCheck className="mr-1.5 w-5 h-5" /> In Stock ({stock} available)
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )
              )}
            </div>
          </div>

          {/* ── Variant-based Size Selector (non-customizable apparel) ── */}
          {hasVariants && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">
                  Size
                  {selectedVariant && (
                    <span className="ml-2 text-indigo-600">— {selectedVariant.size}</span>
                  )}
                </span>
                {!selectedVariant && (
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {sortedVariants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const outOfStock = variant.stock <= 0;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (!outOfStock) setSelectedVariant(variant);
                      }}
                      disabled={outOfStock}
                      title={outOfStock ? `${variant.size} — Out of stock` : `${variant.size} — ${variant.stock} left`}
                      className={`
                        relative px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all
                        ${isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 ring-offset-1'
                          : outOfStock
                            ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50'
                        }
                      `}
                    >
                      {variant.size}
                      {outOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="absolute w-full h-0.5 bg-gray-300 rotate-45 top-1/2 left-0" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
                <p className="mt-2 text-xs text-amber-600 font-medium">
                  ⚠ Only {selectedVariant.stock} left in this size — order soon!
                </p>
              )}
            </div>
          )}

          {/* ── Customizable product options ── */}
          {product.customizable && (
            <div className="mb-8 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Customize your {product.customizationType}</h3>

              {/* Color selector — t-shirt */}
              {product.customizationType === 't-shirt' && product.colorVariants?.length > 0 && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Color</span>
                  <div className="flex gap-2">
                    {product.colorVariants.map(variant => (
                      <button
                        key={variant.colorName}
                        onClick={() => handleColorChange(variant.colorName)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === variant.colorName ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2' : 'border-gray-300'}`}
                        style={{ backgroundColor: variant.colorName.toLowerCase() }}
                        title={variant.colorName}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Color selector — mug */}
              {product.customizationType === 'mug' && product.availableColors && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Mug Color</span>
                  <div className="flex gap-2">
                    {product.availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2' : 'border-gray-300'}`}
                        style={{ backgroundColor: color.toLowerCase() === 'brown' ? '#8B4513' : color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector — t-shirt */}
              {product.customizationType === 't-shirt' && product.availableSizes?.length > 0 && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Size</span>
                  <div className="flex gap-2 flex-wrap">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md font-medium ${selectedSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo Position — t-shirt */}
              {product.customizationType === 't-shirt' && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Logo Position</span>
                  <div className="flex gap-2 flex-wrap">
                    {['Center', 'Left Chest', 'Right Chest'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setLogoPosition(pos)}
                        className={`px-4 py-2 border rounded-md font-medium ${logoPosition === pos ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</span>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Place logo on left chest, make logo smaller, etc."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-600 focus:ring-0 transition-colors resize-none"
                  rows="3"
                ></textarea>
              </div>

              {/* Mug upload (single image) */}
              {product.customizationType === 'mug' && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Upload Image</span>
                  <input
                    ref={fileInputRef}
                    id="mug-upload-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {uploadedImageFile ? (
                    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5">
                      <span className="text-sm text-indigo-700 font-medium truncate max-w-[70%]">{uploadedImageFile.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-700 font-bold text-lg leading-none ml-2 flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="mug-upload-input"
                      className="flex items-center justify-center gap-3 w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 font-semibold text-sm"
                    >
                      <FiUpload className="w-5 h-5" />
                      Click to upload
                    </label>
                  )}
                </div>
              )}
            </div>
          )}
          {product.customizable && (
            <div className="mt-6 mb-2 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-amber-500 text-xl">
                  📸
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">Important</h3>
                  <div className="text-sm text-amber-700 space-y-2">
                    <p>Before adding to cart, please take screenshots of your <strong>Front Design</strong> and <strong>Back Design</strong> previews.</p>
                    <p>After placing your order, send the screenshots along with your Order ID to:</p>
                    <ul className="font-semibold space-y-1 mt-1">
                      <li>📧 <a href="mailto:calmandcozy34@gmail.com" className="underline hover:text-amber-900 transition-colors">calmandcozy34@gmail.com</a></li>
                      <li>📱 WhatsApp: 8300932172</li>
                    </ul>
                    <p className="mt-2 text-xs opacity-90">This helps us ensure your custom design is printed exactly as shown in the preview.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-gray-100 pt-8">
            <button
              disabled={isAddToCartDisabled || addingToCart}
              className={`flex-1 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${addedToCartCheck ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300'
                }`}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : addedToCartCheck ? (
                <>
                  <FiCheck className="w-5 h-5" />
                  Added!
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-5 h-5" />
                  {addToCartLabel}
                </>
              )}
            </button>
            <button
              className="px-6 py-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-gray-600 hover:text-red-500 transition-colors flex items-center justify-center bg-white shadow-sm hover:shadow-md"
              onClick={() => {
                handleToggleWishlist(product.documentId);
              }}
            >
              <FiHeart className={`w-6 h-6 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div id="reviews">
        <ProductReviews
          productId={product.documentId}
          onStatsCalculated={(avg, count) => {
            setAvgRating(avg);
            setReviewCount(count);
          }}
        />
      </div>
    </motion.div>
  );
}
