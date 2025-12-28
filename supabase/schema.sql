-- ElecZen Component Library Database Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- 0. Profiles Table (Best Practice for User Data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely drop/recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 1. Component Libraries Table
CREATE TABLE IF NOT EXISTS component_libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL UNIQUE,
    library_type TEXT NOT NULL,
    status TEXT DEFAULT 'ok' CHECK (status IN ('ok', 'error', 'processing')),
    component_count INTEGER DEFAULT 0,
    parsed_metadata JSONB,
    is_public BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Library Index Table
CREATE TABLE IF NOT EXISTS library_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID REFERENCES component_libraries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    category TEXT,
    parameters JSONB,
    pins JSONB,
    source_file TEXT,
    search_blob TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_index_name ON library_index(name);
CREATE INDEX IF NOT EXISTS idx_library_index_type ON library_index(type);
CREATE INDEX IF NOT EXISTS idx_library_index_category ON library_index(category);
CREATE INDEX IF NOT EXISTS idx_library_index_library_id ON library_index(library_id);
CREATE INDEX IF NOT EXISTS idx_component_libraries_user_id ON component_libraries(user_id);

-- Enable RLS
ALTER TABLE component_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_index ENABLE ROW LEVEL SECURITY;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    content TEXT,
    is_public BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Ensure columns exist (Idempotent updates)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Blog Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_name TEXT,
    author_image TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Ensure columns exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Helper Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers (Idempotent creation)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_component_libraries_updated_at ON component_libraries;
CREATE TRIGGER update_component_libraries_updated_at BEFORE UPDATE ON component_libraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- RLS Policies (Re-apply to ensure they are up to date)

-- component_libraries
DROP POLICY IF EXISTS "Public libraries are viewable by everyone" ON component_libraries;
CREATE POLICY "Public libraries are viewable by everyone" ON component_libraries FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own libraries" ON component_libraries;
CREATE POLICY "Users can view their own libraries" ON component_libraries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own libraries" ON component_libraries;
CREATE POLICY "Users can insert their own libraries" ON component_libraries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own libraries" ON component_libraries;
CREATE POLICY "Users can update their own libraries" ON component_libraries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own libraries" ON component_libraries;
CREATE POLICY "Users can delete their own libraries" ON component_libraries FOR DELETE USING (auth.uid() = user_id);

-- library_index
DROP POLICY IF EXISTS "Public library components are viewable" ON library_index;
CREATE POLICY "Public library components are viewable" ON library_index FOR SELECT USING (EXISTS (SELECT 1 FROM component_libraries WHERE component_libraries.id = library_index.library_id AND component_libraries.is_public = true));

DROP POLICY IF EXISTS "Users can view their own library components" ON library_index;
CREATE POLICY "Users can view their own library components" ON library_index FOR SELECT USING (EXISTS (SELECT 1 FROM component_libraries WHERE component_libraries.id = library_index.library_id AND component_libraries.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert into their own libraries" ON library_index;
CREATE POLICY "Users can insert into their own libraries" ON library_index FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM component_libraries WHERE component_libraries.id = library_index.library_id AND component_libraries.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own library components" ON library_index;
CREATE POLICY "Users can update their own library components" ON library_index FOR UPDATE USING (EXISTS (SELECT 1 FROM component_libraries WHERE component_libraries.id = library_index.library_id AND component_libraries.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own library components" ON library_index;
CREATE POLICY "Users can delete their own library components" ON library_index FOR DELETE USING (EXISTS (SELECT 1 FROM component_libraries WHERE component_libraries.id = library_index.library_id AND component_libraries.user_id = auth.uid()));

-- projects
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON projects;
CREATE POLICY "Public projects are viewable by everyone" ON projects FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- posts
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Authenticated users can manage posts" ON posts;
CREATE POLICY "Authenticated users can manage posts" ON posts USING (auth.role() = 'authenticated');

-- comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
