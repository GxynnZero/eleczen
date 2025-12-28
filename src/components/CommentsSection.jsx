"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { CommentService } from "@/services/comments";

export default function CommentsSection({ postId }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const data = await CommentService.getByPostId(postId);
            setComments(data);
        } catch (error) {
            console.error(error);
            toast.error("Could not load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!session) {
            toast.error("Please sign in to comment");
            return;
        }

        setSubmitting(true);
        try {
            const comment = await CommentService.create({ content: newComment, postId });
            setComments([comment, ...comments]);
            setNewComment("");
            toast.success("Comment posted!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            await CommentService.delete(commentId);
            setComments(comments.filter((c) => c._id !== commentId));
            toast.success("Comment deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete comment");
        }
    };

    return (
        <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                Comments <span className="text-gray-500 text-lg">({comments.length})</span>
            </h3>

            {/* Comment Form */}
            <div className="glass-panel p-6 rounded-xl mb-8 border border-white/10">
                {session ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neon-blue/20 text-neon-blue font-bold">
                                        {session.user.name?.[0] || "U"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all resize-none h-24"
                                    required
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting || !newComment.trim()}
                                        className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">Sign in to join the discussion</p>
                        <a
                            href="/login"
                            className="inline-block px-6 py-2 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue hover:text-black transition-all font-medium"
                        >
                            Sign In
                        </a>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id} className="glass-panel p-4 rounded-xl border border-white/5 animate-fade-in group relative">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                    {comment.author?.image ? (
                                        <img src={comment.author.image} alt={comment.author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neon-purple/20 text-neon-purple font-bold">
                                            {comment.author?.name?.[0] || "A"}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{comment.author?.name || "Anonymous"}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toISOString().split('T')[0]}
                                            </span>
                                        </div>
                                        {session?.user?.id === comment.author?._id && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(comment._id)}
                                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}
