import 'dotenv/config';
import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

async function runTests() {
  console.log('Running smoke tests...\n');

  // Test 1: Signup
  let accessToken = '';
  await test('POST /api/auth/signup', async () => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Test User',
      }),
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}`);
    }
  });

  // Test 2: Login
  await test('POST /api/auth/login', async () => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPass123!',
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const data = await response.json() as any;
    if (!data.accessToken) {
      throw new Error('No access token returned');
    }

    accessToken = data.accessToken;
  });

  // Test 3: Get items
  await test('GET /api/items', async () => {
    const response = await fetch(`${API_BASE}/api/items?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const data = await response.json() as any;
    if (!Array.isArray(data.data)) {
      throw new Error('Response data is not an array');
    }
  });

  // Test 4: Create item
  let itemId = '';
  await test('POST /api/items', async () => {
    const response = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Test Item',
        description: 'This is a test item',
      }),
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}`);
    }

    const data = await response.json() as any;
    itemId = data.data?._id;
    if (!itemId) {
      throw new Error('No item ID returned');
    }
  });

  // Test 5: Get item details
  if (itemId) {
    await test('GET /api/items/:id', async () => {
      const response = await fetch(`${API_BASE}/api/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // Test 6: Update item
  if (itemId) {
    await test('PUT /api/items/:id', async () => {
      const response = await fetch(`${API_BASE}/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: 'Updated Test Item',
          description: 'Updated description',
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('✓ All smoke tests passed!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
