#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { generateChapterContent } = require('../services/contentGenerator');
const { GEMINI_API_KEY } = require('../config/gemini');

if (!GEMINI_API_KEY) {
    console.error('環境変数 GEMINI_API_KEY が設定されていません。');
    console.error('.env ファイルに GEMINI_API_KEY を設定してください。');
    process.exit(1);
}

async function parseChapterStructure(content) {
    // Extract chapter title (assumes first line is a # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract sections and subsections
    const sections = [];
    let currentSection = null;

    const lines = content.split('\n');
    for (const line of lines) {
        // Match ### headings for sections
        const sectionMatch = line.match(/^###\s+(.+)$/);
        if (sectionMatch) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                title: sectionMatch[1],
                subsections: []
            };
        }
        // Match bullet points for subsections
        else if (currentSection && line.trim().startsWith('-')) {
            const subsection = line.trim().substring(1).trim();
            currentSection.subsections.push(subsection);
        }
    }

    // Add the last section if exists
    if (currentSection) {
        sections.push(currentSection);
    }

    return {
        title,
        sections
    };
}

async function retryChapterGeneration(input, providedStructure = null) {
    try {
        let content;
        let chapter;
        
        // Check if input is a file path
        if (input.endsWith('.md')) {
            // Read the markdown file
            content = await fs.readFile(input, 'utf-8');
            
            // If structure is not provided, try to parse from content
            if (!providedStructure) {
                chapter = await parseChapterStructure(content);
                if (!chapter.title || chapter.sections.length === 0) {
                    console.log('Warning: Could not parse chapter structure from file. Using provided structure if available.');
                }
            }
        } else {
            // Use the provided content directly
            content = input;
            if (!providedStructure) {
                chapter = await parseChapterStructure(content);
            }
        }

        // Use provided structure if available, or fallback to parsed structure
        chapter = providedStructure || chapter;
        
        if (!chapter || !chapter.title || !chapter.sections) {
            throw new Error('No valid chapter structure found. Please provide a chapter structure.');
        }

        // Generate new content
        console.log(`Regenerating content for chapter: ${chapter.title}`);
        const newContent = await generateChapterContent(chapter);

        // If input was a file path, write the new content back to the file
        if (input.endsWith('.md')) {
            await fs.writeFile(input, newContent, 'utf-8');
            console.log(`Successfully regenerated content and saved to: ${input}`);
        } else {
            console.log('\nRegenerated content:');
            console.log(newContent);
        }

        return newContent;
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
if (require.main === module) {
    const input = process.argv[2];
    const structureFile = process.argv[3];
    
    if (!input) {
        console.error('Usage: node retry-chapter.js <markdown-file-or-content> [structure-json-file]');
        console.error('\nStructure JSON format example:');
        console.error(`{
  "title": "Chapter Title",
  "sections": [
    {
      "title": "Section Title",
      "subsections": ["Subsection 1", "Subsection 2"]
    }
  ]
}`);
        process.exit(1);
    }

    (async () => {
        let structure = null;
        if (structureFile) {
            try {
                const structureContent = await fs.readFile(structureFile, 'utf-8');
                structure = JSON.parse(structureContent);
            } catch (error) {
                console.error('Error reading structure file:', error.message);
                process.exit(1);
            }
        }

        await retryChapterGeneration(input, structure);
    })().catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    retryChapterGeneration,
    parseChapterStructure
};
