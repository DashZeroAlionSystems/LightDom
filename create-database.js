// Create the lightdom database
import { Pool } from 'pg';

// Connect to default postgres database to create lightdom
const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: 'postgres', // Connect to default postgres database
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

async function createDatabase() {
  try {
    console.log('🔍 Connecting to PostgreSQL...');
    
    const client = await adminPool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if database exists
    const dbCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_database 
        WHERE datname = 'lightdom'
      );
    `);
    
    console.log('📋 lightdom database exists:', dbCheck.rows[0].exists);
    
    if (!dbCheck.rows[0].exists) {
      console.log('🔧 Creating lightdom database...');
      
      // Create the database
      await client.query('CREATE DATABASE lightdom');
      console.log('✅ lightdom database created successfully');
    } else {
      console.log('ℹ️  lightdom database already exists');
    }
    
    client.release();
    console.log('🎉 Database setup completed');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
  } finally {
    await adminPool.end();
  }
}

createDatabase();
