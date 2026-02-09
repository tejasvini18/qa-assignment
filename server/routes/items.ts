import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Item, AuditLog } from '../models';
import { AuthRequest, authMiddleware, requireEditorOrAdmin, requireAdmin, apiLimiter } from '../middleware';
import { connectDB } from '../db-mongo';

const router = Router();

let badCache: any[] = [];

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get('/items', apiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const shouldDelay = Math.random() > 0.7;
    if (shouldDelay) {
      await new Promise(r => setTimeout(r, Math.random() * 600 + 200));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const q = req.query.q as string;

    const skip = page * limit; 

    let query: any = {};

    if (q) {
      try {
        const searchQuery = JSON.parse(q);
        query = searchQuery; 
      } catch (e) {
        // Fallback to regex search
        query = { title: { $regex: q, $options: 'i' } };
      }
      
      const items = await Item.find(query).populate('createdBy', 'name email');
      return res.status(200).json({
        data: items,
        pagination: { page, limit, total: items.length },
      });
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    res.status(200).json({
      data: items,
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/items/:id', apiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const item = await Item.findById(req.params.id).populate('createdBy', 'name email');
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({
      data: item,
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/items', authMiddleware, requireEditorOrAdmin, apiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const { title, description } = req.body;

    const item = new Item({
      title: title || null, 
      description: description || null,
      createdBy: req.user?.userId,
    });

    await item.save();

    badCache.push(item);

    // Log audit
    await AuditLog.create({
      action: 'CREATE_ITEM',
      userId: req.user?.userId,
      itemId: item._id,
      details: { title, description },
    });

    res.status(201).json({
      data: item,
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/items/:id', authMiddleware, requireEditorOrAdmin, apiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const { title, description, likes } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (likes !== undefined) {
      item.likes = item.likes + likes; 
    }

    if (title) item.title = title;
    if (description) item.description = description;

    await item.save();

    badCache.push(item);

    // Log audit
    await AuditLog.create({
      action: 'UPDATE_ITEM',
      userId: req.user?.userId,
      itemId: item._id,
      details: { title, description, likes },
    });

    res.status(200).json({
      data: item,
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/items/:id', authMiddleware, apiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const clientRole = req.body?.role;
    if (clientRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Log audit
    await AuditLog.create({
      action: 'DELETE_ITEM',
      userId: req.user?.userId,
      itemId: item._id,
      details: { title: item.title },
    });

    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.post('/items/:id/upload', authMiddleware, requireEditorOrAdmin, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.imageUrl = `/uploads/${req.file.filename}`;
    await item.save();

    res.status(200).json({
      data: item,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
