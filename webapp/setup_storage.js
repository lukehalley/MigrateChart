const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupStorage() {
  console.log('Setting up Supabase storage buckets...\n');
  
  // List existing buckets
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  console.log('Existing buckets:', existingBuckets.map(b => b.name));
  
  // Create project-logos bucket if it doesn't exist
  const hasLogos = existingBuckets.some(b => b.name === 'project-logos');
  if (!hasLogos) {
    const { data, error } = await supabase.storage.createBucket('project-logos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/avif']
    });
    
    if (error) {
      console.error('Error creating project-logos bucket:', error);
    } else {
      console.log('✓ Created project-logos bucket');
    }
  } else {
    console.log('✓ project-logos bucket already exists');
  }
  
  // Create project-loaders bucket if it doesn't exist
  const hasLoaders = existingBuckets.some(b => b.name === 'project-loaders');
  if (!hasLoaders) {
    const { data, error } = await supabase.storage.createBucket('project-loaders', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/svg+xml']
    });
    
    if (error) {
      console.error('Error creating project-loaders bucket:', error);
    } else {
      console.log('✓ Created project-loaders bucket');
    }
  } else {
    console.log('✓ project-loaders bucket already exists');
  }
}

setupStorage().catch(console.error);
