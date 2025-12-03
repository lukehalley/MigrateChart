'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ProjectConfig, ProjectListItem } from './types';

interface TokenContextValue {
  currentProject: ProjectConfig | null;
  allProjects: ProjectListItem[];
  isLoading: boolean;
  isSwitching: boolean;
  switchingToSlug: string | null; // Track which project we're switching to
  error: string | null;
  switchProject: (slug: string) => void;
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

export function TokenContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [currentProject, setCurrentProject] = useState<ProjectConfig | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingToSlug, setSwitchingToSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get token slug from URL path (e.g., /zera -> 'zera')
  const tokenSlug = pathname.split('/')[1] || 'zera';

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
          // Project not found, redirect to first available project
          if (allProjects.length > 0) {
            const firstProject = allProjects[0].slug;
            const params = new URLSearchParams(searchParams.toString());
            const queryString = params.toString();
            router.replace(`/${firstProject}${queryString ? `?${queryString}` : ''}`);
            return;
          } else {
            // If projects list not loaded yet, fetch it and redirect
            try {
              const projectsResponse = await fetch('/api/projects');
              if (projectsResponse.ok) {
                const projects = await projectsResponse.json();
                if (projects.length > 0) {
                  const firstProject = projects[0].slug;
                  const params = new URLSearchParams(searchParams.toString());
                  const queryString = params.toString();
                  router.replace(`/${firstProject}${queryString ? `?${queryString}` : ''}`);
                  return;
                }
              }
            } catch (fetchErr) {
              console.error('Error fetching projects for redirect:', fetchErr);
            }
          }
          // Only throw if redirect failed
          throw new Error(`Failed to fetch project: ${tokenSlug}`);
        }
        const data: ProjectConfig = await response.json();
        setCurrentProject(data);
      } catch (err) {
        console.error('Error fetching project config:', err);
        setError(`Failed to load project: ${tokenSlug}`);
      } finally {
        setIsLoading(false);
        // Clear switching state when project load completes
        setIsSwitching(false);
        setSwitchingToSlug(null);
      }
    }

    if (tokenSlug) {
      fetchProjectConfig();
    }
    // Note: searchParams intentionally excluded to prevent refetching on timeframe changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenSlug, allProjects]);

  // Switch to different project
  const switchProject = (slug: string) => {
    // Set switching state to trigger loader and track destination
    setIsSwitching(true);
    setSwitchingToSlug(slug);
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    router.push(`/${slug}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  return (
    <TokenContext.Provider
      value={{
        currentProject,
        allProjects,
        isLoading,
        isSwitching,
        switchingToSlug,
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
