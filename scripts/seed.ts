import 'dotenv/config';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { User, Item } from '../server/models';

const DATABASE_URL = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/buggy-mern-app';

async function seed() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('Connected to MongoDB');


    // Create users
    const adminUser = new User({
      email: 'admin@example.com',
      password: await bcryptjs.hash('AdminPass123!', 10),
      name: 'Admin User',
      role: 'admin',
    });

    const editorUser = new User({
      email: 'editor@example.com',
      password: await bcryptjs.hash('EditorPass123!', 10),
      name: 'Editor User',
      role: 'editor',
    });

    const regularUser = new User({
      email: 'user@example.com',
      password: await bcryptjs.hash('UserPass123!', 10),
      name: 'Regular User',
      role: 'user',
    });

    const savedAdmin = await adminUser.save();
    const savedEditor = await editorUser.save();
    const savedUser = await regularUser.save();

    console.log('✓ Users created:');
    console.log('  - admin@example.com / AdminPass123! (admin)');
    console.log('  - editor@example.com / EditorPass123! (editor)');
    console.log('  - user@example.com / UserPass123! (user)');

    // Create sample items
    const items = [
      {
        title: 'Getting Started with Node.js',
        description: 'Learn the basics of Node.js and build your first server',
        createdBy: savedAdmin._id,
      },
      {
        title: 'React Best Practices',
        description: 'Tips and tricks for writing clean React code',
        createdBy: savedEditor._id,
      },
      {
        title: 'MongoDB Schema Design',
        description: 'How to design efficient MongoDB schemas',
        createdBy: savedAdmin._id,
      },
      {
        title: 'Testing JavaScript Applications',
        description: 'Unit testing, integration testing, and E2E testing strategies',
        createdBy: savedEditor._id,
      },
      {
        title: 'Docker for Developers',
        description: 'Containerize your applications with Docker',
        createdBy: savedAdmin._id,
      },
    ];

    for (const itemData of items) {
      const item = new Item(itemData);
      await item.save();
    }

    console.log(`✓ ${items.length} sample items created`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
