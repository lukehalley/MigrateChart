import { redirect } from 'next/navigation';

// API route to get the list of available projects
async function getFirstProject() {
  try {
    // Fetch from the API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/projects`, {
      cache: 'no-store', // Don't cache to ensure we get the latest
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const projects = await response.json();

    // Return the first project slug, or throw if no projects exist
    if (projects.length > 0) {
      return projects[0].slug;
    }

    throw new Error('No projects found in database');
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error; // Re-throw to handle at a higher level
  }
}

export default async function RootPage() {
  const firstProjectSlug = await getFirstProject();
  redirect(`/${firstProjectSlug}`);
}
