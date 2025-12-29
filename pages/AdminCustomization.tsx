
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout, Palette, Globe, Plus, Search, Eye, Edit, X, ChevronLeft, ChevronRight, Layers, Loader2, CheckCircle2, MessageCircle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeConfig, WebsiteConfig, SocialLink, CarouselItem, FooterLink, Popup, Campaign } from '../types';
import { convertFileToWebP, convertCarouselImage, dataUrlToFile, CAROUSEL_WIDTH, CAROUSEL_HEIGHT, CAROUSEL_MOBILE_WIDTH, CAROUSEL_MOBILE_HEIGHT } from '../services/imageUtils';
import { DataService } from '../services/DataService';
import { normalizeImageUrl } from '../utils/imageUrlHelper';
import { uploadPreparedImageToServer, isBase64Image, convertBase64ToUploadedUrl } from '../services/imageUploadService';

interface Props { tenantId: string; logo: string | null; onUpdateLogo: (logo: string | null) => void; themeConfig?: ThemeConfig; onUpdateTheme?: (config: ThemeConfig) => Promise<void>; websiteConfig?: WebsiteConfig; onUpdateWebsiteConfig?: (config: WebsiteConfig) => Promise<void>; initialTab?: string; }

type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'font' | 'hover' | 'surface' | 'adminBg' | 'adminInputBg' | 'adminBorder' | 'adminFocus';
type FooterField = 'footerQuickLinks' | 'footerUsefulLinks';
type ImgType = 'logo' | 'favicon' | 'carousel' | 'carouselMobile' | 'popup' | 'headerLogo' | 'footerLogo';

const defColors: Record<ColorKey, string> = { 
  primary: '#22c55e', 
  secondary: '#ec4899', 
  tertiary: '#9333ea', 
  font: '#0f172a', 
  hover: '#f97316', 
  surface: '#e2e8f0', 
  adminBg: '#030407', 
  adminInputBg: '#0f172a', 
  adminBorder: '#ffffff', 
  adminFocus: '#f87171' 
};
const defConfig: WebsiteConfig = { 
  websiteName: '', 
  shortDescription: '', 
  whatsappNumber: '', 
  favicon: null, 
  headerLogo: null, 
  footerLogo: null, 
  addresses: [], 
  emails: [], 
  phones: [], 
  socialLinks: [], 
  footerQuickLinks: [], 
  footerUsefulLinks: [], 
  showMobileHeaderCategory: true, 
  showNewsSlider: true, 
  headerSliderText: '', 
  hideCopyright: false, 
  hideCopyrightText: false, 
  showPoweredBy: false, 
  showFlashSaleCounter: true, 
  brandingText: '', 
  carouselItems: [], 
  campaigns: [], 
  searchHints: '', 
  orderLanguage: 'English', 
  adminNoticeText: '', 
  categorySectionStyle: 'style1' 
};
const socialOpts = ['Facebook', 'Instagram', 'YouTube', 'Daraz', 'Twitter', 'LinkedIn'];
const colorGuides: { key: ColorKey; label: string; helper: string }[] = [
  { key: 'primary', label: 'Primary Accent', helper: 'Sidebar active state, admin CTAs, storefront hero buttons' },
  { key: 'secondary', label: 'Secondary Accent', helper: 'Warning chips, checkout highlights, floating badges' },
  { key: 'tertiary', label: 'Depth Accent', helper: 'Charts, outlines, subtle gradients' },
  { key: 'font', label: 'Global Font Color', helper: 'Header links, footer text, storefront typography' },
  { key: 'hover', label: 'Hover Accent', helper: 'Header & footer hover states, interactive link highlights' },
  { key: 'surface', label: 'Surface Glow', helper: 'Footer background wash, elevated cards, wishlist buttons' },
  { key: 'adminBg', label: 'Admin Background', helper: 'Admin panel main background color' },
  { key: 'adminInputBg', label: 'Admin Input Background', helper: 'Admin input fields, select boxes, text areas background' },
  { key: 'adminBorder', label: 'Admin Border Color', helper: 'Admin panel borders, dividers, outlines' },
  { key: 'adminFocus', label: 'Admin Focus Color', helper: 'Input focus states, active highlights in admin' }
];
const footerSections: { field: FooterField; title: string; helper: string }[] = [
  { field: 'footerQuickLinks', title: 'Footer Quick Links', helper: 'Shown in the Quick Links column of Footer 3' },
  { field: 'footerUsefulLinks', title: 'Footer Useful Links', helper: 'Shown in the Useful Links column of Footer 3' }
];

const AdminCustomization = ({ tenantId, logo, onUpdateLogo, themeConfig, onUpdateTheme, websiteConfig, onUpdateWebsiteConfig, initialTab = 'website_info' }: Props) => {
  const [tab, setTab] = useState(initialTab);
  const [cfg, setCfg] = useState<WebsiteConfig>(() => websiteConfig ? { ...defConfig, ...websiteConfig } : defConfig);
  const [colors, setColors] = useState({ ...defColors });
  const [drafts, setDrafts] = useState({ ...defColors });
  const [dark, setDark] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [cFilter, setCFilter] = useState<'All' | 'Publish' | 'Draft' | 'Trash'>('All');
  const [cSearch, setCSearch] = useState('');
  const [cModal, setCModal] = useState(false);
  const [cEdit, setCEdit] = useState<CarouselItem | null>(null);
  const [cForm, setCForm] = useState<Partial<CarouselItem>>({ name: '', image: '', mobileImage: '', url: '', urlType: 'Internal', serial: 1, status: 'Publish' });
  const [cSaving, setCSaving] = useState(false);
  const [pFilter, setPFilter] = useState<'All' | 'Publish' | 'Draft'>('All');
  const [pSearch, setPSearch] = useState('');
  const [pModal, setPModal] = useState(false);
  const [pEdit, setPEdit] = useState<Popup | null>(null);
  const [pForm, setPForm] = useState<Partial<Popup>>({ name: '', image: '', url: '', urlType: 'Internal', priority: 0, status: 'Draft' });
  const [caFilter, setCaFilter] = useState<'All' | 'Publish' | 'Draft'>('All');
  const [caSearch, setCaSearch] = useState('');
  const [caModal, setCaModal] = useState(false);
  const [caEdit, setCaEdit] = useState<Campaign | null>(null);
  const [caForm, setCaForm] = useState<Partial<Campaign>>({ name: '', logo: '', startDate: '', endDate: '', url: '', status: 'Publish', serial: 1 });

  const logoRef = useRef<HTMLInputElement>(null), favRef = useRef<HTMLInputElement>(null), hLogoRef = useRef<HTMLInputElement>(null), fLogoRef = useRef<HTMLInputElement>(null);
  const cFileRef = useRef<HTMLInputElement>(null), cMobRef = useRef<HTMLInputElement>(null), pFileRef = useRef<HTMLInputElement>(null), caLogoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTab(initialTab); }, [initialTab]);
  useEffect(() => { 
    if (websiteConfig) {
      setCfg(p => ({ 
        ...p, 
        ...websiteConfig, 
        footerQuickLinks: websiteConfig.footerQuickLinks || [], 
        footerUsefulLinks: websiteConfig.footerUsefulLinks || [], 
        showFlashSaleCounter: websiteConfig.showFlashSaleCounter ?? true, 
        headerLogo: websiteConfig.headerLogo ?? null, 
        footerLogo: websiteConfig.footerLogo ?? null, 
        campaigns: websiteConfig.campaigns || [], 
        carouselItems: websiteConfig.carouselItems || [], 
        categorySectionStyle: websiteConfig.categorySectionStyle || defConfig.categorySectionStyle 
      })); 
    }
  }, [websiteConfig]);
  useEffect(() => { DataService.get<Popup[]>('popups', []).then(setPopups); }, []);
  useEffect(() => { if (themeConfig) { setColors({ primary: themeConfig.primaryColor, secondary: themeConfig.secondaryColor, tertiary: themeConfig.tertiaryColor, font: themeConfig.fontColor || defColors.font, hover: themeConfig.hoverColor || defColors.hover, surface: themeConfig.surfaceColor || defColors.surface, adminBg: themeConfig.adminBgColor || defColors.adminBg, adminInputBg: themeConfig.adminInputBgColor || defColors.adminInputBg, adminBorder: themeConfig.adminBorderColor || defColors.adminBorder, adminFocus: themeConfig.adminFocusColor || defColors.adminFocus }); setDark(themeConfig.darkMode); } }, [themeConfig]);
  useEffect(() => { setDrafts(colors); }, [colors]);

  const normHex = (v: string) => { const s = v.trim().replace(/[^0-9a-fA-F]/g, ''); return s.length === 3 ? `#${s.split('').map(c => `${c}${c}`).join('').toUpperCase()}` : s.length === 6 ? `#${s.toUpperCase()}` : ''; };
  const setColor = (k: ColorKey, v: string) => { const n = normHex(v); if (n) setColors(p => ({ ...p, [k]: n })); };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, t: ImgType) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert("File too large. Max 2MB."); e.target.value = ''; return; }
    try {
      const cv = t === 'carousel' ? await convertCarouselImage(f, { quality: 0.85 }) : t === 'carouselMobile' ? await convertCarouselImage(f, { width: CAROUSEL_MOBILE_WIDTH, height: CAROUSEL_MOBILE_HEIGHT, quality: 0.85 }) : await convertFileToWebP(f, { quality: t === 'favicon' ? 0.9 : 0.82, maxDimension: t === 'favicon' ? 512 : 2000 });
      if (t === 'carousel' || t === 'carouselMobile') { const wf = dataUrlToFile(cv, `${t === 'carouselMobile' ? 'carousel-mobile' : 'carousel'}-${Date.now()}.webp`); const url = await uploadPreparedImageToServer(wf, tenantId, 'carousel'); setCForm(p => t === 'carousel' ? { ...p, image: url } : { ...p, mobileImage: url }); }
      else if (t === 'logo') onUpdateLogo(cv);
      else if (t === 'favicon') setCfg(p => ({ ...p, favicon: cv }));
      else if (t === 'headerLogo') setCfg(p => ({ ...p, headerLogo: cv }));
      else if (t === 'footerLogo') setCfg(p => ({ ...p, footerLogo: cv }));
      else if (t === 'popup') setPForm(p => ({ ...p, image: cv }));
    } catch { alert('Failed to process image.'); } finally { e.target.value = ''; }
  };

  const rmImg = (t: 'logo' | 'favicon' | 'headerLogo' | 'footerLogo') => {
    if (t === 'logo') { onUpdateLogo(null); if (logoRef.current) logoRef.current.value = ''; }
    else if (t === 'favicon') { setCfg(p => ({ ...p, favicon: null })); if (favRef.current) favRef.current.value = ''; }
    else if (t === 'headerLogo') { setCfg(p => ({ ...p, headerLogo: null })); if (hLogoRef.current) hLogoRef.current.value = ''; }
    else { setCfg(p => ({ ...p, footerLogo: null })); if (fLogoRef.current) fLogoRef.current.value = ''; }
  };

  const addArr = (f: 'addresses' | 'emails' | 'phones') => setCfg(p => ({ ...p, [f]: [...p[f], ''] }));
  const updArr = (f: 'addresses' | 'emails' | 'phones', i: number, v: string) => { const a = [...cfg[f]]; a[i] = v; setCfg(p => ({ ...p, [f]: a })); };
  const rmArr = (f: 'addresses' | 'emails' | 'phones', i: number) => setCfg(p => ({ ...p, [f]: p[f].filter((_, x) => x !== i) }));
  const addSocial = () => setCfg(p => ({ ...p, socialLinks: [...p.socialLinks, { id: Date.now().toString(), platform: 'Facebook', url: '' }] }));
  const updSocial = (i: number, k: keyof SocialLink, v: string) => { const l = [...cfg.socialLinks]; l[i] = { ...l[i], [k]: v }; setCfg(p => ({ ...p, socialLinks: l })); };
  const rmSocial = (i: number) => setCfg(p => ({ ...p, socialLinks: p.socialLinks.filter((_, x) => x !== i) }));
  const addFooter = (f: FooterField) => setCfg(p => ({ ...p, [f]: [...((p[f] as FooterLink[]) || []), { id: Date.now().toString(), label: '', url: '' }] }));
  const updFooter = (f: FooterField, i: number, k: keyof FooterLink, v: string) => { const c = [...((cfg[f] as FooterLink[]) || [])]; c[i] = { ...c[i], [k]: v }; setCfg(p => ({ ...p, [f]: c })); };
  const rmFooter = (f: FooterField, i: number) => setCfg(p => ({ ...p, [f]: ((p[f] as FooterLink[]) || []).filter((_, x) => x !== i) }));

  const save = async () => {
    if (saving) return; setSaving(true); setSaved(false);
    try {
      if (onUpdateWebsiteConfig) await onUpdateWebsiteConfig(cfg);
      if (onUpdateTheme) await onUpdateTheme({ primaryColor: colors.primary, secondaryColor: colors.secondary, tertiaryColor: colors.tertiary, fontColor: colors.font, hoverColor: colors.hover, surfaceColor: colors.surface, darkMode: dark, adminBgColor: colors.adminBg, adminInputBgColor: colors.adminInputBg, adminBorderColor: colors.adminBorder, adminFocusColor: colors.adminFocus });
      setSaved(true); toast.success('Saved!'); setTimeout(() => setSaved(false), 2000);
    } catch { toast.error('Save failed.'); } finally { setSaving(false); }
  };

  const openC = (i?: CarouselItem) => { if (i) { setCEdit(i); setCForm({ ...i }); } else { setCEdit(null); setCForm({ name: '', image: '', mobileImage: '', url: '', urlType: 'Internal', serial: cfg.carouselItems.length + 1, status: 'Publish' }); } setCModal(true); };
  const saveC = async (e: React.FormEvent) => {
    e.preventDefault(); if (cSaving || !cForm.image) { if (!cForm.image) toast.error('Upload desktop banner.'); return; }
    setCSaving(true);
    try {
      let img = cForm.image || '', mob = cForm.mobileImage || '';
      if (isBase64Image(img)) { toast.loading('Uploading...', { id: 'cu' }); img = await convertBase64ToUploadedUrl(img, tenantId, 'carousel'); toast.dismiss('cu'); }
      if (mob && isBase64Image(mob)) { toast.loading('Uploading mobile...', { id: 'cm' }); mob = await convertBase64ToUploadedUrl(mob, tenantId, 'carousel'); toast.dismiss('cm'); }
      const item: CarouselItem = { id: cEdit?.id || Date.now().toString(), name: cForm.name || 'Untitled', image: img, mobileImage: mob, url: cForm.url || '#', urlType: (cForm.urlType as 'Internal' | 'External') || 'Internal', serial: Number(cForm.serial), status: (cForm.status as 'Publish' | 'Draft') || 'Publish' };
      const items = cEdit ? cfg.carouselItems.map(x => x.id === cEdit.id ? item : x) : [...cfg.carouselItems, item];
      const upd = { ...cfg, carouselItems: items }; setCfg(upd); if (onUpdateWebsiteConfig) await onUpdateWebsiteConfig(upd);
      toast.success(cEdit ? 'Updated!' : 'Added!'); setCModal(false);
    } catch { toast.error('Failed.'); } finally { setCSaving(false); }
  };
  const delC = (id: string) => { if (confirm('Delete carousel?')) setCfg(p => ({ ...p, carouselItems: p.carouselItems.filter(x => x.id !== id) })); };
  const filteredC = cfg.carouselItems.filter(i => (cFilter === 'All' || i.status === cFilter) && i.name.toLowerCase().includes(cSearch.toLowerCase()));

  const openCa = (c?: Campaign) => { if (c) { setCaEdit(c); setCaForm({ ...c }); } else { setCaEdit(null); setCaForm({ name: '', logo: '', startDate: '', endDate: '', url: '', serial: (cfg.campaigns?.length || 0) + 1, status: 'Publish' }); } setCaModal(true); };
  const saveCa = (e: React.FormEvent) => {
    e.preventDefault();
    const ca: Campaign = { id: caEdit?.id || Date.now().toString(), name: caForm.name || 'Untitled', logo: caForm.logo || '', startDate: caForm.startDate || new Date().toISOString(), endDate: caForm.endDate || new Date().toISOString(), url: caForm.url || '#', serial: Number(caForm.serial), status: caForm.status as 'Publish' | 'Draft' };
    setCfg(p => ({ ...p, campaigns: caEdit ? (p.campaigns || []).map(x => x.id === caEdit.id ? ca : x) : [...(p.campaigns || []), ca] })); setCaModal(false);
  };
  const delCa = (id: string) => { if (confirm('Delete campaign?')) setCfg(p => ({ ...p, campaigns: (p.campaigns || []).filter(x => x.id !== id) })); };
  const uploadCaLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { const cv = await convertFileToWebP(f, { quality: 0.85, maxDimension: 400 }); const wf = dataUrlToFile(cv, `campaign-${Date.now()}.webp`); const url = await uploadPreparedImageToServer(wf, tenantId, 'carousel'); setCaForm(p => ({ ...p, logo: url })); } catch { toast.error('Upload failed.'); }
    if (caLogoRef.current) caLogoRef.current.value = '';
  };
  const filteredCa = (cfg.campaigns || []).filter(c => (caFilter === 'All' || c.status === caFilter) && c.name.toLowerCase().includes(caSearch.toLowerCase()));

  const openP = (p?: Popup) => { if (p) { setPEdit(p); setPForm(p); } else { setPEdit(null); setPForm({ name: '', image: '', url: '', urlType: 'Internal', priority: 0, status: 'Draft' }); } setPModal(true); };
  const saveP = async (e: React.FormEvent) => {
    e.preventDefault(); if (!pForm.name || !pForm.image) { alert('Fill required fields'); return; }
    const upd = pEdit ? popups.map(x => x.id === pEdit.id ? { ...pForm, id: pEdit.id, updatedAt: new Date().toISOString() } as Popup : x) : [...popups, { ...pForm, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Popup];
    await DataService.save('popups', upd); setPopups(upd); setPModal(false);
  };
  const delP = async (id: number) => { if (confirm('Delete popup?')) { const upd = popups.filter(x => x.id !== id); await DataService.save('popups', upd); setPopups(upd); } };
  const togP = async (p: Popup) => { const upd = popups.map(x => x.id === p.id ? { ...x, status: x.status === 'Draft' ? 'Publish' : 'Draft', updatedAt: new Date().toISOString() } : x); await DataService.save('popups', upd); setPopups(upd); };
  const filteredP = popups.filter(p => (pFilter === 'All' || p.status === pFilter) && p.name.toLowerCase().includes(pSearch.toLowerCase()));

  const Tab = ({ id, label, icon }: { id: string; label: string; icon?: React.ReactNode }) => <button onClick={() => setTab(id)} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${tab === id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{icon} {label}</button>;
  const Inp = ({ v, set, ph = '', cls = '' }: { v: string; set: (v: string) => void; ph?: string; cls?: string }) => <input type="text" value={v} onChange={e => set(e.target.value)} placeholder={ph} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${cls}`} />;
  const Btn = ({ children, cls = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { cls?: string }) => <button className={`px-4 py-2 rounded-lg text-sm font-bold ${cls}`} {...p}>{children}</button>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center bg-gray-50 z-30 pt-4 pb-2">
        <div><h2 className="text-2xl font-bold text-gray-800">Customization</h2><p className="text-sm text-gray-500">Manage appearance and content</p></div>
        <button onClick={save} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg min-w-[160px] justify-center ${saved ? 'bg-emerald-500 text-white' : saving ? 'bg-green-500 text-white cursor-wait' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {saved ? <><CheckCircle2 size={18} className="animate-bounce"/>Saved!</> : saving ? <><Loader2 size={18} className="animate-spin"/>Saving...</> : <><Save size={18}/>Save Changes</>}
        </button>
      </div>
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide bg-white rounded-t-xl">
        <Tab id="carousel" label="Carousel" icon={<ImageIcon size={18}/>}/><Tab id="campaigns" label="Campaigns" icon={<CalendarDays size={18}/>}/><Tab id="popup" label="Popup" icon={<Layers size={18}/>}/><Tab id="website_info" label="Website Information" icon={<Globe size={18}/>}/><Tab id="chat_settings" label="Chat Settings" icon={<MessageCircle size={18}/>}/><Tab id="theme_view" label="Theme View" icon={<Layout size={18}/>}/><Tab id="theme_colors" label="Theme Colors" icon={<Palette size={18}/>}/>
      </div>
      <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 shadow-sm p-6 min-h-[500px]">
        {tab === 'carousel' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">{['All', 'Publish', 'Draft', 'Trash'].map(s => <button key={s} onClick={() => setCFilter(s as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${cFilter === s ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{s === 'All' ? 'All Data' : s}{s === 'All' && <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">{cfg.carouselItems.length}</span>}</button>)}</div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64"><input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={cSearch} onChange={e => setCSearch(e.target.value)}/><Search className="absolute left-3 top-2.5 text-gray-400" size={16}/></div>
                <Btn onClick={() => openC()} cls="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"><Plus size={16}/>Add Carousel</Btn>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-green-50 text-gray-700 font-semibold text-xs uppercase border-b"><tr><th className="px-4 py-3 w-10"><input type="checkbox" className="rounded"/></th><th className="px-4 py-3">Image</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Url</th><th className="px-4 py-3">Url Type</th><th className="px-4 py-3">Serial</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredC.map(i => <tr key={i.id} className="hover:bg-gray-50 group"><td className="px-4 py-3"><input type="checkbox" className="rounded"/></td><td className="px-4 py-3"><div className="w-16 h-10 bg-gray-100 rounded border overflow-hidden">{i.image ? <img src={normalizeImageUrl(i.image)} alt={i.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16}/></div>}</div></td><td className="px-4 py-3 font-medium text-gray-800">{i.name}</td><td className="px-4 py-3 text-gray-500 max-w-xs truncate">{i.url}</td><td className="px-4 py-3 text-gray-500">{i.urlType}</td><td className="px-4 py-3 font-mono">{i.serial}</td><td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${i.status === 'Publish' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{i.status}</span></td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => openC(i)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button><button onClick={() => delC(i.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button></div></td></tr>)}
                  {filteredC.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400"><ImageIcon size={32} className="mx-auto mb-2 opacity-50"/>No carousel items found.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center gap-2"><span className="text-sm text-gray-600">1 of 1</span><div className="flex border rounded-lg overflow-hidden"><button disabled className="px-2 py-1 bg-gray-50 text-gray-400 border-r"><ChevronLeft size={16}/></button><button disabled className="px-2 py-1 bg-gray-50 text-gray-400"><ChevronRight size={16}/></button></div></div>
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">{['All', 'Publish', 'Draft'].map(s => <button key={s} onClick={() => setCaFilter(s as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${caFilter === s ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{s === 'All' ? 'All Campaigns' : s}{s === 'All' && <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">{(cfg.campaigns || []).length}</span>}</button>)}</div>
              <div className="flex items-center gap-3">
                <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" value={caSearch} onChange={e => setCaSearch(e.target.value)} placeholder="Search campaigns..." className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-500"/></div>
                <Btn onClick={() => openCa()} cls="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"><Plus size={18}/>Add Campaign</Btn>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCa.map(c => <div key={c.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg group"><div className="p-4"><div className="flex items-center gap-3 mb-3">{c.logo ? <img src={normalizeImageUrl(c.logo)} alt={c.name} className="w-16 h-10 object-contain rounded"/> : <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center"><CalendarDays className="text-gray-400" size={20}/></div>}<div className="flex-1 min-w-0"><h4 className="font-bold text-gray-800 truncate">{c.name}</h4><span className={`inline-block px-2 py-0.5 text-xs rounded-full ${c.status === 'Publish' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></div></div><div className="text-sm text-gray-600 space-y-1"><p>Starts: {new Date(c.startDate).toLocaleDateString()}</p><p>Ends: {new Date(c.endDate).toLocaleDateString()}</p></div></div><div className="flex border-t divide-x"><button onClick={() => openCa(c)} className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium flex items-center justify-center gap-1"><Edit size={16}/>Edit</button><button onClick={() => delCa(c.id)} className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center justify-center gap-1"><Trash2 size={16}/>Delete</button></div></div>)}
              {filteredCa.length === 0 && <div className="col-span-full text-center py-12 text-gray-500"><CalendarDays size={48} className="mx-auto mb-3 opacity-30"/><p>No campaigns found.</p></div>}
            </div>
          </div>
        )}
        {caModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCaModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b sticky top-0 bg-white z-10"><h3 className="text-xl font-bold">{caEdit ? 'Edit Campaign' : 'Add New Campaign'}</h3></div>
              <form onSubmit={saveCa} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label><input type="text" value={caForm.name || ''} onChange={e => setCaForm(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" required/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Campaign Logo</label><div className="flex items-center gap-4">{caForm.logo ? <img src={normalizeImageUrl(caForm.logo)} alt="Logo" className="w-20 h-12 object-contain border rounded"/> : <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="text-gray-400" size={24}/></div>}<input type="file" ref={caLogoRef} accept="image/*" onChange={uploadCaLogo} className="hidden"/><button type="button" onClick={() => caLogoRef.current?.click()} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Upload Logo</button>{caForm.logo && <button type="button" onClick={() => setCaForm(p => ({ ...p, logo: '' }))} className="text-red-500 hover:text-red-700"><X size={20}/></button>}</div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="datetime-local" value={caForm.startDate?.slice(0, 16) || ''} onChange={e => setCaForm(p => ({ ...p, startDate: new Date(e.target.value).toISOString() }))} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" required/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label><input type="datetime-local" value={caForm.endDate?.slice(0, 16) || ''} onChange={e => setCaForm(p => ({ ...p, endDate: new Date(e.target.value).toISOString() }))} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" required/></div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label><input type="text" value={caForm.url || ''} onChange={e => setCaForm(p => ({ ...p, url: e.target.value }))} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" placeholder="https://..."/></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Order</label><input type="number" value={caForm.serial || 1} onChange={e => setCaForm(p => ({ ...p, serial: parseInt(e.target.value) }))} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" min={1}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={caForm.status || 'Publish'} onChange={e => setCaForm(p => ({ ...p, status: e.target.value as 'Publish' | 'Draft' }))} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"><option value="Publish">Publish</option><option value="Draft">Draft</option></select></div></div>
                <div className="flex gap-3 pt-4"><button type="button" onClick={() => setCaModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">{caEdit ? 'Update' : 'Create'} Campaign</button></div>
              </form>
            </div>
          </div>
        )}
        {tab === 'popup' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">{['All', 'Publish', 'Draft'].map(s => <button key={s} onClick={() => setPFilter(s as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${pFilter === s ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{s === 'All' ? 'All Data' : s}{s === 'All' && <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">{popups.length}</span>}</button>)}</div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64"><input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={pSearch} onChange={e => setPSearch(e.target.value)}/><Search className="absolute left-3 top-2.5 text-gray-400" size={16}/></div>
                <Btn onClick={() => openP()} cls="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"><Plus size={16}/>Add Popup</Btn>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">URL</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th><th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredP.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No popups found</td></tr> : filteredP.map(p => <tr key={p.id} className="hover:bg-gray-50"><td className="px-4 py-3"><img src={p.image} alt={p.name} className="h-12 w-16 object-cover rounded border"/></td><td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td><td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{p.url || '-'}</td><td className="px-4 py-3 text-sm text-gray-800">{p.priority || 0}</td><td className="px-4 py-3"><button onClick={() => togP(p)} className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'Publish' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{p.status}</button></td><td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openP(p)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit size={16}/></button><button onClick={() => delP(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={16}/></button></div></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'website_info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[{ r: logoRef, l: logo, t: 'logo' as const, n: 'Primary Store Logo (Fallback)' }, { r: hLogoRef, l: cfg.headerLogo, t: 'headerLogo' as const, n: 'Header Logo Override' }, { r: fLogoRef, l: cfg.footerLogo, t: 'footerLogo' as const, n: 'Footer Logo Override' }].map(x => (
                <div key={x.n} className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <div className="flex flex-col items-center gap-3"><ImageIcon size={32} className="text-gray-400"/><p className="text-sm font-bold text-gray-700">{x.n}</p>{x.l ? <img src={normalizeImageUrl(x.l)} alt="" className="h-12 max-w-[200px] object-contain my-2 border rounded p-1 bg-gray-50"/> : <p className="text-xs text-gray-400">No logo uploaded</p>}<div className="flex gap-2"><button onClick={() => x.r.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>{x.l && <button onClick={() => rmImg(x.t)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}</div><input type="file" ref={x.r} onChange={e => upload(e, x.t)} className="hidden" accept="image/*"/></div>
                </div>
              ))}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center"><div className="flex flex-col items-center gap-3"><Globe size={32} className="text-gray-400"/><p className="text-sm font-bold text-gray-700">Favicon (32x32px)</p>{cfg.favicon && <img src={cfg.favicon} alt="Favicon" className="w-8 h-8 object-contain my-2"/>}<div className="flex gap-2"><button onClick={() => favRef.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>{cfg.favicon && <button onClick={() => rmImg('favicon')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}</div><input type="file" ref={favRef} onChange={e => upload(e, 'favicon')} className="hidden" accept="image/*"/></div></div>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Website Name*</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={cfg.websiteName} onChange={e => setCfg({ ...cfg, websiteName: e.target.value })}/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={cfg.shortDescription} onChange={e => setCfg({ ...cfg, shortDescription: e.target.value })}/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Number</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={cfg.whatsappNumber} onChange={e => setCfg({ ...cfg, whatsappNumber: e.target.value })}/></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Admin Notice Text</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" placeholder="e.g., Easy return policy..." value={cfg.adminNoticeText || ''} onChange={e => setCfg({ ...cfg, adminNoticeText: e.target.value })}/><p className="text-xs text-gray-500 mt-1">Scrolling ticker at top of store header.</p></div>
              </div>
            </div>
            <div className="space-y-6">
              {(['addresses', 'emails', 'phones'] as const).map(f => <div key={f} className="space-y-2"><Btn onClick={() => addArr(f)} cls="bg-green-600 text-white w-full flex items-center justify-center gap-2"><Plus size={16}/>Add New {f.slice(0, -1)}</Btn>{cfg[f].map((v, i) => <div key={i} className="flex gap-2"><input type="text" value={v} onChange={e => updArr(f, i, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm"/><button onClick={() => rmArr(f, i)} className="bg-red-500 text-white p-2 rounded-lg"><Trash2 size={16}/></button></div>)}</div>)}
              <div className="space-y-2"><Btn onClick={addSocial} cls="bg-green-600 text-white w-full flex items-center justify-center gap-2"><Plus size={16}/>Add Social Link</Btn>{cfg.socialLinks.map((l, i) => <div key={l.id} className="bg-gray-50 border p-3 rounded-lg space-y-2 relative"><div className="flex gap-2"><select value={l.platform} onChange={e => updSocial(i, 'platform', e.target.value)} className="w-1/3 text-sm border rounded px-2 py-1">{socialOpts.map(o => <option key={o} value={o}>{o}</option>)}</select><input type="text" value={l.url} onChange={e => updSocial(i, 'url', e.target.value)} className="flex-1 text-sm border rounded px-2 py-1" placeholder="URL"/></div><button onClick={() => rmSocial(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow"><Trash2 size={12}/></button></div>)}</div>
              <div className="space-y-4">{footerSections.map(s => <div key={s.field} className="border rounded-xl p-4 space-y-3 bg-white/60"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p className="text-sm font-semibold text-gray-800">{s.title}</p><p className="text-xs text-gray-500">{s.helper}</p></div><button onClick={() => addFooter(s.field)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold flex items-center gap-1 self-start"><Plus size={14}/>Add Link</button></div>{((cfg[s.field] as FooterLink[]) || []).length === 0 && <p className="text-xs text-gray-400">No links yet.</p>}{((cfg[s.field] as FooterLink[]) || []).map((l, i) => <div key={l.id} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-2"><input type="text" value={l.label} onChange={e => updFooter(s.field, i, 'label', e.target.value)} className="px-3 py-2 border rounded-lg text-sm" placeholder="Label"/><input type="text" value={l.url} onChange={e => updFooter(s.field, i, 'url', e.target.value)} className="px-3 py-2 border rounded-lg text-sm" placeholder="https://"/><button onClick={() => rmFooter(s.field, i)} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold">Remove</button></div>)}</div>)}</div>
              <div className="space-y-3 pt-4 border-t">
                {[{ k: 'showMobileHeaderCategory', l: 'isShowMobileHeaderCategoryMenu' }, { k: 'showNewsSlider', l: 'Is Show News Slider' }, { k: 'hideCopyright', l: 'Hide Copyright Section' }, { k: 'hideCopyrightText', l: 'Hide Copyright Text' }, { k: 'showPoweredBy', l: 'Powered by SystemNext IT' }].map(x => <label key={x.k} className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 text-green-600 rounded" checked={cfg[x.k as keyof WebsiteConfig] as boolean} onChange={e => setCfg({ ...cfg, [x.k]: e.target.checked })}/><span className="text-sm font-medium">{x.l}</span></label>)}
                {cfg.showNewsSlider && <div className="ml-8 border rounded p-2 text-sm bg-gray-50"><p className="text-xs text-gray-500 mb-1">Header Slider Text</p><textarea className="w-full bg-transparent outline-none resize-none" rows={2} value={cfg.headerSliderText} onChange={e => setCfg({ ...cfg, headerSliderText: e.target.value })}/></div>}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3"><div><p className="text-sm font-semibold text-gray-800">Flash Sale Counter</p><p className="text-xs text-gray-500">Show countdown pill beside Flash Sales.</p></div><button type="button" onClick={() => setCfg(p => ({ ...p, showFlashSaleCounter: !p.showFlashSaleCounter }))} className={`relative inline-flex items-center rounded-full border px-1 py-0.5 text-xs font-bold ${cfg.showFlashSaleCounter ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}><span className={`px-3 py-1 rounded-full ${cfg.showFlashSaleCounter ? 'bg-white shadow' : 'opacity-50'}`}>{cfg.showFlashSaleCounter ? 'On' : 'Off'}</span></button></div>
                <div className="pt-2"><label className="block text-xs text-gray-500 mb-1">Branding Text</label><input type="text" className="w-full px-3 py-2 border rounded text-sm" value={cfg.brandingText} onChange={e => setCfg({ ...cfg, brandingText: e.target.value })}/></div>
              </div>
            </div>
          </div>
        )}
        {tab === 'chat_settings' && (
          <div className="space-y-6 max-w-2xl">
            <div><h3 className="font-bold text-xl mb-2">Chat Settings</h3><p className="text-gray-500 text-sm mb-6">Configure live chat for your store</p></div>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50"><div><p className="font-semibold text-gray-800">Enable Live Chat</p><p className="text-sm text-gray-500">Allow customers to chat with you</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={cfg.chatEnabled ?? false} onChange={e => setCfg({ ...cfg, chatEnabled: e.target.checked })} className="sr-only peer"/><div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" placeholder="Hi! How can we help?" value={cfg.chatGreeting || ''} onChange={e => setCfg({ ...cfg, chatGreeting: e.target.value })}/><p className="text-xs text-gray-500 mt-1">Appears when chat opens</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Offline Message</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" placeholder="We're offline. Leave a message!" value={cfg.chatOfflineMessage || ''} onChange={e => setCfg({ ...cfg, chatOfflineMessage: e.target.value })}/></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Support Hours From</label><input type="time" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={cfg.chatSupportHours?.from || '09:00'} onChange={e => setCfg({ ...cfg, chatSupportHours: { ...(cfg.chatSupportHours || {}), from: e.target.value } })}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Support Hours To</label><input type="time" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-green-500" value={cfg.chatSupportHours?.to || '18:00'} onChange={e => setCfg({ ...cfg, chatSupportHours: { ...(cfg.chatSupportHours || {}), to: e.target.value } })}/></div></div>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50"><div><p className="font-semibold text-gray-800">WhatsApp Fallback</p><p className="text-sm text-gray-500">Redirect to WhatsApp when chat disabled</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={cfg.chatWhatsAppFallback ?? false} onChange={e => setCfg({ ...cfg, chatWhatsAppFallback: e.target.checked })} className="sr-only peer"/><div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label></div>
          </div>
        )}
        {tab === 'theme_view' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[{ title: 'Header Section', key: 'headerStyle', count: 5 }, { title: 'Showcase Section', key: 'showcaseSectionStyle', count: 5 }, { title: 'Brand Section', key: 'brandSectionStyle', count: 5, hasNone: true }, { title: 'Category Section', key: 'categorySectionStyle', count: 5, hasNone: true, hasMobile: true }, { title: 'Product Section', key: 'productSectionStyle', count: 5 }, { title: 'Product Card', key: 'productCardStyle', count: 5 }, { title: 'Footer Section', key: 'footerStyle', count: 5 }, { title: 'Bottom Nav', key: 'bottomNavStyle', count: 5 }].map(s => (
              <div key={s.title} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">{s.title}</h3>
                <div className="space-y-2">
                  {s.hasNone && (
                    <div className={`border rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white transition-colors cursor-pointer ${!cfg[s.key as keyof WebsiteConfig] ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-300 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name={s.title} className="w-5 h-5 text-green-600 cursor-pointer" checked={!cfg[s.key as keyof WebsiteConfig]} onChange={() => setCfg({ ...cfg, [s.key]: '' })}/>
                        <span className="font-semibold text-gray-700">None</span>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 hover:bg-green-700 transition-colors">
                        <Eye size={14}/>View Site
                      </button>
                    </div>
                  )}
                  {Array.from({ length: s.count }).map((_, i) => { 
                    const v = `style${i + 1}`;
                    const cur = cfg[s.key as keyof WebsiteConfig] || 'style1';
                    return (
                      <div key={i} className={`border rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white transition-colors cursor-pointer ${cur === v ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-300 bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name={s.title} className="w-5 h-5 text-green-600 cursor-pointer" checked={cur === v} onChange={() => setCfg({ ...cfg, [s.key]: v })}/>
                          <span className="font-semibold text-gray-700">{s.title.split(' ')[0]} {i + 1}</span>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 hover:bg-green-700 transition-colors">
                          <Eye size={14}/>View demo
                        </button>
                      </div>
                    );
                  })}
                  {s.hasMobile && (
                    <div className={`border rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white transition-colors cursor-pointer ${(cfg[s.key as keyof WebsiteConfig] || 'style1') === 'mobile1' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-300 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name={s.title} className="w-5 h-5 text-green-600 cursor-pointer" checked={(cfg[s.key as keyof WebsiteConfig] || 'style1') === 'mobile1'} onChange={() => setCfg({ ...cfg, [s.key]: 'mobile1' })}/>
                        <span className="font-semibold text-gray-700">Mobile Style 1 (AI-Powered)</span>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 hover:bg-green-700 transition-colors">
                        <Eye size={14}/>View demo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'theme_colors' && (
          <div className="space-y-8 max-w-1xl">
            <div><h3 className="font-bold text-xl mb-4">Theme Colors</h3><p className="text-gray-500 text-sm mb-6">Dial in your storefront + admin palette.</p><div className="space-y-4">{colorGuides.map(f => <div key={f.key} className="flex items-center gap-4 p-4 border rounded-2xl bg-black shadow-sm"><div className="flex flex-col items-center gap-2"><input type="color" value={colors[f.key]} onChange={e => setColor(f.key, e.target.value)} className="w-14 h-14 rounded-full border border-white shadow cursor-pointer"/><span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Pick</span></div><div className="flex-1"><p className="text-sm font-semibold text-gray-800">{f.label}</p><p className="text-xs text-gray-500 mb-2">{f.helper}</p><input type="text" value={drafts[f.key]} onChange={e => setDrafts(p => ({ ...p, [f.key]: e.target.value }))} onBlur={() => setColor(f.key, drafts[f.key])} className="w-full px-3 py-2 border rounded-lg font-mono uppercase focus:ring-1 focus:ring-green-500"/></div></div>)}</div></div>
            <div><h3 className="font-bold text-xl mb-4">Search Hints</h3><input type="text" value={cfg.searchHints || ''} onChange={e => setCfg({ ...cfg, searchHints: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-green-500" placeholder="gadget, gift, toy..."/></div>
            <div><h3 className="font-bold text-xl mb-4">Order Language</h3><div className="space-y-3">{['English', 'Bangla'].map(l => <label key={l} className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50"><input type="radio" name="lang" className="w-5 h-5 text-green-600" checked={cfg.orderLanguage === l} onChange={() => setCfg({ ...cfg, orderLanguage: l })}/><span className="font-bold">{l}</span></label>)}</div></div>
          </div>
        )}
      </div>

      {cModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0"><h3 className="font-bold text-gray-800">{cEdit ? 'Edit Carousel' : 'Add New Carousel'}</h3><button onClick={() => setCModal(false)}><X size={20} className="text-gray-500"/></button></div>
            <form onSubmit={saveC} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Desktop Banner*</label><p className="text-xs text-gray-500 mb-2">{CAROUSEL_WIDTH}×{CAROUSEL_HEIGHT}px (4:1). Auto WebP.</p><input type="file" ref={cFileRef} onChange={e => upload(e, 'carousel')} className="hidden" accept="image/*"/><div onClick={() => cFileRef.current?.click()} className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-gray-50 h-28">{cForm.image ? <img src={normalizeImageUrl(cForm.image)} alt="" className="w-full h-full object-cover rounded"/> : <div className="text-gray-400 flex flex-col items-center justify-center h-full"><Upload size={32} className="mb-2"/><p className="text-sm">Click to upload</p></div>}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile Banner</label><p className="text-xs text-gray-500 mb-2">{CAROUSEL_MOBILE_WIDTH}×{CAROUSEL_MOBILE_HEIGHT}px (16:9).</p><input type="file" ref={cMobRef} onChange={e => upload(e, 'carouselMobile')} className="hidden" accept="image/*"/><div onClick={() => cMobRef.current?.click()} className="border-2 border-dashed border-blue-300 rounded-lg p-2 text-center cursor-pointer hover:bg-blue-50 h-28">{cForm.mobileImage ? <div className="relative w-full h-full"><img src={normalizeImageUrl(cForm.mobileImage)} alt="" className="w-full h-full object-cover rounded"/><button type="button" onClick={e => { e.stopPropagation(); setCForm(p => ({ ...p, mobileImage: '' })); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={14}/></button></div> : <div className="text-blue-400 flex flex-col items-center justify-center h-full"><Upload size={32} className="mb-2"/><p className="text-sm">Click to upload</p></div>}</div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={cForm.name} onChange={e => setCForm({ ...cForm, name: e.target.value })} required/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Serial</label><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={cForm.serial} onChange={e => setCForm({ ...cForm, serial: Number(e.target.value) })} required/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Url</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={cForm.url} onChange={e => setCForm({ ...cForm, url: e.target.value })}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Url Type</label><select className="w-full px-3 py-2 border rounded-lg text-sm" value={cForm.urlType} onChange={e => setCForm({ ...cForm, urlType: e.target.value as any })}><option value="Internal">Internal</option><option value="External">External</option></select></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select className="w-full px-3 py-2 border rounded-lg text-sm" value={cForm.status} onChange={e => setCForm({ ...cForm, status: e.target.value as any })}><option value="Publish">Publish</option><option value="Draft">Draft</option></select></div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setCModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button><button type="submit" disabled={cSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-60 flex items-center gap-2">{cSaving ? <><Loader2 size={16} className="animate-spin"/>Saving...</> : 'Save Carousel'}</button></div>
            </form>
          </div>
        </div>
      )}
      {pModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-800">{pEdit ? 'Edit Popup' : 'Add New Popup'}</h3><button onClick={() => setPModal(false)}><X size={20} className="text-gray-500"/></button></div>
            <form onSubmit={saveP} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Upload Image*</label><input type="file" ref={pFileRef} onChange={e => upload(e, 'popup')} className="hidden" accept="image/*"/><div onClick={() => pFileRef.current?.click()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">{pForm.image ? <img src={normalizeImageUrl(pForm.image)} alt="" className="h-32 mx-auto object-contain"/> : <div className="text-gray-400"><Upload size={32} className="mx-auto mb-2"/><p className="text-sm">Click to upload</p></div>}</div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Name*</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })} required/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={pForm.priority} onChange={e => setPForm({ ...pForm, priority: Number(e.target.value) })}/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">URL</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={pForm.url} onChange={e => setPForm({ ...pForm, url: e.target.value })}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">URL Type</label><select className="w-full px-3 py-2 border rounded-lg text-sm" value={pForm.urlType} onChange={e => setPForm({ ...pForm, urlType: e.target.value as any })}><option value="Internal">Internal</option><option value="External">External</option></select></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select className="w-full px-3 py-2 border rounded-lg text-sm" value={pForm.status} onChange={e => setPForm({ ...pForm, status: e.target.value as any })}><option value="Publish">Publish</option><option value="Draft">Draft</option></select></div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setPModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Save Popup</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomization;
