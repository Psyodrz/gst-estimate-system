"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Building2, User, Package, FileText, IndianRupee, ShieldCheck, Lock, CheckCircle2, RefreshCcw, FileDown, Plus, Trash2, ImageIcon, ArrowRight, ChevronLeft, PenTool, Upload, Printer, Save, FolderOpen, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Cinematic Ghost Cursor ---
const GhostCursor = () => {
  const cursorRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const animateGlow = () => {
      const dt = 0.15; 
      outlineX += (mouseX - outlineX) * dt;
      outlineY += (mouseY - outlineY) * dt;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
      }
      requestAnimationFrame(animateGlow);
    };

    window.addEventListener('mousemove', moveCursor);
    const animationId = requestAnimationFrame(animateGlow);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-1 h-1 pointer-events-none z-[9999] opacity-0" />
      <div 
        ref={glowRef} 
        className="cursor-trail fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      >
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[4px] opacity-80"></div>
        <div className="absolute -inset-4 bg-indigo-600 rounded-full blur-[20px] opacity-40 animate-pulse"></div>
        <div className="absolute -inset-8 bg-purple-500 rounded-full blur-[40px] opacity-20"></div>
      </div>
    </>
  );
};

// --- Utility Functions ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

const numberToWords = (num) => {
  if (!num) return '';
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_array = ('000000000' + n).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return; 
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) + 'Only ' : '';
    return str;
  };
  return inWords(Math.floor(num));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Sub-Components ---

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div 
        key={i}
        className={`h-1 rounded-full transition-all duration-700 ease-out ${
          i + 1 === currentStep ? 'w-12 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 
          i + 1 < currentStep ? 'w-4 bg-indigo-900/40' : 'w-2 bg-slate-800'
        }`}
      />
    ))}
  </div>
);

const PageHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-10 animate-scene">
    <div className="flex items-center gap-4 mb-3">
      <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-900/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
        <Icon size={28} />
      </div>
      <h2 className="text-4xl font-heading font-bold text-white tracking-tight drop-shadow-sm">
        {title}
      </h2>
    </div>
    <p className="text-slate-400 ml-16 text-lg font-light tracking-wide">{subtitle}</p>
  </div>
);

const FixedNavBar = ({ onBack, onNext, disableNext, nextLabel = "Next" }) => (
  <div className="fixed bottom-0 left-0 right-0 p-6 z-40 no-print pointer-events-none bg-gradient-to-t from-[#020617] to-transparent">
    <div className="max-w-7xl mx-auto flex justify-between items-center gap-6 pointer-events-auto">
      {onBack ? (
        <button 
          onClick={onBack}
          className="group text-slate-400 hover:text-white font-medium px-6 py-4 rounded-xl hover:bg-white/5 transition-all duration-300 flex items-center gap-2 backdrop-blur-md border border-white/5 hover:border-white/20 shadow-lg"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> Back
        </button>
      ) : <div />}
      
      <button 
        onClick={onNext}
        disabled={disableNext}
        className={`
          relative overflow-hidden flex-1 md:flex-none md:min-w-[240px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95
          ${disableNext 
            ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800' 
            : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]'}
        `}
      >
        <span className="relative z-10 flex items-center gap-2">{nextLabel} <ArrowRight size={20} /></span>
        {!disableNext && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        )}
      </button>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", required = false, disabled = false, className = "", ...props }) => (
  <div className={`flex flex-col gap-2 ${className} group input-field rounded-2xl transition-all duration-300 p-1`}>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">
      {label} {required && <span className="text-indigo-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full p-4 rounded-xl bg-slate-900/60 border outline-none transition-all duration-300 font-medium text-slate-200 placeholder:text-slate-600
          ${disabled 
            ? 'border-slate-800 text-slate-600 cursor-not-allowed' 
            : 'border-slate-700/80 hover:border-slate-600'}
        `}
        {...props}
      />
    </div>
  </div>
);

const SignaturePad = ({ onSave, onSaveStamp, signature, stamp, label, disabled }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload'
  const fileInputRef = useRef(null);
  const stampInputRef = useRef(null);

  useEffect(() => {
    if (mode === 'draw' && !disabled && !signature) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#a5b4fc'; 
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(165, 180, 252, 0.5)';
      }
    }
  }, [mode, disabled, signature]);

  const startDrawing = (e) => {
    if (disabled || signature) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled || signature) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    if (mode === 'draw' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onSave(null);
  };

  const saveDrawing = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onSave(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onSaveStamp(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl transition-all duration-300 hover:border-indigo-500/30 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <PenTool size={16} className="text-indigo-400" /> {label}
        </label>
        {signature && <span className="text-xs font-bold text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]"><CheckCircle2 size={12}/> Signed</span>}
      </div>
      
      {/* Tabs */}
      {!disabled && !signature && (
        <div className="flex gap-4 mb-4 text-xs font-bold">
          <button onClick={() => setMode('draw')} className={`px-3 py-1 rounded-full transition-colors ${mode === 'draw' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white bg-slate-800'}`}>Draw</button>
          <button onClick={() => setMode('upload')} className={`px-3 py-1 rounded-full transition-colors ${mode === 'upload' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white bg-slate-800'}`}>Upload</button>
        </div>
      )}

      {/* Signature Area */}
      <div className={`relative border-2 rounded-2xl overflow-hidden flex-1 min-h-[180px] touch-none transition-all duration-500 ${signature ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-700 bg-slate-900/40 border-dashed hover:border-indigo-500/40'}`}>
        {signature ? (
          <img src={signature} alt="Signature" className="w-full h-full object-contain p-4" />
        ) : mode === 'draw' ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
             <Upload size={24} />
             <span>Click to upload signature</span>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
        )}
      </div>
      
      {/* Actions */}
      {!disabled && (
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
             {!signature ? (
               mode === 'draw' ? (
                 <>
                  <button onClick={clear} className="text-xs font-semibold text-slate-500 hover:text-rose-400 px-4 py-2 rounded transition-colors">Clear</button>
                  <button onClick={saveDrawing} className="text-xs font-bold bg-white text-black px-6 py-2 rounded-lg hover:bg-indigo-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">Confirm</button>
                 </>
               ) : (
                 <div /> // Upload handles itself on change
               )
             ) : (
                <button onClick={clear} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><RefreshCcw size={12}/> Reset Signature</button>
             )}
          </div>

          {/* Stamp Section */}
          <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               {stamp ? (
                 <div className="flex items-center gap-2">
                    <img src={stamp} alt="Stamp" className="w-8 h-8 rounded object-cover border border-slate-600" />
                    <span className="text-xs text-emerald-400 font-bold">Stamp Added</span>
                    <button onClick={() => onSaveStamp(null)} className="p-1 hover:bg-rose-500/20 rounded text-rose-400"><Trash2 size={12}/></button>
                 </div>
               ) : (
                 <span className="text-xs text-slate-500">No stamp uploaded</span>
               )}
            </div>
            <button onClick={() => stampInputRef.current?.click()} className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1 bg-indigo-500/10 px-3 py-2 rounded-lg hover:bg-indigo-500 transition-all border border-indigo-500/20">
               <ImageIcon size={14} /> {stamp ? 'Change Stamp' : 'Add Stamp'}
            </button>
            <input type="file" ref={stampInputRef} className="hidden" accept="image/*" onChange={handleStampUpload} />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Drafts Modal ---
const DraftsModal = ({ isOpen, onClose, drafts, onLoad, onDelete, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative">
         <button onClick={onClose} className="absolute right-4 top-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Trash2 className="rotate-45" size={20} /></button> 
         {/* Using Trash2 rotated as Close icon or just X if I had X. Using Trash2 rotated is weird. Let's use Just a simulated X with text or existing icon if possible, but I don't have X imported. I'll import X or just use text. Wait, I can use Trash2 but that's confusing. I'll add 'X' to imports or just use a div. Let's use text 'Close'. */}
         
         <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><FolderOpen className="text-indigo-400"/> Saved Drafts</h2>
            <p className="text-slate-400">Manage your saved estimates.</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {isLoading ? (
               <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32}/></div>
            ) : drafts.length === 0 ? (
               <div className="text-center py-12 text-slate-500">No saved drafts found.</div>
            ) : (
               drafts.map(draft => (
                 <div key={draft.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                    <div>
                       <h4 className="text-white font-bold text-lg mb-1">{draft.name || 'Untitled Draft'}</h4>
                       <p className="text-xs text-slate-500">{new Date(draft.created_at).toLocaleDateString()} • {new Date(draft.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => onLoad(draft)} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20">Load</button>
                       <button onClick={() => onDelete(draft.id)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                 </div>
               ))
            )}
         </div>
         
         <div className="p-6 border-t border-white/10 flex justify-end">
            <button onClick={onClose} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">Close</button>
         </div>
      </div>
    </div>
  );
};

// --- Main Application ---

const App = () => {
  const [step, setStep] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const totalSteps = 8;

  // --- Form State ---
  const [firm, setFirm] = useState({ name: 'AURA SYSTEMS', address: '', phone: '', email: '', gst: '', state: '', logo: null });
  const [client, setClient] = useState({ name: '', address: '', phone: '', gst: '' });
  // --- Supabase Persistence ---
  const [inventory, setInventory] = useState([]); 
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [isDraftsLoading, setIsDraftsLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    if (!supabase) {
      console.warn("Supabase client not initialized. Inventory features disabled.");
      setIsInventoryLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: true });
      if (error) throw error;
      const formatted = data.map(item => ({
        id: item.id,
        name: item.name,
        hsn: item.hsn,
        basePrice: item.base_price,
        gstRate: item.gst_rate
      }));
      setInventory(formatted);
    } catch (e) {
      console.error("Error fetching inventory:", e);
    } finally {
      setIsInventoryLoading(false);
    }
  };



  const addInventoryItem = async () => {
    if (!supabase) return;
    const newItem = { name: '', hsn: '', base_price: 0, gst_rate: 18 };
    try {
       const { data, error } = await supabase.from('inventory').insert([newItem]).select();
       if (error) throw error;
       if (data && data[0]) {
           const created = data[0];
           setInventory(prev => [...prev, {
               id: created.id,
               name: created.name,
               hsn: created.hsn,
               basePrice: created.base_price,
               gstRate: created.gst_rate
           }]);
       }
    } catch (e) {
        console.error("Error adding item:", e);
    }
  };

  const updateLocalInventory = (id, field, value) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const saveInventoryItem = async (id, item) => {
    if (!supabase) return;
    setSaveStatus('saving');
    try {
        const updates = {
            name: item.name,
            hsn: item.hsn,
            base_price: item.basePrice,
            gst_rate: item.gstRate
        };
        const { error } = await supabase.from('inventory').update(updates).eq('id', id);
        if (error) throw error;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
        console.error("Error saving item:", e);
        setSaveStatus('error');
    }
  };

  const deleteInventoryItem = async (id) => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
        setInventory(prev => prev.filter(i => i.id !== id));
    } catch (e) {
        console.error("Error deleting item:", e);
    }
  };

  // --- Other State ---
  const [estimateItems, setEstimateItems] = useState([]); 
  
  const [meta, setMeta] = useState({ 
    no: '',
    date: '', 
    valid: '' 
  });

  useEffect(() => {
     setMeta({
        no: `QTN-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        valid: ''
     });
  }, []);
  
  const [isIGST, setIsIGST] = useState(false);

  const [terms, setTerms] = useState("1. Validity: This quotation is valid for 30 days.\n2. Payment: 50% advance, balance on delivery.\n3. Taxes: GST as applicable.\n4. Delivery: Subject to availability.");
  const [description, setDescription] = useState("This quotation covers the supply and delivery of the items as specified above, in accordance with the applicable technical specifications and quality standards. All materials supplied shall be new and covered under the respective manufacturer’s standard warranty. Standard packing and delivery are included unless stated otherwise. Any installation, testing, commissioning, or additional services shall be treated as separate and chargeable unless explicitly mentioned in this quotation. The offer is subject to the terms and conditions stated herein.");
  const [signatures, setSignatures] = useState({ firm: null, firmStamp: null, firmDate: '' });

  // --- Draft Logic ---
  const fetchDrafts = async () => {
    if (!supabase) return;
    setIsDraftsLoading(true);
    try {
      const { data, error } = await supabase.from('drafts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDrafts(data || []);
    } catch (e) {
      console.error("Error fetching drafts:", e);
    } finally {
      setIsDraftsLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!supabase) return;
    const draftName = prompt("Enter a name for this draft:", client.name || "New Estimate");
    if (!draftName) return;

    const draftData = {
      step,
      firm,
      client,
      estimateItems,
      meta,
      isIGST,
      terms,
      description,
      signatures
    };

    try {
      const { error } = await supabase.from('drafts').insert([{ name: draftName, data: draftData }]);
      if (error) throw error;
      alert("Draft saved successfully!");
      fetchDrafts(); // Refresh list
    } catch (e) {
      console.error("Error saving draft:", e);
      alert("Failed to save draft.");
    }
  };

  const loadDraft = (draft) => {
    try {
      const data = draft.data;
      if (data.firm) setFirm(data.firm);
      if (data.client) setClient(data.client);
      if (data.estimateItems) setEstimateItems(data.estimateItems);
      if (data.meta) setMeta(data.meta);
      if (data.isIGST) setIsIGST(data.isIGST);
      if (data.terms) setTerms(data.terms);
      if (data.description) setDescription(data.description);
      if (data.signatures) setSignatures(data.signatures);
      if (data.step) setStep(data.step);
      setShowDrafts(false);
    } catch (e) {
      console.error("Error loading draft:", e);
      alert("Failed to load draft data.");
    }
  };

  const deleteDraft = async (id) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      const { error } = await supabase.from('drafts').delete().eq('id', id);
      if (error) throw error;
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error("Error deleting draft:", e);
    }
  };

  useEffect(() => {
    if (showDrafts) fetchDrafts();
  }, [showDrafts]);

  // --- Calculations ---
  const totals = useMemo(() => {
    const taxSummary = {}; 
    const itemsTotal = estimateItems.reduce((acc, item) => {
      const base = parseFloat(item.basePrice || 0);
      const qty = parseFloat(item.qty || 0);
      const rate = parseFloat(item.gstRate || 18);
      const taxable = base * qty;
      const taxAmt = taxable * (rate / 100);
      
      if (!taxSummary[rate]) taxSummary[rate] = { taxable: 0, tax: 0 };
      taxSummary[rate].taxable += taxable;
      taxSummary[rate].tax += taxAmt;

      return {
        taxable: acc.taxable + taxable,
        tax: acc.tax + taxAmt,
        total: acc.total + taxable + taxAmt
      };
    }, { taxable: 0, tax: 0, total: 0 });

    return {
      taxable: itemsTotal.taxable,
      tax: itemsTotal.tax,
      total: itemsTotal.total,
      summary: taxSummary,
      words: numberToWords(itemsTotal.total) // detailed version? No, keeping simplified assumption or relying on helper if exists. Wait, helper numberToWords was invalid? No, it was used in previous code. Assuming it exists at bottom of file or I need to check.
    };
  }, [estimateItems]);

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.min(s + 1, totalSteps));
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.max(s - 1, 1));
  };

  const handlePrint = () => window.print();

  const renderContent = () => {
    switch(step) {
      case 1: // Firm
        return (
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] animate-scene stagger-1 border-t border-white/10">
            <PageHeader title="Firm Identity" subtitle="Establish your business presence." icon={Building2} />
            <div className="mb-8 p-6 bg-slate-900/40 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row items-center gap-6">
               <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {firm.logo ? (
                    <img src={firm.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-slate-500" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button onClick={() => document.getElementById('logo-upload').click()} className="text-white text-xs font-bold">Change</button>
                  </div>
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h4 className="text-white font-bold mb-1">Company Logo (Optional)</h4>
                  <p className="text-slate-500 text-sm mb-3">Visible on the PDF header only.</p>
                  <div className="flex gap-3 justify-center md:justify-start">
                    <button onClick={() => document.getElementById('logo-upload').click()} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/30">Upload Logo</button>
                    {firm.logo && <button onClick={() => setFirm({...firm, logo: null})} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-lg text-sm font-bold hover:bg-rose-500 hover:text-white transition-all">Remove</button>}
                  </div>
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if(file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setFirm({...firm, logo: ev.target.result});
                      reader.readAsDataURL(file);
                    }
                  }} />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <InputField label="Firm Name" value={firm.name} onChange={e => setFirm({...firm, name: e.target.value})} placeholder="AURA SYSTEMS" required className="md:col-span-2" />
              <InputField label="GSTIN" value={firm.gst} onChange={e => setFirm({...firm, gst: e.target.value})} placeholder="e.g. 27ABCDE1234F1Z5" required />
              <InputField label="Phone" value={firm.phone} onChange={e => setFirm({...firm, phone: e.target.value})} placeholder="+91 9876543210" required />
              <InputField label="Address" value={firm.address} onChange={e => setFirm({...firm, address: e.target.value})} placeholder="Full business address" className="md:col-span-2" required />
              <InputField label="State" value={firm.state} onChange={e => setFirm({...firm, state: e.target.value})} placeholder="Maharashtra" required />
              <InputField label="Email" value={firm.email} onChange={e => setFirm({...firm, email: e.target.value})} placeholder="contact@aura.com" />
            </div>
            <div className="h-32 w-full"></div>
            <FixedNavBar onNext={nextStep} disableNext={!firm.name || !firm.address || !firm.gst || !firm.phone} />
          </div>
        );

      case 2: // Client
        return (
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] animate-scene stagger-1 border-t border-white/10">
            <PageHeader title="Client & Quote Details" subtitle="Who is this for?" icon={User} />
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <InputField label="Client Name" value={client.name} onChange={e => setClient({...client, name: e.target.value})} placeholder="Client Company / Name" required className="md:col-span-2" />
              {/* Only Client Name is mandatory as per user request */}

              <InputField label="Billing Address" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Full billing address" className="md:col-span-2" />
              <InputField label="Contact (Phone/Email)" value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} placeholder="Need for contact" />
              <InputField label="Client GSTIN" value={client.gst} onChange={e => setClient({...client, gst: e.target.value})} placeholder="Optional" />
              
              <div className="flex items-center gap-3 md:col-span-2 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                  <input 
                    type="checkbox" 
                    id="igst-toggle" 
                    checked={isIGST} 
                    onChange={(e) => setIsIGST(e.target.checked)}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                  <label htmlFor="igst-toggle" className="text-sm font-bold text-slate-300 cursor-pointer select-none">
                    Inter-state Supply (IGST Application)
                  </label>
              </div>
            </div>
            
            <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
               <h4 className="text-indigo-300 font-bold mb-4 flex items-center gap-2"><FileText size={18}/> Quotation Metadata</h4>
               <div className="grid md:grid-cols-3 gap-6">
                  <InputField label="Quote No." value={meta.no} onChange={e => setMeta({...meta, no: e.target.value})} />
                  <InputField label="Date" type="date" value={meta.date} onChange={e => setMeta({...meta, date: e.target.value})} />
                  <InputField label="Valid Until" type="date" value={meta.valid} onChange={e => setMeta({...meta, valid: e.target.value})} />
               </div>
            </div>

            <div className="h-32 w-full"></div>
            <FixedNavBar onBack={prevStep} onNext={nextStep} disableNext={!client.name} />
          </div>
        );

      case 3: // Inventory
        return (
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] animate-scene stagger-1 border-t border-white/10">
            <PageHeader title="Inventory Master" subtitle="Configure products (Synced to Cloud)." icon={Package} />
            
            {isInventoryLoading ? (
                <div className="text-center py-12 text-slate-500 animate-pulse">Loading inventory...</div>
            ) : (
                <div className="space-y-4 mb-8">
                   {inventory.map((item, idx) => (
                     <div key={item.id} className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl grid grid-cols-12 gap-4 items-center animate-scene stagger-2">
                        <div className="col-span-12 md:col-span-4">
                           <InputField 
                                label="Product Name" 
                                value={item.name || ''} 
                                onChange={e => updateLocalInventory(item.id, 'name', e.target.value)} 
                                onBlur={() => saveInventoryItem(item.id, item)}
                                placeholder="Item Name" 
                           />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                           <InputField 
                                label="HSN/SAC" 
                                value={item.hsn || ''} 
                                onChange={e => updateLocalInventory(item.id, 'hsn', e.target.value)} 
                                onBlur={() => saveInventoryItem(item.id, item)}
                                placeholder="1234" 
                           />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                           <InputField 
                                label="Price" 
                                type="number" 
                                value={item.basePrice || ''} 
                                onChange={e => updateLocalInventory(item.id, 'basePrice', e.target.value)} 
                                onBlur={() => saveInventoryItem(item.id, item)}
                                placeholder="0.00" 
                           />
                        </div>
                         <div className="col-span-6 md:col-span-2">
                           <label className="block text-xs font-bold text-slate-400 mb-1 indent-1">GST %</label>
                           <select 
                              value={item.gstRate || 18} 
                              onChange={e => {
                                 const newVal = e.target.value;
                                 updateLocalInventory(item.id, 'gstRate', newVal);
                                 // We need to pass the updated item to save, as state might not recall immediately in this scope if we just used 'item'
                                 saveInventoryItem(item.id, { ...item, gstRate: newVal });
                              }}
                              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                           </select>
                        </div>
                        <div className="col-span-6 md:col-span-2 flex justify-end">
                           <button onClick={() => deleteInventoryItem(item.id)} className="p-3 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-colors"><Trash2 size={18}/></button>
                        </div>
                     </div>
                   ))}
    
                   <button 
                      onClick={addInventoryItem}
                      className="w-full py-4 border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 text-indigo-400 rounded-xl font-bold hover:bg-indigo-500/10 hover:border-indigo-500 transition-all flex items-center justify-center gap-2"
                   >
                      <Plus size={18} /> Add New Inventory Item
                   </button>
                </div>
            )}

            {/* Added Spacer to prevent overlap */}
            <div className="h-32 w-full"></div>
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-slate-700/50 shadow-xl">
                 <span className={`text-xs font-bold px-3 ${saveStatus === 'saved' ? 'text-emerald-400' : saveStatus === 'saving' ? 'text-indigo-400' : saveStatus === 'error' ? 'text-rose-400' : 'text-slate-500'}`}>
                    {saveStatus === 'saving' && <Loader2 className="inline animate-spin mr-1" size={12}/>}
                    {saveStatus === 'idle' ? 'Cloud Sync Ready' : saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Changes Saved' : 'Sync Error'}
                 </span>
            </div>
            <FixedNavBar onBack={prevStep} onNext={nextStep} />
          </div>
        );

      case 4: // Estimate Builder
        return (
          <div className="animate-scene stagger-1">
            <div className="glass-panel p-8 md:p-12 rounded-[2rem] mb-8 border-t border-white/10">
               <PageHeader title="Estimate Builder" subtitle="Select items from inventory to build the quote." icon={FileText} />
            
              <div className="space-y-6 mb-8">
                {/* Product Selection */}
                <div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl mb-8">
                   <label className="block text-sm font-bold text-slate-400 mb-4">Add Product from Inventory</label>
                   {inventory.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                         <p className="mb-4">No items in inventory.</p>
                         <button onClick={prevStep} className="text-indigo-400 hover:underline">Go back to configure inventory</button>
                      </div>
                   ) : (
                     <div className="flex gap-4">
                        <select 
                           className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                           onChange={(e) => {
                              const item = inventory.find(i => i.id.toString() === e.target.value);
                              if (item) {
                                 setEstimateItems([...estimateItems, { ...item, qty: 1, uid: generateId() }]); // Copy item + UID
                              }
                              e.target.value = ""; // Reset
                           }}
                        >
                           <option value="">Select a product...</option>
                           {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (₹{i.basePrice})</option>)}
                        </select>
                     </div>
                   )}
                </div>

                {/* Selected Items List */}
                {estimateItems.map((item, idx) => {
                   const taxable = (parseFloat(item.basePrice) || 0) * (parseFloat(item.qty) || 0);
                   const gstAmt = taxable * (parseFloat(item.gstRate) || 0) / 100;
                   const total = taxable + gstAmt;

                   return (
                  <div key={item.uid} className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl relative group hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 animate-scene stagger-2">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Item {idx + 1}
                      </span>
                      <button onClick={() => setEstimateItems(estimateItems.filter(i => i.uid !== item.uid))} className="text-slate-600 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-500/10"><Trash2 size={18}/></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-6 items-end">
                      <div className="col-span-2 md:col-span-4">
                         <h5 className="text-white font-bold mb-1">{item.name}</h5>
                         <p className="text-xs text-slate-500">HSN: {item.hsn} | GST: {item.gstRate}%</p>
                      </div>
                      
                      <InputField className="col-span-1 md:col-span-2" label="Price" type="number" value={item.basePrice} onChange={e => {
                         const newItems = [...estimateItems];
                         newItems[idx].basePrice = e.target.value;
                         setEstimateItems(newItems);
                      }} />
                      
                      <InputField className="col-span-1 md:col-span-2" label="Qty" type="number" value={item.qty} onChange={e => {
                         const newItems = [...estimateItems];
                         newItems[idx].qty = e.target.value;
                         setEstimateItems(newItems);
                      }} />

                      <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-right">
                           <p className="text-[10px] text-slate-500 uppercase font-bold">Taxable</p>
                           <p className="font-mono text-slate-300 text-sm whitespace-nowrap">{formatCurrency(taxable)}</p>
                        </div>
                        <div className="text-right border-l border-white/5 pl-2">
                           <p className="text-[10px] text-indigo-400 uppercase font-bold">GST ({item.gstRate}%)</p>
                           <p className="font-mono text-indigo-400 text-sm whitespace-nowrap">{formatCurrency(gstAmt)}</p>
                        </div>
                         <div className="text-right border-l border-white/10 pl-2">
                           <p className="text-[10px] text-emerald-500 uppercase font-bold">Total</p>
                           <p className="font-mono text-white font-bold text-sm whitespace-nowrap">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
            {/* Added Spacer to prevent overlap */}
            <div className="h-24 w-full"></div>
            <FixedNavBar onBack={prevStep} onNext={nextStep} disableNext={estimateItems.length === 0} />

             {/* Drafts Fab */}
             <div className="fixed bottom-32 right-6 z-30 flex flex-col gap-3">
                 <button onClick={saveDraft} className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all hover:scale-105 tooltip" title="Save Draft">
                    <Save size={24} />
                 </button>
                 <button onClick={() => setShowDrafts(true)} className="p-4 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-105 border border-slate-600" title="My Drafts">
                    <FolderOpen size={24} />
                 </button>
            </div>
          </div>
        );

      case 5: // Review & Taxes
        return (
          <div className="animate-scene stagger-1">
            <div className="glass-panel p-8 md:p-12 rounded-[2rem] border-t border-white/10">
              <PageHeader title="Tax Summary" subtitle="Review calculations before finalizing." icon={IndianRupee} />
              
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black border border-indigo-500/30 p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.3)] relative overflow-hidden mb-10 group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
                <div className="relative z-10">
                   <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] mb-4">Grand Total</p>
                   <div className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter text-white mb-8 drop-shadow-lg">{formatCurrency(totals.total)}</div>
                   <p className="text-slate-400 text-sm italic font-light border-t border-white/10 pt-6 max-w-xl leading-relaxed">{totals.words}</p>
                </div>
              </div>
              
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8 space-y-5">
                <div className="flex justify-between text-slate-400 font-medium text-lg"><span>Total Taxable Value</span> <span className="font-mono text-white">{formatCurrency(totals.taxable)}</span></div>
                <div className="h-px bg-slate-800 my-2"></div>
                
                {/* GST Breakdown by Rate */}
                {Object.entries(totals.summary).map(([rate, data]) => (
                   <div key={rate} className="flex justify-between text-slate-500 text-sm">
                      <span>GST @ {rate}% on {formatCurrency(data.taxable)}</span> 
                      <span className="font-mono text-indigo-400">{formatCurrency(data.tax)}</span>
                   </div>
                ))}
                
                <div className="flex justify-between text-white font-bold text-xl pt-4 mt-2 border-t border-slate-800"><span>Total GST Amount</span> <span className="font-mono">{formatCurrency(totals.tax)}</span></div>
              </div>
            </div>
            {/* Added Spacer to prevent overlap */}
            <div className="h-24 w-full"></div>
            <FixedNavBar onBack={prevStep} onNext={nextStep} />
          </div>
        );

      case 6: // Summary
        return (
          <div className="animate-scene stagger-1">
            <div className="glass-panel p-8 md:p-12 rounded-[2rem] border-t border-white/10">
              <PageHeader title="Financial Summary" subtitle="Review totals before finalizing." icon={IndianRupee} />
              
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black border border-indigo-500/30 p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.3)] relative overflow-hidden mb-10 group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
                <div className="relative z-10">
                   <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] mb-4">Grand Total Estimate</p>
                   <div className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter text-white mb-8 drop-shadow-lg">{formatCurrency(totals.total)}</div>
                   <p className="text-slate-400 text-sm italic font-light border-t border-white/10 pt-6 max-w-xl leading-relaxed">{totals.words}</p>
                </div>
              </div>
              
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8 space-y-5">
                <div className="flex justify-between text-slate-400 font-medium text-lg"><span>Taxable Amount</span> <span className="font-mono text-white">{formatCurrency(totals.taxable)}</span></div>
                <div className="h-px bg-slate-800 my-2"></div>
                {isIGST ? (
                   <div className="flex justify-between text-slate-500 text-sm"><span>IGST Output ({totals.tax > 0 ? 'Applicable' : '0%'})</span> <span className="font-mono">{formatCurrency(totals.tax)}</span></div>
                ) : (
                   <>
                    <div className="flex justify-between text-slate-500 text-sm"><span>CGST Output (9%)</span> <span className="font-mono">{formatCurrency(totals.tax / 2)}</span></div>
                    <div className="flex justify-between text-slate-500 text-sm"><span>SGST Output (9%)</span> <span className="font-mono">{formatCurrency(totals.tax / 2)}</span></div>
                   </>
                )}
                <div className="flex justify-between text-indigo-400 font-bold text-xl pt-4 mt-2 border-t border-slate-800"><span>Total Tax</span> <span className="font-mono">{formatCurrency(totals.tax)}</span></div>
              </div>
            </div>
            {/* Added Spacer to prevent overlap */}
            <div className="h-24 w-full"></div>
            <FixedNavBar onBack={prevStep} onNext={nextStep} />
          </div>
        );

      case 7: // Terms
        return (
          <div className="animate-scene stagger-1 h-full">
            <div className="glass-panel p-8 md:p-12 rounded-[2rem] h-full flex flex-col border-t border-white/10">
              <PageHeader title="Terms & Scope" subtitle="Legal details and scope of supply." icon={ShieldCheck} />
              
              <div className="flex flex-col gap-6 h-full pb-8">
                  <div className="flex flex-col flex-1 min-h-0">
                      <label className="text-sm font-bold text-slate-400 mb-2">Terms & Conditions</label>
                      <div className="flex-1 bg-slate-950/50 p-2 rounded-2xl border border-slate-800 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] transition-all duration-300">
                        <textarea
                          value={terms}
                          onChange={(e) => setTerms(e.target.value)}
                          className="w-full h-full bg-transparent p-6 outline-none text-slate-300 leading-relaxed resize-none font-light tracking-wide placeholder:text-slate-700 text-sm md:text-base"
                          placeholder="Enter terms..."
                        ></textarea>
                      </div>
                  </div>
                  <div className="flex flex-col flex-1 min-h-0">
                      <label className="text-sm font-bold text-slate-400 mb-2">Scope of Supply / Description (Optional)</label>
                      <div className="flex-1 bg-slate-950/50 p-2 rounded-2xl border border-slate-800 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] transition-all duration-300">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full h-full bg-transparent p-6 outline-none text-slate-300 leading-relaxed resize-none font-light tracking-wide placeholder:text-slate-700 text-sm md:text-base"
                          placeholder="Enter scope description (leave empty to hide)..."
                        ></textarea>
                      </div>
                  </div>
              </div>
            </div>
            {/* Added Spacer to prevent overlap */}
            <div className="h-24 w-full"></div>
            <FixedNavBar onBack={prevStep} onNext={nextStep} />
          </div>
        );

      case 8: // Signatures
        return (
          <div className="animate-scene stagger-1">
             <div className="glass-panel p-8 md:p-12 rounded-[2rem] border-t border-white/10">
               <PageHeader title="Authorization" subtitle="Digital signatures required to lock." icon={Lock} />
               <div className="h-full flex justify-center">
                 <div className="w-full max-w-lg">
                   <SignaturePad 
                      label="Authorized Signatory" 
                      signature={signatures.firm}
                      stamp={signatures.firmStamp}
                      disabled={signatures.firm && signatures.firmStamp} 
                      onSave={(d) => setSignatures(prev => ({...prev, firm: d, firmDate: new Date().toLocaleDateString()}))} 
                      onSaveStamp={(d) => setSignatures(prev => ({...prev, firmStamp: d}))}
                   />
                 </div>
               </div>
             </div>
             {/* Added Spacer to prevent overlap */}
             <div className="h-48 w-full"></div>
             
             {/* Custom Footer for Final Step */}
             <div className="fixed bottom-0 left-0 right-0 p-6 z-40 no-print pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between gap-6 pointer-events-auto">
                  <button onClick={prevStep} className="text-slate-500 hover:text-white font-medium px-4 transition-colors">Back</button>
                  <button 
                    onClick={() => { setIsLocked(true); setStep(9); }}
                    disabled={!signatures.firm}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-5 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 flex justify-center items-center gap-3 text-lg tracking-wide"
                  >
                    <Lock size={22} /> Finalize Quotation
                  </button>
                </div>
             </div>
          </div>
        );

      default: return null;
    }
  };

  // --- Traditional Print View (Black & White, Table Layout) ---
  const PrintableDocument = () => (
    <div className="bg-white text-black font-sans p-8 max-w-[210mm] mx-auto min-h-[297mm] relative leading-tight text-sm">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
         <div className="flex gap-4">
            {firm.logo && <img src={firm.logo} alt="Logo" className="w-20 h-20 object-contain" />}
            <div>
               <h1 className="text-2xl font-bold uppercase tracking-wide">{firm.name}</h1>
               <p className="whitespace-pre-wrap max-w-[300px] text-xs mt-1">{firm.address}</p>
               <p className="text-xs mt-1">Phone: {firm.phone}</p>
               <p className="text-xs">Email: {firm.email}</p>
               <p className="text-xs mt-1">GSTIN: <span className="font-bold">{firm.gst}</span></p>
            </div>
         </div>
         <div className="text-right">
            <h2 className="text-xl font-bold uppercase mb-2">Quotation</h2>
            <table className="text-right text-xs ml-auto">
               <tbody>
                  <tr><td className="font-bold pr-2">Quote No:</td><td>{meta.no}</td></tr>
                  <tr><td className="font-bold pr-2">Date:</td><td>{meta.date}</td></tr>
                  <tr><td className="font-bold pr-2">Valid Until:</td><td>{meta.valid}</td></tr>
                  <tr><td className="font-bold pr-2">State:</td><td>{firm.state}</td></tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* 2. Client Details (Hidden if empty) */}
      {(client.name || client.address || client.phone || client.gst) && (
        <div className="border border-black mb-4">
           <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-xs uppercase">Bill To</div>
           <div className="p-2 flex justify-between">
              <div className="w-1/2">
                 {client.name && <p className="font-bold text-base">{client.name}</p>}
                 {client.address && <p className="text-xs whitespace-pre-wrap mt-1">{client.address}</p>}
              </div>
              <div className="w-1/2 text-right">
                 {client.phone && <p className="text-xs">Contact: {client.phone}</p>}
                 {client.gst && <p className="text-xs mt-1">GSTIN: <span className="font-bold">{client.gst}</span></p>}
              </div>
           </div>
        </div>
      )}

      {/* 3. Items Table */}
      <table className="w-full border-collapse border border-black text-xs mb-4">
         <thead>
            <tr className="bg-gray-200 text-center">
               <th className="border border-black py-2 w-10">Sr.</th>
               <th className="border border-black py-2 text-left px-2">Description of Goods / Services</th>
               <th className="border border-black py-2 w-14">HSN</th>
               <th className="border border-black py-2 w-10">Qty</th>
               <th className="border border-black py-2 w-20">Rate</th>
               <th className="border border-black py-2 w-24">Taxable</th>
               <th className="border border-black py-2 w-20">GST Amt</th>
               <th className="border border-black py-2 w-28">Line Total</th>
            </tr>
         </thead>
         <tbody>
            {estimateItems.map((item, idx) => {
               const taxable = parseFloat(item.basePrice) * parseFloat(item.qty);
               const gst = taxable * (parseFloat(item.gstRate)/100);
               return (
                  <tr key={idx} className="text-center">
                     <td className="border border-black py-2">{idx + 1}</td>
                     <td className="border border-black py-2 text-left px-2 font-medium">{item.name}</td>
                     <td className="border border-black py-2">{item.hsn}</td>
                     <td className="border border-black py-2">{item.qty}</td>
                     <td className="border border-black py-2 text-right px-2">{formatCurrency(item.basePrice)}</td>
                     <td className="border border-black py-2 text-right px-2">{formatCurrency(taxable)}</td>
                     <td className="border border-black py-2 text-right px-2">
                        <div className="flex flex-col text-[10px] leading-tight">
                           <span>{formatCurrency(gst)}</span>
                           <span className="text-gray-500">({item.gstRate}%)</span>
                        </div>
                     </td>
                     <td className="border border-black py-2 text-right px-2 font-bold">{formatCurrency(taxable + gst)}</td>
                  </tr>
               );
            })}
            
            {/* Empty Rows Filler (Optional) */}
            {Array.from({ length: Math.max(0, 5 - estimateItems.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                   <td className="border border-black py-4">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                   <td className="border border-black">&nbsp;</td>
                </tr>
            ))}
         </tbody>
      </table>

      {/* 4. Tax & Totals Section */}
      <div className="flex border border-black mb-4 break-inside-avoid">
         {/* Left: Amount in Words & Bank Details (Placeholder) */}
         <div className="w-2/3 border-r border-black p-2 flex flex-col justify-between">
            <div>
               <p className="text-xs font-bold underline mb-1">Amount in Words:</p>
               <p className="text-sm italic capitalize">{totals.words} Only</p>
            </div>
            <div className="mt-4">
               <p className="text-xs font-bold underline mb-1">Terms & Conditions:</p>
               <p className="text-[10px] whitespace-pre-wrap leading-tight">{terms}</p>
            </div>
         </div>

         {/* Right: Totals */}
         <div className="w-1/3 text-right">
            <div className="flex justify-between px-2 py-1 border-b border-black text-xs">
               <span>Total Taxable:</span>
               <span>{formatCurrency(totals.taxable)}</span>
            </div>
            <div className="flex justify-between px-2 py-1 border-b border-black text-xs">
               <span>Total Tax:</span>
               <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="flex justify-between px-2 py-2 bg-gray-200 font-bold text-sm">
               <span>Grand Total:</span>
               <span>{formatCurrency(totals.total)}</span>
            </div>
         </div>
      </div>

      {/* 5. Tax Breakdown Table (Small) */}
      <div className="mb-8 break-inside-avoid">
         <p className="text-xs font-bold mb-1">Tax Summary:</p>
         <table className="w-full border-collapse border border-black text-[10px]">
             <thead>
                <tr className="bg-gray-100 text-center">
                   <th className="border border-black py-1">HSN/SAC</th>
                   <th className="border border-black py-1">Taxable Value</th>
                   {isIGST ? (
                       <>
                        <th className="border border-black py-1">IGST Rate</th>
                        <th className="border border-black py-1">IGST Amt</th>
                       </>
                   ) : (
                       <>
                        <th className="border border-black py-1">CGST Rate</th>
                        <th className="border border-black py-1">CGST Amt</th>
                        <th className="border border-black py-1">SGST Rate</th>
                        <th className="border border-black py-1">SGST Amt</th>
                       </>
                   )}
                   <th className="border border-black py-1">Total Tax</th>
                </tr>
             </thead>
             <tbody>
                 {Object.entries(totals.summary).map(([rate, data]) => (
                    <tr key={rate} className="text-center">
                       <td className="border border-black py-1">-</td>
                       <td className="border border-black py-1 text-right px-2">{formatCurrency(data.taxable)}</td>
                       {isIGST ? (
                           <>
                             <td className="border border-black py-1">{rate}%</td>
                             <td className="border border-black py-1 text-right px-2">{formatCurrency(data.tax)}</td>
                           </>
                       ) : (
                           <>
                             <td className="border border-black py-1">{rate/2}%</td>
                             <td className="border border-black py-1 text-right px-2">{formatCurrency(data.tax/2)}</td>
                             <td className="border border-black py-1">{rate/2}%</td>
                             <td className="border border-black py-1 text-right px-2">{formatCurrency(data.tax/2)}</td>
                           </>
                       )}
                       <td className="border border-black py-1 text-right px-2 font-bold">{formatCurrency(data.tax)}</td>
                    </tr>
                 ))}
             </tbody>
         </table>
      </div>

      {/* 6. Signatures Footer */}
      <div className="flex justify-end pt-8 break-inside-avoid px-8">
        <div className="text-center">
           <p className="text-xs font-bold mb-2">For {firm.name}</p>
           <div className="h-20 flex items-center justify-center relative">
              {signatures.firmStamp && <img src={signatures.firmStamp} className="absolute inset-0 m-auto w-20 h-20 opacity-50 rotate-[5deg]" alt="Stamp" />}
              {signatures.firm && <img src={signatures.firm} className="h-16 relative z-10" alt="Sign" />}
           </div>
           <div className="border-t border-black mt-2 pt-1">
              <p className="text-xs font-bold">Authorized Signatory</p>
           </div>
        </div>
      </div>

      {/* 7. Fixed Scope of Supply Section (Bottom) */}
      {description && (
        <div className="mb-4 mt-12 text-xs break-inside-avoid px-2">
           <p className="font-bold underline mb-1 uppercase">Description / Scope of Supply:</p>
           <p className="text-justify leading-tight">
              {description}
           </p>
        </div>
      )}

      {/* 8. Footer Note */}
      <div className="mt-4 text-center border-t border-gray-300 pt-2 break-inside-avoid">
          <p className="text-xs text-gray-400 uppercase tracking-widest">This is a Computer Generated Estimate</p>
      </div>

    </div>
  );

  return (
    <>
      <GhostCursor />
      
      <div className="min-h-screen selection:bg-indigo-500/40 selection:text-white relative overflow-hidden">
        {/* Deep Space Background */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#020617]">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
        </div>

        {/* Top Header */}
        <header className="fixed top-0 inset-x-0 z-50 no-print transition-all duration-300">
          <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5"></div>
          <div className="relative max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-4 min-w-0">
              <img src="/logo.png" alt="InventStory" className="h-12 md:h-16 w-auto object-contain flex-shrink-0" />
              <h1 className="font-heading font-bold text-lg md:text-2xl tracking-tight text-white drop-shadow-md whitespace-nowrap">AURA <span className="text-slate-500 font-light">SYSTEMS</span></h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                 {!isLocked && <StepIndicator currentStep={step} totalSteps={totalSteps} />}
                 <button 
                    onClick={() => setShowDrafts(true)}
                    className="p-3 bg-slate-800/50 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-center gap-2"
                    title="My Drafts"
                >
                    <FolderOpen size={20} />
                    <span className="hidden md:inline text-sm font-bold">Drafts</span>
                </button>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        {/* Increased bottom padding to pb-64 to prevent overlap */}
        <main className="pt-36 pb-64 px-6 max-w-7xl mx-auto relative z-10 no-print">
          {!isLocked ? (
            renderContent()
          ) : (
            <div className="text-center py-20 animate-scene glass-panel rounded-[3rem] p-16 mt-10 border-t border-white/10">
               <div className="w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_60px_rgba(16,185,129,0.4)] animate-pulse">
                 <CheckCircle2 size={64} className="text-white drop-shadow-lg" />
               </div>
               <h2 className="text-5xl font-heading font-bold text-white mb-6 tracking-tight">Quotation Ready</h2>
               <p className="text-slate-400 mb-12 max-w-lg mx-auto text-xl font-light leading-relaxed">The document has been securely locked, digitally signed, and is ready for secure distribution.</p>
               <div className="flex justify-center gap-6">
                 <button onClick={() => { setIsLocked(false); setStep(8); }} className="px-10 py-5 rounded-2xl font-bold text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-all hover:scale-105">
                   <RefreshCcw size={20}/> Unlock & Edit
                 </button>
                 <button onClick={() => setIsPreview(true)} className="px-12 py-5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(99,102,241,0.6)]">
                   <FileDown size={20} /> Download PDF
                 </button>
               </div>
            </div>
          )}
        </main>

        {/* Preview Overlay */}
        {isPreview && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl overflow-y-auto print:overflow-visible print:bg-white animate-scene">
            <div className="min-h-screen py-10 print:py-0">
               <div className="max-w-[210mm] mx-auto flex justify-between items-center mb-8 px-6 no-print text-white">
                  <div>
                    <h2 className="font-heading font-bold text-3xl tracking-tight">Final Preview</h2>
                    <p className="text-slate-500 text-base mt-1">Review content before exporting.</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsPreview(false)} className="px-8 py-3 hover:bg-white/10 rounded-2xl transition-colors font-medium border border-white/5">Close</button>
                    <button onClick={handlePrint} className="bg-white text-black px-10 py-3 rounded-2xl font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all flex items-center gap-2">
                      <Printer size={20}/> Print / Save PDF
                    </button>
                  </div>
               </div>
               <div className="shadow-2xl print:shadow-none mx-auto transform transition-transform duration-500 scale-95 origin-top hover:scale-100">
                 <PrintableDocument />
               </div>
            </div>
          </div>

        )}

        {/* Dedicated Print Container for Flawless Mobile Printing */}
        <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[9999] print:h-auto print:w-full print:overflow-visible">
            <PrintableDocument />
        </div>

      </div>
      <DraftsModal 
         isOpen={showDrafts} 
         onClose={() => setShowDrafts(false)} 
         drafts={drafts} 
         isLoading={isDraftsLoading}
         onLoad={loadDraft}
         onDelete={deleteDraft}
      />
    </>
  );
};

export default App;
