# Supabase Authentication Setup

The admin dashboard is now **fully protected** with Supabase Authentication.

## 🔒 What's Protected

- **Admin Dashboard**: `/admin` - Requires authentication
- **Admin Login**: `/admin/login` - Public login page
- **Admin API**: `/api/admin/*` - All admin API endpoints require authentication

## 📁 Files Created/Modified

### New Files
1. `/webapp/utils/supabase/middleware.ts` - Auth middleware helper
2. `/webapp/app/admin/login/page.tsx` - Admin login page

### Modified Files
1. `/webapp/middleware.ts` - Updated to use Supabase auth
2. `/webapp/app/admin/page.tsx` - Added logout functionality
3. `/webapp/components/admin/PoolInput.tsx` - Fixed controlled input warnings

## 🚀 Setup Instructions

### 1. Enable Email Authentication in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Email** provider
4. Configure email templates (optional but recommended)

### 2. Create Admin User

Run this in your Supabase SQL Editor:

```sql
-- Create an admin user
-- Replace with your desired email/password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@yourdomain.com',  -- Change this
  crypt('your-secure-password', gen_salt('bf')),  -- Change this
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

**Or use Supabase Dashboard:**
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

### 3. Environment Variables

Ensure these are in your `/webapp/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔐 How It Works

### Authentication Flow

1. **Unauthenticated User** visits `/admin`:
   - Middleware checks for authenticated session
   - No session found → Redirect to `/admin/login`

2. **User Logs In** at `/admin/login`:
   - Enters email/password
   - `supabase.auth.signInWithPassword()` called
   - Session stored in cookies
   - Redirect to `/admin`

3. **Authenticated User** accesses `/admin`:
   - Middleware validates session
   - Session valid → Allow access
   - Can view/create/edit/delete projects

4. **User Logs Out**:
   - Clicks "Logout" button
   - `supabase.auth.signOut()` called
   - Session cleared
   - Redirect to `/admin/login`

### Middleware Protection

The middleware (`/webapp/middleware.ts`) runs on **every request** and:

1. Creates a Supabase client with cookie handling
2. Calls `supabase.auth.getUser()` to validate session
3. For `/admin` routes:
   - No user → Redirect to `/admin/login`
   - Has user → Allow access
4. For `/api/admin` routes:
   - No user → Return 401 Unauthorized
   - Has user → Allow access

### Code Structure

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// utils/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  // 1. Create Supabase client
  const supabase = createServerClient(...)

  // 2. Validate user session
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect('/admin/login')
    }
  }

  return supabaseResponse
}
```

## 🎨 Login Page Features

- **Clean Design**: Matches admin dashboard aesthetic
- **Error Handling**: Shows authentication errors
- **Loading States**: Disabled inputs while authenticating
- **Responsive**: Works on all screen sizes
- **Secure**: Uses Supabase's built-in security

## 🔧 Advanced Configuration (Optional)

### Add Role-Based Access Control

If you want to restrict admin access to specific users:

1. **Add custom claims to user metadata:**

```sql
-- In Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@yourdomain.com';
```

2. **Update middleware to check role:**

```typescript
// utils/supabase/middleware.ts
const { data: { user } } = await supabase.auth.getUser();

if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!user) {
    // Not logged in
    return NextResponse.redirect('/admin/login');
  }

  // Check if user has admin role
  const userRole = user.user_metadata?.role;
  if (userRole !== 'admin') {
    // Logged in but not admin
    return new NextResponse('Forbidden', { status: 403 });
  }
}
```

### Add Email Confirmation

By default, users can log in immediately. To require email confirmation:

1. Go to Supabase Dashboard
2. **Authentication** > **Settings**
3. Enable **Confirm email**
4. Users must click confirmation link before logging in

### Add Password Reset

1. Create a password reset page at `/admin/reset-password`
2. Use `supabase.auth.resetPasswordForEmail()` to send reset link
3. Handle the reset token in a callback route

Example:
```typescript
// Reset password page
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'http://localhost:3000/admin/reset-password/confirm',
});
```

## 🧪 Testing

### Test Authentication Flow

1. **Start dev server:**
   ```bash
   cd webapp
   npm run dev
   ```

2. **Test unauthenticated access:**
   - Visit http://localhost:3000/admin
   - Should redirect to http://localhost:3000/admin/login

3. **Test login:**
   - Enter admin email/password
   - Should redirect to http://localhost:3000/admin
   - Should see project dashboard

4. **Test logout:**
   - Click "Logout" button
   - Should redirect to login page
   - Trying to visit `/admin` should redirect back to login

5. **Test API protection:**
   ```bash
   # Without auth - should return 401
   curl http://localhost:3000/api/admin/projects

   # With auth - requires session cookie (test in browser after login)
   ```

## 🚨 Security Best Practices

### DO:
✅ Use environment variables for Supabase credentials
✅ Require email confirmation for production
✅ Use strong passwords (min 8 chars, mixed case, numbers, symbols)
✅ Enable Supabase's built-in rate limiting
✅ Keep `@supabase/ssr` package up to date
✅ Use HTTPS in production
✅ Set up proper CORS policies

### DON'T:
❌ Don't commit `.env.local` to git
❌ Don't share Supabase service_role key (use anon key only)
❌ Don't trust client-side auth checks (always verify on server)
❌ Don't store sensitive data in user metadata
❌ Don't use the same password for multiple admins

## 📊 RLS Policies

The database RLS policies allow:
- **Public read** on active projects
- **Authenticated write** on all projects

To further restrict to admin-only writes, update the policies:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow admin inserts on projects" ON projects;
DROP POLICY IF EXISTS "Allow admin updates on projects" ON projects;
DROP POLICY IF EXISTS "Allow admin deletes on projects" ON projects;

-- Create new policies with role check
CREATE POLICY "Allow admin inserts on projects"
ON projects
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Allow admin updates on projects"
ON projects
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

CREATE POLICY "Allow admin deletes on projects"
ON projects
FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
```

## 🎉 Summary

✅ **Authentication**: Fully implemented with Supabase Auth
✅ **Protected Routes**: `/admin` and `/api/admin/*` require login
✅ **Login Page**: Clean, functional, matches design system
✅ **Logout**: Properly clears session and redirects
✅ **Middleware**: Validates sessions on every request
✅ **Build**: Successful with no TypeScript errors

**Access the admin dashboard:**
1. Navigate to http://localhost:3000/admin
2. Login with your Supabase user credentials
3. Manage projects securely!

🔒 **Security Status: PROTECTED**
