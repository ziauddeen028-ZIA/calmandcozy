import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  FiMapPin, FiPlus, FiEdit2, FiTrash2,
  FiUser, FiPackage, FiHeart, FiLogOut,
  FiCheck, FiX, FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../lib/addressService';


// ─── Validation ────────────────────────────────────────────────────────────────

const PHONE_REGEX = /^[6-9]\d{9}$/;          // 10-digit Indian mobile
const PINCODE_REGEX = /^\d{6}$/;              // 6-digit Indian pincode

function validateAddress(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = 'Full name is required';
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit mobile number';
  }
  if (!form.address_line_1.trim()) errors.address_line_1 = 'Address line 1 is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!form.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!PINCODE_REGEX.test(form.pincode.trim())) {
    errors.pincode = 'Enter a valid 6-digit pincode';
  }
  if (!form.country.trim()) errors.country = 'Country is required';
  return errors;
}

// ─── Empty form template ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  full_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  is_default: false,
};

// ─── Field component ───────────────────────────────────────────────────────────

function Field({ label, name, type = 'text', value, onChange, error, required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <FiAlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Address Form Modal ────────────────────────────────────────────────────────

function AddressFormModal({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── Auto-fill City & State from 6-digit Indian pincode ──────────────────────
  useEffect(() => {
    const pincode = form.pincode.trim();
    if (!PINCODE_REGEX.test(pincode)) return;

    let cancelled = false;
    (async () => {
      setPincodeLoading(true);
      setErrors((prev) => ({ ...prev, pincode: undefined }));
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (cancelled) return;
        const postOffice = data?.[0]?.PostOffice?.[0];
        if (data?.[0]?.Status === 'Success' && postOffice) {
          setForm((prev) => ({
            ...prev,
            city: postOffice.District || prev.city,
            state: postOffice.State || prev.state,
          }));
        } else {
          setErrors((prev) => ({ ...prev, pincode: 'Invalid pincode' }));
        }
      } catch {
        if (!cancelled)
          setErrors((prev) => ({ ...prev, pincode: 'Could not verify pincode' }));
      } finally {
        if (!cancelled) setPincodeLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [form.pincode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateAddress(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name" name="full_name" required
              value={form.full_name} onChange={handleChange}
              error={errors.full_name} placeholder="Recipient name"
            />
            <Field
              label="Phone" name="phone" type="tel" required
              value={form.phone} onChange={handleChange}
              error={errors.phone} placeholder="10-digit mobile"
            />
          </div>

          <Field
            label="Address Line 1" name="address_line_1" required
            value={form.address_line_1} onChange={handleChange}
            error={errors.address_line_1} placeholder="House / flat / building"
          />
          <Field
            label="Address Line 2 (optional)" name="address_line_2"
            value={form.address_line_2} onChange={handleChange}
            error={errors.address_line_2} placeholder="Street / area / landmark"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="City" name="city" required
              value={form.city} onChange={handleChange}
              error={errors.city} placeholder="City"
            />
            <Field
              label="State" name="state" required
              value={form.state} onChange={handleChange}
              error={errors.state} placeholder="State"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pincode with auto-lookup spinner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 pr-8 ${
                    errors.pincode ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {pincodeLoading && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </span>
                )}
              </div>
              {errors.pincode && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" /> {errors.pincode}
                </p>
              )}
            </div>
            <Field
              label="Country" name="country" required
              value={form.country} onChange={handleChange}
              error={errors.country} placeholder="Country"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_default"
              checked={form.is_default}
              onChange={handleChange}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : (initial ? 'Update Address' : 'Save Address')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Address Card ──────────────────────────────────────────────────────────────

function AddressCard({ address, onEdit, onDelete, onSetDefault, isDeleting }) {
  return (
    <div className={`bg-white border rounded-xl p-5 relative transition-shadow hover:shadow-sm ${address.is_default ? 'border-brand-400 ring-1 ring-brand-200' : 'border-gray-200'
      }`}>
      {address.is_default && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          <FiCheck className="h-3 w-3" /> Default
        </span>
      )}

      <p className="font-semibold text-gray-900 mb-1">{address.full_name}</p>
      <p className="text-sm text-gray-600">{address.address_line_1}</p>
      {address.address_line_2 && (
        <p className="text-sm text-gray-600">{address.address_line_2}</p>
      )}
      <p className="text-sm text-gray-600">
        {address.city}, {address.state} — {address.pincode}
      </p>
      <p className="text-sm text-gray-600">{address.country}</p>
      <p className="text-sm text-gray-600 mt-1">📞 {address.phone}</p>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors"
        >
          <FiEdit2 className="h-4 w-4" /> Edit
        </button>

        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors"
          >
            <FiCheck className="h-4 w-4" /> Set Default
          </button>
        )}

        <button
          onClick={() => onDelete(address)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors ml-auto disabled:opacity-50"
        >
          <FiTrash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar (shared profile nav) ─────────────────────────────────────────────

function ProfileSidebar({ onLogout }) {
  const location = useLocation();
  const navItems = [
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Orders', path: '/orders', icon: FiPackage },
    { name: 'Addresses', path: '/addresses', icon: FiMapPin },
    { name: 'Wishlist', path: '/wishlist', icon: FiHeart },
  ];

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <FiLogOut className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Addresses() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.state);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Modal state: null = closed, 'create' = new, address object = editing
  const [modal, setModal] = useState(null);

  const supabaseId = user?.id;

  // ─── Load addresses ─────────────────────────────────────────────────────────

  const loadAddresses = useCallback(async () => {
    if (!supabaseId) return;
    setLoadingAddresses(true);
    try {
      const data = await fetchAddresses(supabaseId);
      setAddresses(data);
    } catch (err) {
      console.error('[Address] Error loading addresses:', err);
      toast.error('Could not load addresses. Please refresh.');
    } finally {
      setLoadingAddresses(false);
    }
  }, [supabaseId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // ─── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    setIsSaving(true);
    try {
      const created = await createAddress(supabaseId, formData);
      // If new address is default, update local state for others
      setAddresses((prev) => {
        const updated = formData.is_default
          ? prev.map((a) => ({ ...a, is_default: false }))
          : prev;
        return [created, ...updated];
      });
      setModal(null);
      toast.success('Address added successfully');
      if (location.state?.returnToCheckout) {
        navigate('/checkout');
      }
    } catch (err) {
      console.error('[Address] Create failed:', err);
      toast.error(err.message || 'Failed to add address');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Update ────────────────────────────────────────────────────────────────

  const handleUpdate = async (formData) => {
    const addressId = modal?.documentId || modal?.id;
    setIsSaving(true);
    try {
      const updated = await updateAddress(supabaseId, addressId, formData);
      setAddresses((prev) => {
        let list = prev.map((a) => {
          const aId = a.documentId || a.id;
          if (aId === addressId) return { ...a, ...updated };
          // Unset default on others if this one is now default
          return formData.is_default ? { ...a, is_default: false } : a;
        });
        return list;
      });
      setModal(null);
      toast.success('Address updated successfully');
    } catch (err) {
      console.error('[Address] Update failed:', err);
      toast.error(err.message || 'Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (address) => {
    const addressId = address.documentId || address.id;
    if (!window.confirm('Delete this address?')) return;
    setDeletingId(addressId);
    try {
      await deleteAddress(supabaseId, addressId);
      setAddresses((prev) => prev.filter((a) => (a.documentId || a.id) !== addressId));
      toast.success('Address deleted');
    } catch (err) {
      console.error('[Address] Delete failed:', err);
      toast.error(err.message || 'Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Set Default ───────────────────────────────────────────────────────────

  const handleSetDefault = async (address) => {
    const addressId = address.documentId || address.id;
    try {
      await updateAddress(supabaseId, addressId, { is_default: true });
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          is_default: (a.documentId || a.id) === addressId,
        }))
      );
      toast.success('Default address updated');
    } catch (err) {
      console.error('[Address] Set default failed:', err);
      toast.error(err.message || 'Failed to update default address');
    }
  };

  // ─── Modal save dispatcher ─────────────────────────────────────────────────

  const handleSave = (formData) => {
    if (modal === 'create') {
      handleCreate(formData);
    } else {
      handleUpdate(formData);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">

        <ProfileSidebar onLogout={handleLogout} />

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your delivery addresses</p>
              </div>
              <button
                onClick={() => setModal('create')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
              >
                <FiPlus className="h-4 w-4" /> Add Address
              </button>
            </div>

            {/* Loading */}
            {loadingAddresses && (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!loadingAddresses && addresses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-50 p-5 rounded-full inline-flex mb-5">
                  <FiMapPin className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add your first delivery address
                </h3>
                <p className="text-gray-500 mb-6 max-w-xs">
                  Save your addresses for a faster checkout experience.
                </p>
                <button
                  onClick={() => setModal('create')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <FiPlus className="h-4 w-4" /> Add Address
                </button>
              </div>
            )}

            {/* Address list */}
            {!loadingAddresses && addresses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.documentId || address.id}
                    address={address}
                    onEdit={(a) => setModal(a)}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                    isDeleting={deletingId === (address.documentId || address.id)}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal */}
      {modal !== null && (
        <AddressFormModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
