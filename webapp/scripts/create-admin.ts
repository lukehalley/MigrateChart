/**
 * Create Admin User Script
 *
 * Usage: tsx scripts/create-admin.ts [email] [password]
 *
 * Creates a user in Supabase Auth for admin access
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createAdmin(email: string, password: string) {
  try {
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin'
      }
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        throw new Error('User with this email already exists');
      }
      throw error;
    }

    console.log('Admin user created successfully!');
    console.log('Email:', data.user.email);
    console.log('ID:', data.user.id);
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: tsx scripts/create-admin.ts [email] [password]');
  console.log('Example: tsx scripts/create-admin.ts admin@example.com MySecurePass123');
  process.exit(1);
}

const [email, password] = args;

createAdmin(email, password)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
