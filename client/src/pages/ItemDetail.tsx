import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

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

export default function ItemDetail({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/items/${params.id}`);
      
      if (!response.ok) {
        setError('Item not found');
        return;
      }

      const data = await response.json();
      setItem(data.data);
    } catch (err) {
      setError('Failed to load item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!item) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          likes: 1, // Increment by 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setItem(data.data);
      }
    } catch (error) {
      console.error('Failed to like item:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (error || !item) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Item not found'}</h1>
          <Button onClick={() => setLocation('/')}>Back to Items</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => setLocation('/')} variant="outline" className="mb-6">
        ← Back to Items
      </Button>

      <Card>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-96 object-cover"
          />
        )}
        <CardHeader>
          <CardTitle className="text-3xl">{item.title}</CardTitle>
          <CardDescription>
            By {item.createdBy.name} • {new Date(item.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DEFECT 12: XSS vulnerability - rendering with dangerouslySetInnerHTML */}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          <div className="flex gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <div>
                <div className="text-sm text-gray-600">Views</div>
                <div className="text-lg font-semibold">{item.views}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleLike} variant="ghost" size="lg">
                ❤️ {item.likes}
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-2">About the Creator</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{item.createdBy.name}</p>
              <p className="text-sm text-gray-600">{item.createdBy.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
