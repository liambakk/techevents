# London Tech Events Hub 🚀

A comprehensive Next.js application for tracking and managing tech events in London, fully integrated with Airtable as the backend database.

## Features ✨

- **Dashboard View**: Statistics, must-attend events, and upcoming events
- **Calendar View**: Monthly calendar with event visualization
- **List View**: Searchable and filterable list of all events
- **Airtable Integration**: Real-time data sync with your Airtable base
- **Event Registration**: Track and update registration status
- **iCal Export**: Export filtered events to calendar applications
- **Responsive Design**: Works perfectly on desktop and mobile
- **Advanced Filtering**: Filter by category, type, cost, and priority

## Quick Start 🚀

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Airtable

Create a `.env.local` file with your Airtable credentials:

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_EVENTS_TABLE_ID=tblXXXXXXXXXXXXXX
```

#### Getting Airtable Credentials:

1. **Personal Access Token**:
   - Go to https://airtable.com/create/tokens
   - Create a new token with scopes: `data.records:read`, `data.records:write`
   - Add your specific base to the token's access list

2. **Base ID**:
   - Go to https://airtable.com/api
   - Select your base
   - Copy the base ID from the documentation URL

3. **Table ID**:
   - Usually "Events" or check your Airtable base

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Airtable Schema 📊

Your Airtable base should have these fields:

- Event Name (Single line text)
- Event Type (Single select)
- Category (Multiple select)
- Date Start (Date with time)
- Date End (Date with time)
- Venue (Single line text)
- Address (Long text)
- Format (Single select)
- Cost (Currency)
- Cost Type (Single select)
- Description (Long text)
- Website (URL)
- Registration Link (URL)
- Target Audience (Multiple select)
- Priority (Single select)
- Status (Single select)

## Deployment 🌐

### Deploy to Vercel

```bash
npx vercel
```

Add environment variables in Vercel dashboard.

### Deploy to Netlify

```bash
npm run build
```

Deploy the `.next` folder.

## Tech Stack 🛠

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Airtable
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **State Management**: React Hooks + SWR

## Support 💬

For issues or questions:
- Airtable API: https://airtable.com/developers/web/api
- Next.js: https://nextjs.org/docs

## License 📄

MIT License