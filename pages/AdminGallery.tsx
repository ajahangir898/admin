
import React, { useState, useRef, useEffect } from 'react';
import { Search, FolderOpen, Upload, CheckCircle, Smartphone, Loader2, AlertTriangle } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { GALLERY_IMAGES } from '../constants';
import { GalleryItem } from '../types';
import { db } from '../services/firebaseConfig';

const AdminGallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [images, setImages] = useState<GalleryItem[]>(GALLERY_IMAGES);
   const [isLoading, setIsLoading] = useState(true);
   const [isUploading, setIsUploading] = useState(false);
   const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      let isMounted = true;

      const loadGallery = async () => {
         try {
            setIsLoading(true);
            const snapshot = await getDocs(collection(db, 'gallery'));
            const remoteItems = snapshot.docs.map(docSnap => {
               const data = docSnap.data() as GalleryItem;
               return {
                  ...data,
                  id: typeof data.id === 'number' ? data.id : Number(docSnap.id) || Date.now()
               } as GalleryItem;
            });

            if (!isMounted) return;
            if (remoteItems.length) {
               const sorted = [...remoteItems].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
               setImages(sorted);
            } else {
               setImages(GALLERY_IMAGES);
            }
            setError(null);
         } catch (firebaseError) {
            console.warn('Failed to load gallery from Firebase; falling back to static data.', firebaseError);
            if (!isMounted) return;
            setImages(GALLERY_IMAGES);
            setError('Showing local gallery items (Firebase unavailable).');
         } finally {
            if (isMounted) setIsLoading(false);
         }
      };

      loadGallery();
      return () => { isMounted = false; };
   }, []);

   const persistGalleryItem = async (item: GalleryItem) => {
      await setDoc(doc(db, 'gallery', String(item.id)), item);
   };

  const filteredImages = images.filter(img => 
    img.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    img.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

   const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
         const newItem: GalleryItem = {
            id: Date.now(),
            title: file.name.split('.')[0],
            category: 'Uploads',
            imageUrl: reader.result as string,
            dateAdded: new Date().toISOString()
         };

         setImages(prev => [newItem, ...prev]);
         setIsUploading(true);
         try {
            await persistGalleryItem(newItem);
            setError(null);
         } catch (firebaseError) {
            console.error('Failed to sync gallery item to Firebase', firebaseError);
            setError('Upload saved locally but failed to sync with Firebase.');
         } finally {
            setIsUploading(false);
         }
      };

      reader.onerror = () => {
         console.error('File reading failed');
         setError('Could not read the selected image.');
      };

      reader.readAsDataURL(file);
   };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white z-10">
        <div className="flex items-center gap-3">
           <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
           {/* Logo or Placeholder */}
           <div className="flex items-center text-xl font-bold tracking-tighter">
                <span className="text-gray-800">GADGET</span>
                <span className="text-pink-500">SHOB</span>
           </div>
        </div>

        <div className="flex-1 max-w-lg flex gap-3 w-full">
           <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search images. Ex: iPhone" 
                className="w-full pl-10 pr-4 py-2 border border-purple-100 bg-purple-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-0 top-0 bottom-0 bg-purple-200 px-3 rounded-r-lg hover:bg-purple-300 transition flex items-center justify-center">
                 <Search size={18} className="text-purple-700" />
              </button>
           </div>
           
           <button className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-bold whitespace-nowrap">
              <FolderOpen size={18} /> Choose Folder
           </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
         {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
         )}

         {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="mb-3 animate-spin" size={36} />
              <p className="font-medium">Loading gallery from Firebase...</p>
            </div>
         ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {filteredImages.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`group relative bg-white rounded-lg overflow-hidden border shadow-sm cursor-pointer transition-all duration-200 ${
                        selectedIds.includes(item.id) 
                        ? 'border-purple-600 ring-2 ring-purple-500 ring-opacity-50' 
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                     <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        
                        {/* Overlay on Hover */}
                        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 ${selectedIds.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                           {selectedIds.includes(item.id) && (
                              <div className="bg-purple-600 text-white rounded-full p-2 shadow-lg">
                                 <CheckCircle size={24} />
                              </div>
                           )}
                        </div>
                     </div>
                     <div className="p-3">
                        <h4 className="font-bold text-gray-800 text-sm truncate" title={item.title}>{item.title}</h4>
                        <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <Smartphone size={48} className="mb-4 opacity-20" />
               <p className="font-medium">No images found</p>
            </div>
         )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-white flex justify-end items-center gap-4 z-20">
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleUpload} 
         />
         <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition uppercase tracking-wide text-sm border border-purple-200 ${
              isUploading ? 'bg-purple-100 text-purple-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
         >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {isUploading ? 'Uploading...' : 'Upload New Images'}
         </button>
         
         <div className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium text-sm min-w-[120px] text-center">
            {selectedIds.length} Selected
         </div>
      </div>

    </div>
  );
};

export default AdminGallery;
