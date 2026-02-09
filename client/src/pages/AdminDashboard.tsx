import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

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

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin' && role !== 'editor') {
      setLocation('/');
      return;
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/items?page=1&limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newItemTitle,
          description: newItemDesc,
        }),
      });

      if (response.ok) {
        setNewItemTitle('');
        setNewItemDesc('');
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Create Item Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Item title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Item description"
              />
            </div>
            <Button type="submit">Create Item</Button>
          </form>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
          <CardDescription>{items.length} total items</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : items.length === 0 ? (
            <div>No items found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Title</th>
                    <th className="text-left py-2">Created By</th>
                    <th className="text-left py-2">Views</th>
                    <th className="text-left py-2">Likes</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{item.title}</td>
                      <td className="py-2">{item.createdBy.name}</td>
                      <td className="py-2">{item.views}</td>
                      <td className="py-2">{item.likes}</td>
                      <td className="py-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
