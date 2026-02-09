import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface Item {
  _id: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchItems();
  }, [pagination.page, searchQuery]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const query = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const response = await fetch(
        `/api/items?page=${pagination.page}&limit=${pagination.limit}${query}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      setItems(data.data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, page: pagination.page + 2 });
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 2 });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    setLocation('/login');
  };

  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Buggy MERN App</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                {(localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'editor') && (
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/admin')}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/login')}
                >
                  Login
                </Button>
                <Button
                  onClick={() => setLocation('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Items</h2>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => (
                <Card
                  key={item._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/item/${item._id}`)}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <CardDescription>
                      By {item.createdBy.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {item.description}
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>👁️ {item.views}</span>
                      <span>❤️ {item.likes}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={pagination.page === 1}
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.pages}
              >
                Next →
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
