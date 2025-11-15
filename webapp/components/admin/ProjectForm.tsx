'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import PoolInput from './PoolInput';

interface Pool {
  tokenAddress: string;
  poolAddress: string;
  tokenSymbol: string;
  dexType: string;
  orderIndex: number;
}

interface Project {
  id?: string;
  slug: string;
  name: string;
  primary_color: string;
  logo_url: string;
  loader_svg: string;
  donation_address: string;
  is_default: boolean;
  is_active: boolean;
}

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project & { pools?: any[] };
  onSave: () => void;
}

export default function ProjectForm({ isOpen, onClose, project, onSave }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    primaryColor: '#52C97D',
    logoUrl: '',
    loaderSvg: '',
    isDefault: false,
    isActive: true,
  });

  const [pools, setPools] = useState<Pool[]>([
    { tokenAddress: '', poolAddress: '', tokenSymbol: '', dexType: '', orderIndex: 0 },
  ]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Load project data when editing
  useEffect(() => {
    if (project) {
      setFormData({
        slug: project.slug,
        name: project.name,
        primaryColor: project.primary_color,
        logoUrl: project.logo_url,
        loaderSvg: project.loader_svg,
        isDefault: project.is_default,
        isActive: project.is_active,
      });
      setLogoPreview(project.logo_url);

      // Load pools if available
      if (project.pools && project.pools.length > 0) {
        setPools(
          project.pools.map((p: any) => ({
            tokenAddress: p.tokenAddress || p.token_address || '',
            poolAddress: p.poolAddress || p.pool_address || '',
            tokenSymbol: p.tokenSymbol || p.token_symbol || '',
            dexType: p.dexType || p.dex_type || '',
            orderIndex: p.orderIndex !== undefined ? p.orderIndex : (p.order_index || 0),
          }))
        );
      }
    } else {
      // Reset form for new project
      setFormData({
        slug: '',
        name: '',
        primaryColor: '#52C97D',
        logoUrl: '',
        loaderSvg: '',
        isDefault: false,
        isActive: true,
      });
      setPools([
        { tokenAddress: '', poolAddress: '', tokenSymbol: '', dexType: '', orderIndex: 0 },
      ]);
      setLogoFile(null);
      setLogoPreview('');
    }
  }, [project]);

  // Reset scroll position when modal opens
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const rgb = hexToRgb(formData.primaryColor);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be smaller than 2MB');
        return;
      }

      setLogoFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string> => {
    if (!logoFile) {
      if (formData.logoUrl) return formData.logoUrl; // Use existing URL if editing
      throw new Error('No logo file selected');
    }

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${formData.slug}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from('project-logos')
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload logo');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Validate required fields
      if (!formData.slug || !formData.name || !formData.primaryColor) {
        throw new Error('Please fill in all required fields');
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
      }

      // Validate hex color
      if (!/^#[0-9a-fA-F]{6}$/.test(formData.primaryColor)) {
        throw new Error('Invalid hex color format');
      }

      // Validate pools
      if (pools.length === 0 || pools.length > 4) {
        throw new Error('Must have between 1 and 4 pools');
      }

      for (const pool of pools) {
        if (!pool.tokenAddress || !pool.poolAddress || !pool.tokenSymbol || !pool.dexType) {
          throw new Error('All pool fields are required');
        }
      }

      // Upload logo if new file selected
      setIsUploading(true);
      let logoUrl = formData.logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }
      setIsUploading(false);

      // Prepare data
      const projectData = {
        slug: formData.slug,
        name: formData.name,
        primaryColor: formData.primaryColor,
        logoUrl,
        loaderSvg: formData.loaderSvg || '<svg></svg>', // Default empty SVG
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        pools: pools.map((p, idx) => ({
          ...p,
          orderIndex: idx,
        })),
      };

      // API call
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects';
      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save project');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleAddPool = () => {
    if (pools.length < 4) {
      setPools([
        ...pools,
        {
          tokenAddress: '',
          poolAddress: '',
          tokenSymbol: '',
          dexType: '',
          orderIndex: pools.length,
        },
      ]);
    }
  };

  const handleRemovePool = (index: number) => {
    setPools(pools.filter((_, i) => i !== index));
  };

  const handlePoolChange = (index: number, field: string, value: string | number) => {
    const newPools = [...pools];
    newPools[index] = { ...newPools[index], [field]: value };
    setPools(newPools);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-gradient-to-b from-[#0A1F12] to-black border-[3px] w-full max-w-4xl max-h-[90vh] overflow-hidden"
              style={{
                borderColor: `rgba(${rgbString}, 0.6)`,
                boxShadow: `0 0 50px rgba(${rgbString}, 0.5)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/20 to-[#0A1F12] border-b-[3px] px-8 py-6"
                style={{ borderColor: `rgba(${rgbString}, 0.5)` }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-wide" style={{ color: formData.primaryColor }}>
                    {project ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/10 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div
                ref={modalContentRef}
                className="overflow-y-auto p-8"
                style={{ maxHeight: 'calc(90vh - 140px)' }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error message */}
                  {error && (
                    <div className="p-4 bg-red-500/20 border-2 border-red-500 rounded text-red-500 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: formData.primaryColor }}>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Project Slug *</label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                          className="w-full px-4 py-3 bg-black/60 border-2 text-white rounded focus:outline-none transition-all"
                          style={{ borderColor: '#1F6338' }}
                          onFocus={(e) => {
                            e.target.style.borderColor = formData.primaryColor;
                            e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#1F6338';
                            e.target.style.boxShadow = 'none';
                          }}
                          placeholder="e.g., zera"
                          disabled={!!project} // Can't change slug when editing
                        />
                        <p className="text-xs text-white/50 mt-1">Used in URL: /?token=slug</p>
                      </div>

                      <div>
                        <label className="block text-sm text-white/70 mb-2">Project Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-black/60 border-2 text-white rounded focus:outline-none transition-all"
                          style={{ borderColor: '#1F6338' }}
                          onFocus={(e) => {
                            e.target.style.borderColor = formData.primaryColor;
                            e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#1F6338';
                            e.target.style.boxShadow = 'none';
                          }}
                          placeholder="e.g., ZERA"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/70 mb-2">Primary Color *</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-16 h-12 bg-black/60 border-2 rounded cursor-pointer"
                            style={{ borderColor: '#1F6338' }}
                          />
                          <div
                            className="w-12 h-12 rounded-full animate-pulse"
                            style={{
                              backgroundColor: formData.primaryColor,
                              boxShadow: `0 0 20px rgba(${rgbString}, 0.6)`,
                            }}
                          />
                          <input
                            type="text"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 bg-black/60 border-2 text-white rounded focus:outline-none font-mono"
                            style={{ borderColor: '#1F6338' }}
                            placeholder="#52C97D"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: formData.primaryColor }}>
                      Logo
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* Preview */}
                      {logoPreview && (
                        <div
                          className="w-32 h-32 rounded-full overflow-hidden border-4 flex-shrink-0"
                          style={{
                            borderColor: formData.primaryColor,
                            boxShadow: `0 0 30px rgba(${rgbString}, 0.5)`,
                          }}
                        >
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Upload button */}
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 font-bold rounded transition-all"
                          style={{
                            backgroundColor: `rgba(${rgbString}, 0.2)`,
                            color: formData.primaryColor,
                            border: `2px solid rgba(${rgbString}, 0.5)`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgbString}, 0.3)`;
                            e.currentTarget.style.boxShadow = `0 0 20px rgba(${rgbString}, 0.5)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgbString}, 0.2)`;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {logoPreview ? 'Change Logo' : 'Upload Logo'}
                        </button>
                        <p className="text-xs text-white/50 mt-2">PNG, JPG or WebP (max 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* SVG Loader Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: formData.primaryColor }}>
                      Loading Animation (Optional)
                    </h3>
                    <textarea
                      value={formData.loaderSvg}
                      onChange={(e) => setFormData({ ...formData, loaderSvg: e.target.value })}
                      className="w-full h-32 px-4 py-3 bg-black/60 border-2 text-white rounded focus:outline-none transition-all font-mono text-sm"
                      style={{ borderColor: '#1F6338' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = formData.primaryColor;
                        e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#1F6338';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="<svg>...</svg>"
                    />
                  </div>

                  {/* Pools Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold" style={{ color: formData.primaryColor }}>
                        Token Pools (1-4)
                      </h3>
                      {pools.length < 4 && (
                        <button
                          type="button"
                          onClick={handleAddPool}
                          className="px-4 py-2 text-sm font-bold rounded transition-all"
                          style={{
                            backgroundColor: `rgba(${rgbString}, 0.2)`,
                            color: formData.primaryColor,
                            border: `2px solid rgba(${rgbString}, 0.5)`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgbString}, 0.3)`;
                            e.currentTarget.style.boxShadow = `0 0 20px rgba(${rgbString}, 0.5)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgbString}, 0.2)`;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          + Add Pool
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {pools.map((pool, index) => (
                        <PoolInput
                          key={index}
                          index={index}
                          pool={pool}
                          onChange={(field, value) => handlePoolChange(index, field, value)}
                          onRemove={() => handleRemovePool(index)}
                          canRemove={pools.length > 1}
                          primaryColor={formData.primaryColor}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: formData.primaryColor }}>
                      Settings
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: formData.primaryColor }}
                        />
                        <span className="text-white">Set as default project</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: formData.primaryColor }}
                        />
                        <span className="text-white">Active (visible to users)</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 font-bold rounded transition-all bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
                      disabled={isSaving || isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 font-bold rounded transition-all text-black"
                      style={{
                        backgroundColor: formData.primaryColor,
                        boxShadow: `0 0 20px rgba(${rgbString}, 0.5)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 30px rgba(${rgbString}, 0.7)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 20px rgba(${rgbString}, 0.5)`;
                      }}
                      disabled={isSaving || isUploading}
                    >
                      {isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}
