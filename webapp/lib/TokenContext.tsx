'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ProjectConfig, ProjectListItem } from './types';

interface TokenContextValue {
  currentProject: ProjectConfig | null;
  allProjects: ProjectListItem[];
  isLoading: boolean;
  error: string | null;
  switchProject: (slug: string) => void;
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

export function TokenContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentProject, setCurrentProject] = useState<ProjectConfig | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token slug from URL or default to 'zera'
  const tokenSlug = searchParams.get('token') || 'zera';

  // Fetch all projects for dropdown
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data: ProjectListItem[] = await response.json();
        setAllProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      }
    }
    fetchProjects();
  }, []);

  // Fetch current project configuration
  useEffect(() => {
    async function fetchProjectConfig() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${tokenSlug}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${tokenSlug}`);
        }
        const data: ProjectConfig = await response.json();
        setCurrentProject(data);
      } catch (err) {
        console.error('Error fetching project config:', err);
        setError(`Failed to load project: ${tokenSlug}`);
      } finally {
        setIsLoading(false);
      }
    }

    if (tokenSlug) {
      fetchProjectConfig();
    }
  }, [tokenSlug]);

  // Switch to different project
  const switchProject = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('token', slug);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <TokenContext.Provider
      value={{
        currentProject,
        allProjects,
        isLoading,
        error,
        switchProject,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenContextProvider');
  }
  return context;
}
