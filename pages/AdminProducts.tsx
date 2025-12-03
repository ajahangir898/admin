
import React, { useState, useRef } from 'react';
import { Product, Category, SubCategory, ChildCategory, Brand, Tag } from '../types';
import { Search, Plus, Edit, Trash2, X, Upload, Save, Image as ImageIcon, CheckCircle, AlertCircle, Grid, List, CheckSquare, Layers, Tag as TagIcon, Percent } from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  subCategories: SubCategory[];
  childCategories: ChildCategory[];
  brands: Brand[];
  tags: Tag[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  onBulkUpdate: (ids: number[], updates: Partial<Product>) => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ 
  products,
  categories,
  subCategories,
  childCategories,
  brands,
  tags,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onBulkDelete,
  onBulkUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<'category' | 'discount' | null>(null);
  const [bulkValue, setBulkValue] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: 0,
    category: '',
    subCategory: '',
    childCategory: '',
    brand: '',
    description: '',
    image: '',
    discount: '',
    tags: []
  });
  const [initialFormData, setInitialFormData] = useState<Partial<Product> | null>(null); // To track dirty state
  const [tagInput, setTagInput] = useState('');
  
  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State for filtering
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered dropdown options based on selection
  const availableSubCategories = subCategories.filter(s => {
    const parentCat = categories.find(c => c.name === formData.category);
    return parentCat && s.categoryId === parentCat.id;
  });

  const availableChildCategories = childCategories.filter(c => {
    const parentSub = subCategories.find(s => s.name === formData.subCategory);
    return parentSub && c.subCategoryId === parentSub.id;
  });

  const handleOpenModal = (product?: Product) => {
    let initialData: Partial<Product>;
    if (product) {
      setEditingProduct(product);
      initialData = { ...product };
    } else {
      setEditingProduct(null);
      initialData = {
        name: '',
        price: 0,
        originalPrice: 0,
        category: categories[0]?.name || '',
        subCategory: '',
        childCategory: '',
        brand: '',
        description: '',
        image: '',
        discount: '',
        tags: []
      };
    }
    setFormData(initialData);
    setInitialFormData(initialData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill in required fields (Name, Price, Product Image)");
      return;
    }

    const productData = {
      ...formData,
      // Ensure defaults
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      rating: editingProduct ? editingProduct.rating : 5.0, // Default rating for new products
      reviews: editingProduct ? editingProduct.reviews : 0
    } as Product;

    if (editingProduct) {
      onUpdateProduct({ ...productData, id: editingProduct.id });
    } else {
      onAddProduct({ ...productData, id: Date.now() }); // Simple ID generation
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      onDeleteProduct(id);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const addExistingTag = (tagName: string) => {
    if (!formData.tags?.includes(tagName)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagName]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tagToRemove)
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large. Please upload an image under 2MB.");
        return;
      }

      console.log(`Processing upload for ${file.name} (Simulating DB store)`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // Bulk Handlers
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const executeBulkAction = () => {
    if (bulkAction === 'category') {
      if (!bulkValue) return alert("Please select a category");
      onBulkUpdate(selectedIds, { category: bulkValue });
    } else if (bulkAction === 'discount') {
      onBulkUpdate(selectedIds, { discount: bulkValue }); // Allow empty to clear discount
    }
    
    // Reset
    setBulkAction(null);
    setBulkValue('');
    setSelectedIds([]);
    alert("Bulk action completed successfully!");
  };

  const executeBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Products</h2>
           <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-lg shadow-purple-200"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
              onChange={selectAll}
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <div className="relative flex-1 w-full sm:max-w-xs">
             <input 
               type="text" 
               placeholder="Search products..." 
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        <div className="text-sm text-gray-500">
           Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-4">
           <span className="font-bold text-sm bg-gray-700 px-3 py-1 rounded-full">{selectedIds.length} Selected</span>
           
           <div className="h-6 w-px bg-gray-700"></div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setBulkAction('category')}
                className="flex items-center gap-2 hover:text-purple-300 transition text-sm font-medium"
              >
                <Layers size={16} /> Category
              </button>
              <button 
                onClick={() => setBulkAction('discount')}
                className="flex items-center gap-2 hover:text-purple-300 transition text-sm font-medium"
              >
                <Percent size={16} /> Discount
              </button>
              <button 
                onClick={executeBulkDelete}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-medium ml-2"
              >
                <Trash2 size={16} /> Delete
              </button>
           </div>

           <button onClick={() => setSelectedIds([])} className="bg-gray-700 rounded-full p-1 hover:bg-gray-600 ml-2">
             <X size={14} />
           </button>
        </div>
      )}

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
         {filteredProducts.map(product => (
           <div 
             key={product.id} 
             className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition group relative ${
               selectedIds.includes(product.id) ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'
             }`}
           >
              {/* Selection Checkbox Overlay */}
              <div className="absolute top-3 left-3 z-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelection(product.id)}
                  className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 shadow-sm cursor-pointer"
                />
              </div>

              <div className="relative h-48 bg-gray-100">
                 <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                 {product.discount && (
                   <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                     {product.discount}
                   </span>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-[1px]">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-purple-50 hover:text-purple-600 transition shadow-lg"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition shadow-lg"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
              <div className="p-4 cursor-pointer" onClick={() => toggleSelection(product.id)}>
                 <div className="mb-2 flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      {product.category || 'Uncategorized'}
                    </span>
                    {product.brand && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {product.brand}
                      </span>
                    )}
                 </div>
                 <h3 className="font-bold text-gray-800 line-clamp-1 mb-1" title={product.name}>{product.name}</h3>
                 <div className="flex justify-between items-center mt-3">
                    <div className="flex flex-col">
                       <span className="font-bold text-gray-900">৳ {product.price.toLocaleString()}</span>
                       {product.originalPrice && (
                         <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice.toLocaleString()}</span>
                       )}
                    </div>
                    <div className="text-xs text-gray-500">ID: {product.id}</div>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                 <h3 className="text-xl font-bold text-gray-800">
                   {editingProduct ? 'Edit Product' : 'Add New Product'}
                 </h3>
                 <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                 <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Product Name*</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Brand</label>
                          <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                            value={formData.brand}
                            onChange={e => setFormData({...formData, brand: e.target.value})}
                          >
                             <option value="">Select Brand</option>
                             {brands.map(b => (
                               <option key={b.name} value={b.name}>{b.name}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Category*</label>
                          <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                            value={formData.category}
                            onChange={e => setFormData({
                                ...formData, 
                                category: e.target.value,
                                subCategory: '', 
                                childCategory: '' 
                            })}
                          >
                             <option value="">Select Category</option>
                             {categories.map(c => (
                               <option key={c.name} value={c.name}>{c.name}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Sub Category</label>
                          <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                            value={formData.subCategory}
                            onChange={e => setFormData({
                                ...formData, 
                                subCategory: e.target.value,
                                childCategory: ''
                            })}
                            disabled={!formData.category}
                          >
                             <option value="">Select Sub Category</option>
                             {availableSubCategories.map(s => (
                               <option key={s.name} value={s.name}>{s.name}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Child Category</label>
                          <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                            value={formData.childCategory}
                            onChange={e => setFormData({...formData, childCategory: e.target.value})}
                            disabled={!formData.subCategory}
                          >
                             <option value="">Select Child Category</option>
                             {availableChildCategories.map(c => (
                               <option key={c.name} value={c.name}>{c.name}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Price (৳)*</label>
                          <input 
                            type="number" 
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                          />
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Original Price (৳)</label>
                          <input 
                            type="number" 
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            value={formData.originalPrice || ''}
                            onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Product Image*</label>
                       
                       <input 
                         type="file" 
                         ref={fileInputRef}
                         onChange={handleImageUpload}
                         className="hidden"
                         accept="image/*"
                       />

                       {!formData.image ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition group"
                          >
                             <div className="bg-purple-100 p-2 rounded-full text-purple-600 mb-2 group-hover:scale-110 transition">
                               <Upload size={20} />
                             </div>
                             <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                             <p className="text-xs text-gray-400">JPG, PNG (Max 2MB)</p>
                          </div>
                       ) : (
                          <div className="relative h-48 w-full bg-gray-100 rounded-xl border border-gray-200 overflow-hidden group">
                             <img 
                               src={formData.image} 
                               alt="Preview" 
                               className="w-full h-full object-contain" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                <button 
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="bg-white text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg text-sm"
                                >
                                  Change
                                </button>
                                <button 
                                  type="button"
                                  onClick={removeImage}
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shadow-lg"
                                >
                                  <Trash2 size={18} />
                                </button>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Description</label>
                       <textarea 
                         rows={4}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                         value={formData.description}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                       ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Discount Label</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 20% OFF"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            value={formData.discount}
                            onChange={e => setFormData({...formData, discount: e.target.value})}
                          />
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Tags</label>
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               placeholder="Add tag..."
                               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                               value={tagInput}
                               onChange={e => setTagInput(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                             />
                             <button type="button" onClick={addTag} className="bg-gray-100 px-4 rounded-lg hover:bg-gray-200 text-gray-600 font-bold">+</button>
                          </div>
                          
                          {/* Quick Tag Select from Catalog */}
                          <div className="flex gap-2 flex-wrap mt-2">
                             {tags.map(t => (
                               <button 
                                 key={t.name}
                                 type="button"
                                 onClick={() => addExistingTag(t.name)}
                                 className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-full text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition"
                               >
                                 + {t.name}
                               </button>
                             ))}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                             {formData.tags?.map(tag => (
                               <span key={tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                 {tag} 
                                 <button type="button" onClick={() => removeTag(tag)} className="hover:text-purple-900"><X size={12}/></button>
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={handleCloseModal}
                   className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   form="productForm"
                   className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200 flex items-center gap-2"
                 >
                   <Save size={18} /> Save Product
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {bulkAction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-4 bg-gray-900 text-white font-bold flex justify-between items-center">
                 <h3>Bulk Action: {bulkAction === 'category' ? 'Change Category' : 'Apply Discount'}</h3>
                 <button onClick={() => setBulkAction(null)} className="hover:text-gray-300"><X size={18}/></button>
              </div>
              <div className="p-6">
                 <p className="text-gray-600 text-sm mb-4">
                    Applying to <span className="font-bold text-gray-900">{selectedIds.length}</span> selected products.
                 </p>
                 
                 {bulkAction === 'category' ? (
                   <select 
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                     value={bulkValue}
                     onChange={(e) => setBulkValue(e.target.value)}
                   >
                      <option value="">Select New Category</option>
                      {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                 ) : (
                   <input 
                     type="text" 
                     placeholder="Discount (e.g. 50% OFF)"
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                     value={bulkValue}
                     onChange={(e) => setBulkValue(e.target.value)}
                   />
                 )}

                 <div className="mt-6 flex gap-3">
                    <button onClick={() => setBulkAction(null)} className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600">Cancel</button>
                    <button onClick={executeBulkAction} className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-md">Apply</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
