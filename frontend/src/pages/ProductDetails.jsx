import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiCheck, FiArrowLeft, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Loader from '../components/Loader';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

const getImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http")
    ? url
    : `${STRAPI_URL}${url}`;
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [customText, setCustomText] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  console.log("Product ID:", id);
  console.log("Saved Color:", localStorage.getItem(`color_${id}`));
  console.log("Saved Size:", localStorage.getItem(`size_${id}`));
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
    console.log("Color Selected:", color);
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
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}?populate=*`);
        const productData = response.data.data;
        setProduct(productData);
        const savedColor = localStorage.getItem(`color_${id}`);
        const savedSize = localStorage.getItem(`size_${id}`);

        if (savedColor) {
          setSelectedColor(savedColor);

          const colorImage = productData.images?.find(img => {
            const imgName = img.name?.toLowerCase() || '';
            return imgName.includes(savedColor.toLowerCase());
          });

          if (colorImage) {
            setActiveImage(colorImage.url);
          }
        } else if (productData?.images?.length > 0) {
          setActiveImage(productData.images[0].url);
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    if (product.customizable) {
      if (product.customizationType === 't-shirt') {
        if (!selectedColor && product.availableColors?.length > 0) return toast.error('Please select a color');
        if (!selectedSize && product.availableSizes?.length > 0) return toast.error('Please select a size');
      }

      let uploadedImageUrl = null;
      let previewImageUrl = null;
      let previewImageId = null;

      if (uploadedImageFile || customText) {
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

          if (activeImage) {
            const previewBlob = await generatePreviewCanvas(
              getImageUrl(activeImage),
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
        previewImageUrl,
        previewImageId,
      };

      addToCart(product.documentId, 1, customization);
      localStorage.removeItem(`color_${id}`);
      localStorage.removeItem(`size_${id}`);
    } else {
      addToCart(product.documentId, 1);
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

  const { title, description, sellingPrice, actualPrice, category, stock, images } = product;
  const inWishlist = isInWishlist(product.documentId);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0 no-scrollbar">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setActiveImage(img.url);

                    const imgName = img.name?.toLowerCase() || '';

                    if (imgName.includes('blue')) {
                      setSelectedColor('Blue');
                    } else if (imgName.includes('red')) {
                      setSelectedColor('Red');
                    } else if (imgName.includes('green')) {
                      setSelectedColor('Green');
                    } else if (imgName.includes('white')) {
                      setSelectedColor('White');
                    } else if (imgName.includes('black')) {
                      setSelectedColor('Black');
                    }
                  }}
                  className={`relative w-20 h-20 sm:w-full sm:h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === img.url
                    ? 'border-indigo-600'
                    : 'border-transparent hover:border-gray-300'
                    }`}
                >
                  <img
                    src={getImageUrl(img.url)}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image with Live Preview */}
          <div
            className="relative w-full h-[700px] rounded-2xl overflow-hidden flex items-center justify-center bg-gray-50"
          >
            {activeImage ? (
              <img
                src={getImageUrl(activeImage)}
                alt={title}
                className="w-full h-full object-contain transition-all p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}

            {/* Live Preview Overlay */}
            {product.customizable && (
              <div className="absolute flex flex-col items-center justify-center pointer-events-none"
                style={{
                  top: product.customizationType === 't-shirt' ? '25%' : product.customizationType === 'mug' ? '15%' : '15%',
                  left: product.customizationType === 't-shirt' ? '25%' : product.customizationType === 'mug' ? '12%' : '15%',
                  width: product.customizationType === 't-shirt' ? '50%' : product.customizationType === 'mug' ? '65%' : '70%',
                  height: product.customizationType === 't-shirt' ? '50%' : product.customizationType === 'mug' ? '70%' : '70%'
                }}>
                {/* T-Shirt Preview */}
                {product.customizationType === "t-shirt" && (
                  <>
                    {uploadedImagePreview && (
                      <img
                        src={uploadedImagePreview}
                        alt="Custom"
                        className="max-w-full max-h-[60%] object-contain mb-2 drop-shadow-sm"
                      />
                    )}

                    {customText && (
                      <span
                        className="text-2xl sm:text-3xl font-black text-center drop-shadow-md whitespace-pre-wrap max-w-full break-words leading-tight"
                        style={{ color: "#111827" }}
                      >
                        {customText}
                      </span>
                    )}
                  </>
                )}

                {/* Mug Preview */}
                {product.customizationType === "mug" && (
                  <>
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
                        style={{
                          color: selectedColor === "Black" ? "#ffffff" : "#111827"
                        }}
                      >
                        {customText}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">
              {category?.name || 'Uncategorized'}
            </span>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">₹{sellingPrice}</span>
            {actualPrice && actualPrice > sellingPrice && (
              <span className="text-xl text-gray-400 line-through mb-1">₹{actualPrice}</span>
            )}
            {actualPrice && actualPrice > sellingPrice && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1 ml-2">
                Save ₹{actualPrice - sellingPrice}
              </span>
            )}
          </div>

          <div className="prose prose-lg text-gray-600 mb-8">
            <p>{description}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center text-sm">
              {stock > 0 ? (
                <span className="flex items-center text-green-600 font-medium">
                  <FiCheck className="mr-1.5 w-5 h-5" /> In Stock ({stock} available)
                </span>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {product.customizable && (
            <div className="mb-8 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Customize your {product.customizationType}</h3>

              {product.customizationType === 't-shirt' && product.availableColors && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Color</span>
                  <div className="flex gap-2">
                    {product.availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2' : 'border-gray-300'}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
              {product.customizationType === 'mug' && product.availableColors && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Mug Color
                  </span>

                  <div className="flex gap-2">
                    {product.availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color
                          ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                          : 'border-gray-300'
                          }`}
                        style={{
                          backgroundColor:
                            color.toLowerCase() === 'brown'
                              ? '#8B4513'
                              : color.toLowerCase()
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.customizationType === 't-shirt' && product.availableSizes && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Size</span>
                  <div className="flex gap-2">
                    {product.availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md font-medium ${selectedSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-600'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}



              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Upload Image</span>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    {uploadedImageFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-indigo-600 font-semibold">
                          {uploadedImageFile.name}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          className="ml-2 text-red-500 font-bold hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-gray-100 pt-8">
            <button
              disabled={stock <= 0 || isUploading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              onClick={handleAddToCart}
            >
              <FiShoppingCart className="w-5 h-5" />
              {isUploading ? 'Uploading...' : stock > 0 ? 'Add to Cart' : 'Sold Out'}
            </button>
            <button
              className="px-6 py-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-gray-600 hover:text-red-500 transition-colors flex items-center justify-center bg-white shadow-sm hover:shadow-md"
              onClick={() => {
                if (product.customizable) {
                  if (
                    product.customizationType === "t-shirt" &&
                    !selectedColor &&
                    product.availableColors?.length > 0
                  ) {
                    return toast.error("Please select a color");
                  }

                  if (
                    product.customizationType === "t-shirt" &&
                    !selectedSize &&
                    product.availableSizes?.length > 0
                  ) {
                    return toast.error("Please select a size");
                  }

                  if (
                    product.customizationType === "mug" &&
                    !selectedColor &&
                    product.availableColors?.length > 0
                  ) {
                    return toast.error("Please select a mug color");
                  }
                }

                handleToggleWishlist(product.documentId);
              }}
            >
              <FiHeart className={`w-6 h-6 ${inWishlist ? 'text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
