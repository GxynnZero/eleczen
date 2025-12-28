import { fetchClient } from "@/lib/api";


export const AdminService = {
    /**
     * Get all users (Admin only)
     */
    getUsers: () => fetchClient("/api/admin/users"),

    /**
     * Get all blog posts (Admin only, likely includes drafts etc)
     */
    getPosts: () => fetchClient("/api/admin/blog"),

    /**
     * Delete a blog post
     * @param {string} id
     */
    deletePost: (id) => fetchClient(`/api/admin/blog/${id}`, {
        method: "DELETE",
    }),
};
