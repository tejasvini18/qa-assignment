import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Item {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
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
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [pagination.page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      const response = await fetch(`/api/items?${params}`);
      const result = await response.json();

      setItems(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchItems();
  };

  const nextPage = () => {
    const maxPage = Math.ceil(pagination.total / pagination.limit);
    if (pagination.page < maxPage) {
      setPagination({ ...pagination, page: pagination.page + 2 }); 
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 2 }); 
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Items</h1>

      {/* Search Form */}
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
        <div className="text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">No items found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {items.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                <CardDescription>{item.createdBy.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* DEFECT 12: XSS vulnerability - using dangerouslySetInnerHTML without sanitization */}
                <div
                  className="text-sm text-gray-600 line-clamp-3 mb-4"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
                <div className="flex justify-between text-sm">
                  <span>👁️ {item.views}</span>
                  <span>❤️ {item.likes}</span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <Button onClick={prevPage} disabled={pagination.page === 1}>
          Previous
        </Button>
        <span>
          Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
        </span>
        <Button
          onClick={nextPage}
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
