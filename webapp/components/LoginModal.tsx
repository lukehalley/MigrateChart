'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
  secondaryColor: string;
}

export function LoginModal({ isOpen, onClose, primaryColor, secondaryColor }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      onClose();
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4"
            style={{ zIndex: 10000 }}
          >
            <div
              className="relative bg-black border-2 rounded-lg p-8"
              style={{
                borderColor: `${primaryColor}60`,
                boxShadow: `0 0 40px ${primaryColor}30, 0 0 80px ${primaryColor}15`,
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all"
                style={{
                  color: `${primaryColor}80`,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                  e.currentTarget.style.color = primaryColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = `${primaryColor}80`;
                }}
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
                Sign In
              </h2>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label
                    className="block text-xs font-bold mb-2 tracking-wider"
                    style={{ color: `${primaryColor}80` }}
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border rounded-lg text-white placeholder-white/30 transition-all focus:outline-none"
                    style={{
                      borderColor: `${primaryColor}40`,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = `${primaryColor}80`;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${primaryColor}40`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    className="block text-xs font-bold mb-2 tracking-wider"
                    style={{ color: `${primaryColor}80` }}
                  >
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border rounded-lg text-white placeholder-white/30 transition-all focus:outline-none"
                    style={{
                      borderColor: `${primaryColor}40`,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = `${primaryColor}80`;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${primaryColor}40`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="••••••••••••"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-sm tracking-wider relative overflow-hidden disabled:opacity-50"
                  style={{
                    backgroundColor: primaryColor,
                    color: secondaryColor,
                  }}
                  whileHover={loading ? {} : { scale: 1.02, boxShadow: `0 0 30px ${primaryColor}60` }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      AUTHENTICATING...
                    </span>
                  ) : (
                    'SIGN IN'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
