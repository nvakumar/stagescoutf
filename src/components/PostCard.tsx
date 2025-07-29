import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageCircle, Share2, Trash2, Edit, MoreVertical, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CommentSection from './CommentSection';
import EditPostModal from './EditPostModal';

// Define the shape of the Post data coming from the API
interface PostAuthor {
  _id: string;
  fullName: string;
  role: string;
  avatar?: string;
  profilePictureUrl?: string;
}

interface Post {
  _id: string;
  user: PostAuthor;
  title: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: 'Photo' | 'Video';
  likes: string[];
  comments: { _id: string; user: PostAuthor; text: string; createdAt: string; }[];
  group?: { _id: string; admin: string; };
  reactions: any[];
}

type PostCardProps = {
  post: Post;
  onPostDeleted: (postId: string) => void;
  onPostUpdated: (updatedPost: Post) => void;
  groupAdminId?: string;
};

// A simple, self-contained Toast component for notifications
const Toast = ({ message, onDone }: { message: string; onDone: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50 border border-gray-700">
      <Check size={18} className="text-green-400" />
      <span>{message}</span>
    </div>
  );
};


const PostCard = ({ post, onPostDeleted, onPostUpdated, groupAdminId }: PostCardProps) => {
  const { user: currentUser, token } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.includes(currentUser._id));
      setLikeCount(post.likes.length);
    }
  }, [currentUser, post.likes]);

  useEffect(() => {
    setComments(post.comments);
  }, [post.comments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLike = async () => {
    if (!currentUser) {
      setToastMessage('You must be logged in to like a post.');
      return;
    }
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;
    setIsLiked(!originalIsLiked);
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);
    try {
      await api.put(`/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to update like status:", error);
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
      setToastMessage('Failed to like the post.');
    }
  };

  const handleCommentChange = (updatedComments: any[]) => {
    setComments(updatedComments);
  };

  const handleDeletePost = async () => {
    if (!token) return;
    setShowConfirmDelete(false);
    setShowMenu(false);
    try {
      await api.delete(`/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onPostDeleted(post._id);
      setToastMessage('Post deleted successfully.');
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      setToastMessage(error.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleEditPost = () => {
    setIsEditPostModalOpen(true);
    setShowMenu(false);
  };

  const onPostEditSuccess = (updatedPost: Post) => {
    onPostUpdated(updatedPost);
    setIsEditPostModalOpen(false);
  };

  const handleSharePost = () => {
    setShowMenu(false);
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => setToastMessage('Post link copied to clipboard!'))
      .catch(() => setToastMessage('Failed to copy link.'));
  };

  const authorAvatar = post.user.profilePictureUrl || post.user.avatar || `https://placehold.co/100x100/1a202c/ffffff?text=${post.user.fullName.charAt(0)}`;

  const isPostOwner = currentUser && post.user._id === currentUser._id;
  const effectiveGroupAdminId = groupAdminId || post.group?.admin;
  const isGroupAdmin = currentUser && effectiveGroupAdminId === currentUser._id;
  const canModifyPost = isPostOwner || isGroupAdmin;

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onDone={() => setToastMessage(null)} />}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700/50 overflow-hidden mb-6 transition-shadow hover:shadow-indigo-500/10">
        {/* Card Header */}
        <div className="p-3 sm:p-4 flex items-center justify-between">
          <Link to={`/profile/${post.user._id}`} className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src={authorAvatar}
                alt={post.user.fullName}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover bg-gray-900 border-2 border-transparent group-hover:border-indigo-500 transition-all"
              />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-600 group-hover:scale-110 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-indigo-400 transition-colors text-base sm:text-lg">{post.user.fullName}</p>
              <p className="text-sm text-gray-400">{post.user.role}</p>
            </div>
          </Link>
          {canModifyPost && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title="Post Options"
              >
                <MoreVertical size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10 animate-fade-in-fast">
                  <button onClick={handleEditPost} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center space-x-2">
                    <Edit size={16} /> <span>Edit Post</span>
                  </button>
                  <button onClick={handleSharePost} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center space-x-2">
                    <Share2 size={16} /> <span>Share Post</span>
                  </button>
                  <button onClick={() => setShowConfirmDelete(true)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300 flex items-center space-x-2">
                    <Trash2 size={16} /> <span>Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="px-3 sm:px-4 pb-2">
          <p className="text-lg md:text-xl text-gray-200 mb-2">{post.title}</p>
          {post.description && <p className="text-sm text-gray-400 mb-2 whitespace-pre-wrap">{post.description}</p>}
        </div>
        
        {/* FIX: Enhanced Media Container for better PC view */}
        {post.mediaUrl && (
          <div className="bg-black">
            {post.mediaType === 'Photo' ? (
              <img 
                src={post.mediaUrl} 
                alt={post.title} 
                // Use object-contain to prevent cropping, ensuring the whole image is visible
                className="w-full h-auto max-h-[75vh] object-contain" 
              />
            ) : (
              <video 
                src={post.mediaUrl} 
                controls 
                className="w-full h-auto max-h-[75vh] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="p-3 sm:p-4">
          <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-2">
            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>
          <hr className="border-gray-700" />
          <div className="grid grid-cols-2 gap-1 mt-1">
            <button
              onClick={handleLike}
              className={`flex items-center justify-center space-x-2 text-sm px-3 py-2 rounded-md transition-colors duration-200 font-semibold ${
                isLiked ? 'text-indigo-400 bg-indigo-900/30' : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <ThumbsUp size={20} className={`${isLiked ? 'fill-current' : 'fill-none'}`} />
              <span>Like</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center justify-center space-x-2 text-sm px-3 py-2 rounded-md transition-colors duration-200 font-semibold ${
                showComments ? 'text-indigo-400 bg-indigo-900/30' : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <MessageCircle size={20} />
              <span>Comment</span>
            </button>
          </div>
        </div>

        {showComments && (
          <CommentSection
            postId={post._id}
            initialComments={comments}
            onCommentChange={handleCommentChange}
            postOwnerId={post.user._id}
            groupAdminId={effectiveGroupAdminId}
          />
        )}

        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-scale-in">
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
              <p className="text-gray-300">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-center space-x-4 mt-6">
                <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2 font-bold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeletePost} className="px-6 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditPostModalOpen && (
          <EditPostModal
            isOpen={isEditPostModalOpen}
            onClose={() => setIsEditPostModalOpen(false)}
            onSuccess={onPostEditSuccess}
            post={post}
          />
        )}
      </div>
    </>
  );
};

export default PostCard;
