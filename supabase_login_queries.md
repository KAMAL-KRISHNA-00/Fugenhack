# Supabase Authentication & Queries for Next.js

This document outlines the queries and methods needed to integrate Supabase authentication into your custom login page (`/src/app/login/page.tsx`), enabling the distinct Admin and User dashboard routing.

## 1. Setup & Installation 

First, install the necessary Supabase tools for Next.js:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

Set up your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 2. Supabase Client Setup

Create a file `src/utils/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 3. Login component updates

Update your `handleLogin` function inside `src/app/login/page.tsx` with these queries.

### Basic Email & Password Login:

```typescript
import { createClient } from '@/utils/supabase/client'

// Inside your component
const supabase = createClient()

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  // Attempt login via Supabase Auth
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: username, // Assuming username input acts as an email
    password: password,
  })

  // Handle incorrect credentials
  if (authError) {
    setError(authError.message)
    setIsLoading(false)
    return
  }

  // 4. Role-Based Routing Query
  // Check the user's role from a custom "profiles" table
  if (data?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      setError("Failed to fetch user profile.")
      setIsLoading(false)
      return
    }

    // Route based on role
    if (profile.role === 'admin') {
      router.push("/dashboard/admin")
    } else {
      router.push("/dashboard/user")
    }
  }
}
```

## 4. SQL Setup (Run in Supabase SQL Editor)

To make the above role-based routing work, you need a custom `profiles` table linked to Supabase's built-in `auth.users`.

Run this SQL query in your Supabase project dashboard:

```sql
-- Create a table for public profiles linked to auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Optional: Create a trigger to automatically create a profile when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 5. Session Management Middleware

To protect your dashboard routes, you'll need a Next.js middleware file (`src/middleware.ts`) to check if a user is logged in before allowing access to `/dashboard/*`. You can find the standard implementation in the [Supabase Next.js Docs](https://supabase.com/docs/guides/auth/server-side/nextjs).
