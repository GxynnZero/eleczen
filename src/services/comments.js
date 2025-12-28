import { fetchClient } from "@/lib/api";

export const CommentService = {
    /**
     * Get comments for a post
     * @param {string} postId
     */
    getByPostId: (postId) => fetchClient(`/api/comments?postId=${postId}`),

    /**
     * Create a new comment
     * @param {Object} data - { content, postId }
     */
    create: (data) => fetchClient("/api/comments", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    /**
     * Delete a comment
     * @param {string} commentId
     */
    delete: (commentId) => fetchClient(`/api/comments/${commentId}`, {
        method: "DELETE",
    }),
};
