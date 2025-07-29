import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import LeaderboardWidget from '../components/LeaderboardWidget';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, XCircle, Menu, X, Home, Award } from 'lucide-react'; // Import new icons

// Define types for the data used in this component
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
  comments: { _id: string; user: PostAuthor; text: string; createdAt: string }[];
  reactions: any[];
  group?: { _id: string; admin: string };
}

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'feed' | 'leaderboard'>('feed'); // State for mobile tabs

  // Get user and token from auth context
  const { token, user: currentUser } = useAuth();

  // Memoized function to fetch posts from the API
  const fetchPosts = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Post[]>('/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load the feed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch posts on initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  // Update posts when the currentUser's details change
  useEffect(() => {
    if (!currentUser) return;
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.user._id === currentUser._id
          ? {
              ...post,
              user: {
                ...post.user,
                fullName: currentUser.fullName,
                avatar: currentUser.profilePictureUrl || currentUser.avatar,
              },
            }
          : post
      )
    );
  }, [currentUser]);

  // Handler to remove a deleted post from the state
  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((post) => post._id !== deletedPostId));
  };

  // Handler to update a post in the state
  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div className="w-64 bg-gray-900 border-r border-gray-800 h-full p-4 overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-700">
                <X size={24} />
              </button>
            </div>
            <LeftSidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setIsSidebarOpen(false)}></div>
        </div>
      )}

      <main className="pt-20 container mx-auto px-4">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <LeftSidebar />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-6">
            {/* Hamburger Menu & Mobile Tabs */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <button onClick={() => setIsSidebarOpen(true)} className="flex items-center p-2 rounded-md hover:bg-gray-700">
                <Menu size={24} />
                <span className="ml-2 font-semibold">Menu</span>
              </button>
              {/* Mobile Tab Navigation */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button 
                  onClick={() => setActiveMobileTab('feed')} 
                  className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${activeMobileTab === 'feed' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
                >
                  <Home size={16} /> Feed
                </button>
                <button 
                  onClick={() => setActiveMobileTab('leaderboard')} 
                  className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${activeMobileTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
                >
                  <Award size={16} /> Leaderboard
                </button>
              </div>
            </div>

            {/* Conditional content based on mobile tab */}
            <div className={activeMobileTab === 'feed' ? 'block' : 'hidden lg:block'}>
              <CreatePost onPostCreated={fetchPosts} />
              {isLoading ? (
                <div className="text-center mt-8 flex items-center justify-center text-gray-400">
                  <Loader2 size={24} className="animate-spin mr-2" /> Loading feed...
                </div>
              ) : error ? (
                <div className="text-center mt-8 text-red-400 bg-red-900/20 p-4 rounded-lg flex items-center justify-center">
                  <XCircle size={20} className="mr-2" /> {error}
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6 mt-6">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} onPostUpdated={handlePostUpdated} />
                  ))}
                </div>
              ) : (
                <div className="text-center mt-8 p-8 bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-semibold">Welcome to your Feed!</h3>
                  <p className="text-gray-400 mt-2">No posts yet. Follow people or be the first to share your work!</p>
                </div>
              )}
            </div>

            {/* Mobile Leaderboard View */}
            <div className={activeMobileTab === 'leaderboard' ? 'block lg:hidden' : 'hidden'}>
              <LeaderboardWidget />
            </div>
          </div>

          {/* Desktop Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <LeaderboardWidget />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
