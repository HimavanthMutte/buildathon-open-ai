# Yojana Sahayak AI 🤖

An AI-powered government schemes discovery platform that helps Indian citizens find and apply for relevant government schemes.

## Features ✨

- 🔍 **Smart Search** - Search schemes by name, description, or benefits
- 🎯 **Advanced Filtering** - Filter by category and state
- 🤖 **AI Assistant** - Interactive AI chatbot to help find schemes based on your needs
- 📱 **Responsive Design** - Beautiful, modern UI that works on all devices
- 🎨 **30+ Government Schemes** - Pre-loaded with central and state schemes

## Tech Stack 🛠️

- **Frontend**: Next.js 14, React, TailwindCSS
- **Icons**: Lucide React
- **Database**: MongoDB (with Mongoose)
- **API**: Next.js API Routes

## Project Structure 📁

```
yojana-sahayak-ai/
│
├── src/app/
│   ├── page.js                 # Home page with filters & search
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── components/
│       ├── SchemeCard.js       # Individual scheme card
│       ├── FilterBar.js        # Category & state filters
│       ├── SearchBar.js        # Search input
│       └── AIAssistant.js      # AI chatbot interface
│
├── pages/
│   └── api/
│       └── schemes.js          # API endpoint for schemes
│
├── data/
│   └── schemes.json            # Static schemes dataset
│
├── lib/
│   └── db.js                   # MongoDB connection
│
├── models/
│   └── Scheme.js               # Mongoose schema
│
└── package.json
```

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yojana-sahayak-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/yojana-sahayak
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yojana-sahayak?retryWrites=true&w=majority
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage 💡

### Search for Schemes
- Use the search bar to find schemes by name or keywords
- Results update in real-time as you type

### Filter Schemes
- Select a category (Agriculture, Health, Education, etc.)
- Select a state (All India, Andhra Pradesh, etc.)
- Combine filters for precise results

### AI Assistant
- Click the "AI Assistant 🤖" button
- Ask questions like:
  - "I'm a farmer, what schemes are available for me?"
  - "Show me health schemes"
  - "What schemes are available for women entrepreneurs?"
- The AI will suggest relevant schemes based on your query

## API Endpoints 🔌

### GET /api/schemes
Fetch schemes with optional filters:
```
GET /api/schemes?category=Agriculture&state=All India&search=farmer
```

### POST /api/schemes
Add a new scheme (optional):
```json
{
  "id": "NEW001",
  "schemeName": "New Scheme",
  "category": "Agriculture",
  "state": "All India",
  ...
}
```

## Available Schemes Categories 📋

- Agriculture
- Health
- Education
- Housing
- Employment
- Women & Child
- Skill Development
- Entrepreneurship
- Microfinance
- Financial Inclusion
- Energy
- Pension
- Insurance
- Livelihood
- Food Security
- Infrastructure
- Sanitation
- Social Security

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is open source and available under the MIT License.

## Acknowledgments 🙏

- Government scheme data compiled from official government sources
- Icons by [Lucide](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/)

---

Made with ❤️ for the citizens of India
