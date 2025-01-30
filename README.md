# AI-Powered Book Content Generator

A Node.js application that leverages Google's Gemini AI to automate the generation and enhancement of technical book content for the Zenn platform.

## Features

- 📚 Automated book content generation
- 🎨 AI-powered cover image creation
- 📊 Book structure analysis and enhancement
- 📝 Content optimization for technical writing
- 🔄 Seamless integration with Zenn platform

## Prerequisites

- Node.js (v18 or higher)
- Google Cloud API key for Gemini AI
- Zenn CLI (optional, for local preview)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Google Cloud API key
```

## Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   ├── services/        # Core services
│   ├── scripts/         # Utility scripts
│   └── utils/          # Helper functions
├── books/              # Generated book content
└── articles/           # Zenn articles
```

## Usage

1. Generate new book content:
```bash
node src/index.js generate
```

2. Analyze existing book structure:
```bash
node src/index.js analyze [book-id]
```

3. Generate book cover:
```bash
node src/index.js cover [book-id]
```

4. Convert SVG cover to PNG:
```bash
node src/scripts/convert-cover.js [book-id]
```

## Services

- **bookAnalyzer**: Analyzes book structure and content for optimization
- **contentGenerator**: Generates technical content using Gemini AI
- **coverGenerator**: Creates AI-powered cover images
- **structureEnhancer**: Improves book structure and organization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
