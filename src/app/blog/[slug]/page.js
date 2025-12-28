import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { configDotenv } from "dotenv";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommentsSection from "@/components/CommentsSection";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/atom-one-dark.css";
import { supabase } from "../../../../supabase/supabase";
import { AuthService } from "@/services/auth";

configDotenv();

export const dynamic = "force-dynamic";

async function getPost(slug) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching post with slug "${slug}":`, error.message, error.code, error.details);
    return null;
  }
  if (!post) {
    return null;
  }
  return post;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160) + "...",
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160) + "...",
      type: "article",
      publishedTime: post.created_at,
      authors: [post.author_name || "ElecZen Author"],
      tags: post.tags,
      images: [
        {
          url: post.cover_image || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160) + "...",
      images: [post.cover_image || "/og-image.jpg"],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const session = await AuthService.getSession();
  const isAdmin = session?.user?.role === "admin";

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.cover_image || "https://eleczen.com/og-image.jpg",
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author_name || "ElecZen Author",
    },
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <JsonLd data={jsonLd} />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-neon-blue/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-neon-purple/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumbs
            customCrumbs={[
              { label: "Blog", href: "/blog" },
              { label: post.title, href: "#" }
            ]}
          />
          {isAdmin && (
            <Link
              href={`/admin/blog/edit/${post.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Post</span>
            </Link>
          )}
        </div>

        <article className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up">
          <div className="relative h-64 md:h-96 w-full group">
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <span className="text-6xl animate-pulse">⚡</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-neon-blue/20 text-neon-blue border border-neon-blue/30 text-sm font-medium backdrop-blur-md shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight neon-text-subtle">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                    {post.author_image ? (
                      <img src={post.author_image} alt={post.author_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neon-purple/20 text-neon-purple font-bold text-lg">
                        {post.author_name?.[0] || "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-white block">
                      {post.author_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">Author</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <time className="text-sm text-gray-300 block">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span className="text-xs text-gray-500">Published</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-12">
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-neon-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-neon-pink prose-pre:bg-[#282c34] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        <CommentsSection postId={post.id} />
      </div>
    </div>
  );
}
