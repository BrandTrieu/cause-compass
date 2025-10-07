# CauseCompass - Company Ethical Alignment Tracker

A Next.js webapp that profiles companies by alignment with user-selected causes and provides sources, scores, and alternatives.

## Features

- **Personalized Scoring**: Companies are scored based on your weighted preferences for different causes
- **Comprehensive Data**: Each company fact includes confidence levels and source citations
- **AI Summaries**: Get AI-generated summaries tailored to your values (signed-in users) or general ethicality (guests)
- **Better Alternatives**: Discover companies with better ethical alignment in the same category
- **Guest Mode**: Use the app without signing up, with default scoring weights

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Postgres + Auth)
- **ORM**: Prisma
- **AI**: Google Gemini for text generation
- **Hosting**: Vercel

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ethicalbrand"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Database Setup

1. **Set up Supabase**:
   - Create a new Supabase project
   - Get your project URL and anon key from the API settings
   - Copy the database connection string from Settings > Database

2. **Run Prisma migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Seed the database**:
   ```bash
   npm run db:seed
   ```

### 3. Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 4. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Guest Mode
- Search for companies and see results based on overall ethicality
- View company details, per-cause breakdowns, and AI summaries
- No account required

### Signed-in Users
- Set personalized preference weights for different causes
- Get customized company scores based on your values
- AI summaries highlight alignment with your top priorities
- Save and manage your preferences

## Causes Tracked

- **Free Palestine**: Support for Palestinian rights and opposition to Israeli occupation
- **Russia Ukraine**: Position on Russia-Ukraine conflict and support for Ukraine
- **Feminism/Workplace**: Gender equality, women's rights, and workplace diversity
- **Child Labour**: Opposition to child labor and support for children's rights
- **LGBTQ+**: Support for LGBTQ+ rights and equality
- **Animal Cruelty**: Opposition to animal cruelty and support for animal welfare
- **Environment**: Environmental sustainability and climate action
- **Ethical Sourcing**: Ethical supply chain and fair trade practices
- **Data Privacy**: Protection of user data and privacy rights

## Scoring System

Companies receive scores from -1 (conflicts with values) to +1 (aligned with values):

- **Aligned (0.3+)**: Company generally supports your values
- **Mixed (-0.3 to 0.3)**: Company has mixed record on your values  
- **Conflicts (-0.3-)**: Company generally opposes your values

## Data Sources

All company data comes from verified sources including:
- Company sustainability reports
- News articles and investigations
- Third-party assessments
- NGO reports

Each fact includes confidence levels and source citations.

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/companies/search` - Search companies
- `GET /api/companies/[id]` - Get company details
- `GET/POST /api/prefs` - User preferences
- `POST /api/ai/summary` - Generate AI summary

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
