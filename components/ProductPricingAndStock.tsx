import React, { useState, useEffect } from 'react';

interface ProductPricingAndStockProps {
  onDataChange?: (data: ProductPricingData) => void;
  initialData?: Partial<ProductPricingData>;
}

export interface ProductPricingData {
  regularPrice: number;
  salesPrice: number;
  costPrice: number;
  stockValue: number;
  sku: string;
  isWholesale: boolean;
}

const ProductPricingAndStock: React.FC<ProductPricingAndStockProps> = ({
  onDataChange,
  initialData = {} as Partial<ProductPricingData>
}) => {
  const [formData, setFormData] = useState<ProductPricingData>({
    regularPrice: initialData?.regularPrice ?? 0,
    salesPrice: initialData?.salesPrice ?? 0,
    costPrice: initialData?.costPrice ?? 0,
    stockValue: initialData?.stockValue ?? 0,
    sku: initialData?.sku ?? '',
    isWholesale: initialData?.isWholesale ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate required fields
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    if (field === 'regularPrice' && (!value || value <= 0)) {
      newErrors.regularPrice = 'Regular price is required and must be greater than 0';
    } else {
      delete newErrors.regularPrice;
    }

    if (field === 'stockValue' && (!value || value < 0)) {
      newErrors.stockValue = 'Stock value is required and must be 0 or greater';
    } else {
      delete newErrors.stockValue;
    }

    setErrors(newErrors);
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ProductPricingData
  ) => {
    const { type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    const updatedData = {
      ...formData,
      [field]: type === 'checkbox' ? checked : (field !== 'sku' ? parseFloat(value) || 0 : value),
    };

    setFormData(updatedData);
    validateField(field, newValue);
  };

  // Notify parent of changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  return (
    <div className="pricing-and-stock-container">
      <div className="pricing-and-stock-header">
        <h3 className="pricing-and-stock-title">Price And Stock</h3>
        <label className="wholesale-checkbox-label">
          <input
            type="checkbox"
            checked={formData.isWholesale}
            onChange={(e) => handleInputChange(e, 'isWholesale')}
            className="wholesale-checkbox"
          />
          <span className="wholesale-text">Is Wholesale</span>
        </label>
      </div>

      {/* Price Row */}
      <div className="pricing-row">
        <div className="form-group">
          <label className="form-label">
            Regular Price<span className="required-asterisk">*</span>
          </label>
          <input
            type="number"
            value={formData.regularPrice || ''}
            onChange={(e) => handleInputChange(e, 'regularPrice')}
            placeholder="900"
            className={`form-input ${errors.regularPrice ? 'input-error' : ''}`}
            min="0"
            step="0.01"
          />
          {errors.regularPrice && (
            <p className="error-message">{errors.regularPrice}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Sales Price</label>
          <input
            type="number"
            value={formData.salesPrice || ''}
            onChange={(e) => handleInputChange(e, 'salesPrice')}
            placeholder="675"
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Cost, Stock, SKU Row */}
      <div className="cost-stock-sku-row">
        <div className="form-group">
          <label className="form-label">Cost Price</label>
          <input
            type="number"
            value={formData.costPrice || ''}
            onChange={(e) => handleInputChange(e, 'costPrice')}
            placeholder="340"
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Stock Quantity<span className="required-asterisk">*</span>
          </label>
          <input
            type="number"
            value={formData.stockValue || ''}
            onChange={(e) => handleInputChange(e, 'stockValue')}
            placeholder="10"
            className={`form-input ${errors.stockValue ? 'input-error' : ''}`}
            min="0"
            step="1"
          />
          {errors.stockValue && (
            <p className="error-message">{errors.stockValue}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">SKU</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => handleInputChange(e, 'sku')}
            placeholder="CS-FROG-EDU-TOY"
            className="form-input"
          />
        </div>
      </div>

      <style jsx>{`
        .pricing-and-stock-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background-color: #ffffff;
        }

        .pricing-and-stock-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pricing-and-stock-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .wholesale-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .wholesale-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          accent-color: #10b981;
        }

        .wholesale-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .pricing-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .cost-stock-sku-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: capitalize;
        }

        .required-asterisk {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
          color: #1f2937;
          background-color: #ffffff;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-input.input-error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .form-input.input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-input::placeholder {
          color: #d1d5db;
        }

        .error-message {
          font-size: 0.75rem;
          color: #ef4444;
          margin: 0;
          margin-top: 0.25rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .pricing-and-stock-container {
            padding: 1rem;
            gap: 1rem;
          }

          .pricing-row {
            grid-template-columns: 1fr;
          }

          .cost-stock-sku-row {
            grid-template-columns: 1fr;
          }

          .pricing-and-stock-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductPricingAndStock;
