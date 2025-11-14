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

    // Return the first project slug, or default to 'zera'
    return projects[0]?.slug || 'zera';
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Default to 'zera' if there's an error
    return 'zera';
  }
}

export default async function RootPage() {
  const firstProjectSlug = await getFirstProject();
  redirect(`/${firstProjectSlug}`);
}
