
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('Error: No DB Connection String found.');
        process.exit(1);
    }

    console.log(`Connecting to database...`);

    // Force SSL rejection off
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();

        const schemaPath = path.join(__dirname, '../supabase/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema.sql...');
        await client.query(schemaSql);

        console.log('Successfully initialized database schema!');
    } catch (err) {
        console.error('Error initializing database:', err);
        // If strict SSL error, suggest user action
        if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
            console.error('\nNOTE: SSL Certificate verification failed. Ensure "sslmode=no-verify" or similar is used, or the script forces rejectUnauthorized: false (which it tries to do).');
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

initDB();
