
import React, { useState, useRef } from 'react';
import { Category, SubCategory, ChildCategory, Brand, Tag } from '../types';
import { Plus, Search, Edit, Trash2, X, Save, Image as ImageIcon, Upload, CheckCircle, Tag as TagIcon, Layers, Folder } from 'lucide-react';

interface AdminCatalogProps {
  view: string; // 'catalog_categories', 'catalog_subcategories', etc.
  
  // Data props
  categories: Category[];
  subCategories: SubCategory[];
  childCategories: ChildCategory[];
  brands: Brand[];
  tags: Tag[];

  // Handler props
  onAddCategory: (item: Category) => void;
  onUpdateCategory: (item: Category) => void;
  onDeleteCategory: (id: string) => void;

  onAddSubCategory: (item: SubCategory) => void;
  onUpdateSubCategory: (item: SubCategory) => void;
  onDeleteSubCategory: (id: string) => void;

  onAddChildCategory: (item: ChildCategory) => void;
  onUpdateChildCategory: (item: ChildCategory) => void;
  onDeleteChildCategory: (id: string) => void;

  onAddBrand: (item: Brand) => void;
  onUpdateBrand: (item: Brand) => void;
  onDeleteBrand: (id: string) => void;

  onAddTag: (item: Tag) => void;
  onUpdateTag: (item: Tag) => void;
  onDeleteTag: (id: string) => void;
}

const AdminCatalog: React.FC<AdminCatalogProps> = ({
  view,
  categories, subCategories, childCategories, brands, tags,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddSubCategory, onUpdateSubCategory, onDeleteSubCategory,
  onAddChildCategory, onUpdateChildCategory, onDeleteChildCategory,
  onAddBrand, onUpdateBrand, onDeleteBrand,
  onAddTag, onUpdateTag, onDeleteTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  // Generic Form Data
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTitle = () => {
    switch(view) {
      case 'catalog_categories': return 'Categories';
      case 'catalog_subcategories': return 'Sub Categories';
      case 'catalog_childcategories': return 'Child Categories';
      case 'catalog_brands': return 'Brands';
      case 'catalog_tags': return 'Tags';
      default: return 'Catalog';
    }
  };

  const handleOpenModal = (item?: any) => {
    setEditItem(item || null);
    if (item) {
      setFormData({ ...item });
    } else {
      // Default empty state based on view
      const defaults: any = { name: '', status: 'Active' };
      if (view === 'catalog_categories') defaults.icon = '';
      if (view === 'catalog_subcategories') defaults.categoryId = categories[0]?.id || '';
      if (view === 'catalog_childcategories') defaults.subCategoryId = subCategories[0]?.id || '';
      if (view === 'catalog_brands') defaults.logo = '';
      setFormData(defaults);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editItem ? editItem.id : Date.now().toString();
    const newItem = { ...formData, id };

    switch(view) {
      case 'catalog_categories':
        editItem ? onUpdateCategory(newItem) : onAddCategory(newItem);
        break;
      case 'catalog_subcategories':
        editItem ? onUpdateSubCategory(newItem) : onAddSubCategory(newItem);
        break;
      case 'catalog_childcategories':
        editItem ? onUpdateChildCategory(newItem) : onAddChildCategory(newItem);
        break;
      case 'catalog_brands':
        editItem ? onUpdateBrand(newItem) : onAddBrand(newItem);
        break;
      case 'catalog_tags':
        editItem ? onUpdateTag(newItem) : onAddTag(newItem);
        break;
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if(!window.confirm('Are you sure you want to delete this item?')) return;
    
    switch(view) {
      case 'catalog_categories': onDeleteCategory(id); break;
      case 'catalog_subcategories': onDeleteSubCategory(id); break;
      case 'catalog_childcategories': onDeleteChildCategory(id); break;
      case 'catalog_brands': onDeleteBrand(id); break;
      case 'catalog_tags': onDeleteTag(id); break;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fieldName = view === 'catalog_brands' ? 'logo' : 'icon';
        setFormData({ ...formData, [fieldName]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter Data
  let displayData: any[] = [];
  switch(view) {
    case 'catalog_categories': displayData = categories; break;
    case 'catalog_subcategories': displayData = subCategories; break;
    case 'catalog_childcategories': displayData = childCategories; break;
    case 'catalog_brands': displayData = brands; break;
    case 'catalog_tags': displayData = tags; break;
  }
  
  displayData = displayData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
           <p className="text-sm text-gray-500">Manage your product catalog structure</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-lg shadow-purple-200"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="relative w-full max-w-sm">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <div className="text-sm text-gray-500">
               Total: <span className="font-bold text-gray-800">{displayData.length}</span>
            </div>
         </div>

         {/* Data Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
                  <tr>
                     <th className="px-6 py-4">Serial</th>
                     {(view === 'catalog_categories' || view === 'catalog_brands') && <th className="px-6 py-4">Image/Icon</th>}
                     <th className="px-6 py-4">Name</th>
                     {view === 'catalog_subcategories' && <th className="px-6 py-4">Parent Category</th>}
                     {view === 'catalog_childcategories' && <th className="px-6 py-4">Parent SubCategory</th>}
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {displayData.map((item, idx) => (
                     <tr key={item.id} className="hover:bg-gray-50 transition group">
                        <td className="px-6 py-4 text-gray-500">#{idx + 1}</td>
                        {(view === 'catalog_categories' || view === 'catalog_brands') && (
                           <td className="px-6 py-4">
                              <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                                 {(item.icon || item.logo) ? (
                                    <img src={item.icon || item.logo} className="w-full h-full object-contain" alt={item.name}/>
                                 ) : (
                                    <ImageIcon size={16} className="text-gray-400"/>
                                 )}
                              </div>
                           </td>
                        )}
                        <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                        
                        {view === 'catalog_subcategories' && (
                           <td className="px-6 py-4 text-gray-600">
                              {categories.find(c => c.id === item.categoryId)?.name || <span className="text-red-400 text-xs">Unknown</span>}
                           </td>
                        )}
                        
                        {view === 'catalog_childcategories' && (
                           <td className="px-6 py-4 text-gray-600">
                              {subCategories.find(s => s.id === item.subCategoryId)?.name || <span className="text-red-400 text-xs">Unknown</span>}
                           </td>
                        )}

                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded">
                                 <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {displayData.length === 0 && (
                     <tr><td colSpan={7} className="text-center py-12 text-gray-400">No data found</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
               <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-500"/></button>
               </div>
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                     <input 
                        type="text" 
                        required 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>

                  {view === 'catalog_subcategories' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                        <select 
                           className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                           value={formData.categoryId}
                           onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                           required
                        >
                           <option value="">Select Category</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>
                  )}

                  {view === 'catalog_childcategories' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Sub Category</label>
                        <select 
                           className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                           value={formData.subCategoryId}
                           onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})}
                           required
                        >
                           <option value="">Select Sub Category</option>
                           {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                     </div>
                  )}

                  {(view === 'catalog_categories' || view === 'catalog_brands') && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           {view === 'catalog_brands' ? 'Logo' : 'Icon'}
                        </label>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                           {(formData.icon || formData.logo) ? (
                              <img src={formData.icon || formData.logo} className="h-16 mx-auto object-contain" alt="preview" />
                           ) : (
                              <div className="text-gray-400 flex flex-col items-center">
                                 <Upload size={24} className="mb-1"/>
                                 <span className="text-xs">Click to upload</span>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                     <select 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                     >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                     <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700">Save</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminCatalog;
