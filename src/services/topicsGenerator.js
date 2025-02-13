import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { genAI, generationConfig, GEMINI_MODEL } from '../config/gemini.js';

export class TopicsGenerator {
  /**
   * Uses Gemini AI to generate topics from a title
   * @param {string} title - The chapter title to analyze
   * @returns {Promise<string[]>} Array of topics
   */
  async generateTopicsFromTitle(title, chapters = []) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      
      const prompt = `
      Extract key technical topics without space from this book title and its chapters. Return only the topics as a comma-separated list.
      Remove any chapter numbers or common words. Focus on technical terms and concepts.
      
      Book Title: "${title}"
      
      Chapters:
      ${chapters.map(ch => `- ${ch.title}`).join('\n')}
      
      For example, from a Solidity book, you might extract: solidity, smart-contracts, ethereum, web3, dapp, blockchain, gas optimization, etc.
      Return at least 5 relevant topics if possible.
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }]}],
        generationConfig,
      });

      const text = result.response.text();
      const topics = [...new Set(text
        .split(',')
        .map(topic => topic.trim().toLowerCase())
        .filter(topic => topic.length > 0)
      )];

      // Ensure we have at least some default topics if Gemini fails to provide enough
      if (topics.length < 3) {
        const defaultTopics = ['programming', 'development', 'technology'];
        topics.push(...defaultTopics);
      }

      return Array.from(new Set(topics)); // Remove duplicates
    } catch (error) {
      console.error('Error generating topics with Gemini:', error);
      return [];
    }
  }

  /**
   * Generates topics from chapter titles in a book using Gemini AI
   * @param {string} bookPath - Path to the book directory
   * @returns {Promise<string[]>} Array of extracted topics
   */
  async generateFromChapterTitles(bookPath) {
    try {
      // Read config.yaml to get chapter ordering
      const configPath = path.join(bookPath, 'config.yaml');
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(configContent);

      const allTopics = new Set();

      // Process each chapter
      for (const chapterId of config.chapters) {
        const chapterPath = path.join(bookPath, `${chapterId}.md`);
        const chapterContent = fs.readFileSync(chapterPath, 'utf8');

        // Extract title from markdown frontmatter
        const titleMatch = chapterContent.match(/^title:\s*"([^"]+)"/m);
        if (titleMatch) {
          const title = titleMatch[1];
          const topics = await this.generateTopicsFromTitle(title);
          topics.forEach(topic => allTopics.add(topic));
        }
      }

      return Array.from(allTopics);
    } catch (error) {
      console.error('Error generating topics:', error);
      return [];
    }
  }

  /**
   * Generates topics from multiple books
   * @param {string} booksPath - Path to the books directory
   * @returns {Object} Map of book IDs to their topics
   */
  async generateFromAllBooks(booksPath) {
    const results = {};
    
    try {
      const bookDirs = fs.readdirSync(booksPath);
      
      for (const bookDir of bookDirs) {
        const bookPath = path.join(booksPath, bookDir);
        if (fs.statSync(bookPath).isDirectory()) {
          const topics = await this.generateFromChapterTitles(bookPath);
          if (topics.length > 0) {
            results[bookDir] = topics;
          }
        }
      }
    } catch (error) {
      console.error('Error processing books:', error);
    }

    return results;
  }
}
