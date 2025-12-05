'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { LoginModal } from './LoginModal';

interface LoginButtonProps {
  primaryColor: string;
  secondaryColor: string;
}

export function LoginButton({ primaryColor, secondaryColor }: LoginButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleClick = () => {
    if (user) {
      router.push('/admin/dashboard');
    } else {
      setShowModal(true);
    }
  };

  if (isLoading) {
    return null; // Don't show anything while checking auth
  }

  return (
    <>
      {/* Simple icon-only button */}
      <motion.button
        onClick={handleClick}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden group"
        style={{
          backgroundColor: user ? `${primaryColor}20` : `${primaryColor}10`,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: user ? `${primaryColor}60` : `${primaryColor}30`,
        }}
        whileHover={{
          borderColor: `${primaryColor}`,
          boxShadow: `0 0 20px ${primaryColor}40`,
          backgroundColor: `${primaryColor}25`,
        }}
        whileTap={{ scale: 0.95 }}
        title={user ? 'Dashboard' : 'Sign in'}
      >
        {/* Icon */}
        <motion.div
          style={{ color: primaryColor }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <User size={18} strokeWidth={2.5} />
        </motion.div>

        {/* Subtle pulse when logged in */}
        {user && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: primaryColor,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>

      <LoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </>
  );
}
