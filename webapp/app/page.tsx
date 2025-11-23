import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time Supabase calls
export const dynamic = 'force-dynamic';

// Get the first active project from the database
async function getFirstProject() {
  try {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('slug')
      .eq('is_active', true)
      .order('is_default', { ascending: false }) // Default project first
      .order('name', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }

    // Return the first project slug, or throw if no projects exist
    if (projects && projects.length > 0) {
      return projects[0].slug;
    }

    throw new Error('No projects found in database');
  } catch (error) {
    console.error('Error fetching first project:', error);
    throw error; // Re-throw to handle at a higher level
  }
}

export default async function RootPage() {
  const firstProjectSlug = await getFirstProject();
  redirect(`/${firstProjectSlug}`);
}
