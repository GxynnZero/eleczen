import { redirect } from "next/navigation";
import { configDotenv } from "dotenv";

configDotenv();

export default async function AdminLayout({ children }) {
  const baseUrl = process.env.BASE_URL;
  const session = await fetch(`${baseUrl}/api/auth/session`);

  if (!session?.user) {
    redirect("/login");
  }

  // In a real app, check for admin role
  // if (session.user.role !== 'admin') {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 hidden md:block fixed h-full z-40">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-wider">ADMIN</h2>
        </div>
        <nav className="px-4 space-y-2">
          <a
            href="/admin"
            className="block px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue font-medium"
          >
            Dashboard
          </a>
          <a
            href="/admin/users"
            className="block px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Users
          </a>
          <a
            href="/admin/blog"
            className="block px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Blog Posts
          </a>
          <a
            href="/admin/components"
            className="block px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Components
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">{children}</main>
    </div>
  );
}
