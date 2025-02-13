#!/usr/bin/env node
import { TopicsGenerator } from '../services/topicsGenerator.js';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    const generator = new TopicsGenerator();
    
    // Get book path from command line argument or use latest book
    let bookPath = process.argv[2];
    if (!bookPath) {
      // Get latest book directory
      const booksDir = path.join(process.cwd(), 'books');
      const bookDirs = require('fs').readdirSync(booksDir)
        .filter(dir => dir.startsWith('book'))
        .sort()
        .reverse();
      
      if (bookDirs.length === 0) {
        throw new Error('No books found');
      }
      
      bookPath = path.join(booksDir, bookDirs[0]);
    }

    console.log(`Generating topics for book: ${path.basename(bookPath)}`);
    const topics = await generator.generateFromChapterTitles(bookPath);
    
    console.log('\nGenerated Topics:');
    console.log(topics.join(', '));

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
