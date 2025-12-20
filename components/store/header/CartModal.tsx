// CartModal - Shopping cart modal/drawer
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Product } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: number[];
  catalogSource: Product[];
  onToggleCart: (productId: number) => void;
  onCheckout: (productId: number) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  catalogSource,
  onToggleCart,
  onCheckout,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900" onClick={onClose}>
          <X size={22} />
        </button>
        <h2 className="text-lg font-bold mb-4">My Cart</h2>
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No items in cart.</div>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto">
            {cartItems.map((id) => {
              const product = catalogSource.find(p => p.id === id);
              if (!product) return null;
              return (
                <li key={id} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
                  <img 
                    src={normalizeImageUrl(product.image)} 
                    alt={product.name} 
                    className="w-14 h-14 rounded-lg object-cover border" 
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm font-bold text-green-600 mt-1">৳ {formatCurrency(product.price)}</div>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 btn-order py-1.5 text-sm" onClick={() => onCheckout(id)}>Checkout</button>
                      <button className="rounded-lg border border-red-200 text-red-500 text-xs font-semibold px-3 py-2 hover:bg-red-50" onClick={() => onToggleCart(id)}>Remove</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CartModal;
