# Ratteb

Ratteb is a full-stack scheduling and productivity web application designed to help users organize their study schedules, daily tasks, and reminders in one place.

The application supports both Arabic and English, includes light and dark themes, and provides browser push notifications for task reminders.

## Features

### Study Schedule

- Create, edit, and delete courses.
- Add multiple weekly meetings for each course.
- View the schedule by day or by week.
- Automatically sort courses by time.
- Detect scheduling conflicts between courses.
- Edit or delete a single meeting or the entire course.
- Delete the complete study schedule when needed.

### Daily Planner

- Create and manage daily tasks.
- Add optional start and end times.
- Add notes to tasks.
- Mark tasks as completed.
- Create recurring tasks:
  - Daily
  - Weekly
  - Multiple custom dates
- Edit or delete a single task or an entire recurring series.
- Navigate between dates using the calendar.

### Reminders and Notifications

- Browser push notifications using Web Push.
- Reminders at:
  - Task time
  - 10 minutes before
  - 15 minutes before
  - 30 minutes before
  - 1 hour before
  - Custom reminder time
- Notification subscriptions can be enabled or disabled from the account page.
- Reminder delivery is handled through a Supabase Edge Function.

### Authentication and Account Management

- Account registration and login.
- Email verification.
- Password reset.
- Change email address.
- Change password.
- Secure account deletion.
- Protected application routes.
- Cloudflare Turnstile CAPTCHA protection for authentication flows.

### User Experience

- Arabic and English support.
- RTL support for Arabic.
- Light and dark themes.
- Responsive interface.
- Accessible labels and status messages.
- Privacy Policy and Terms of Use pages.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- i18next
- Supabase JavaScript Client
- Lucide React
- Cloudflare Turnstile
- Web Push / Service Workers

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- Supabase
- HTTPX

### Database and Services

- Supabase Authentication
- Supabase PostgreSQL Database
- Supabase Edge Functions
- Vercel
- Render
- Cloudflare Turnstile
- Web Push

## Project Structure

```text
Rattib/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── lib/
│       ├── locales/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── types/
│
├── backend/
│   └── app/
│       ├── dependencies/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       ├── config.py
│       ├── main.py
│       └── supabase_client.py
│
├── supabase/
│   └── functions/
│       └── send-task-reminders/
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python
- Git

A Supabase project is also required to use authentication, database features, and reminders.

## Frontend Setup

Open a terminal inside the `frontend` directory:

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`.

Required frontend environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_URL=http://127.0.0.1:8000
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

Start the frontend development server:

```bash
npm run dev
```

The development server normally runs at:

```text
http://localhost:5173
```

## Backend Setup

Open another terminal inside the `backend` directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it.

### Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`.

Required backend environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start the FastAPI development server:

```bash
python -m uvicorn app.main:app --reload
```

The backend normally runs at:

```text
http://127.0.0.1:8000
```

The API health endpoint is available at:

```text
/api/health
```

## Supabase Edge Function

Task reminder notifications are processed by:

```text
supabase/functions/send-task-reminders/
```

The reminder function requires the following secrets:

```env
VAPID_SUBJECT=your_vapid_subject
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
REMINDER_CRON_SECRET=your_reminder_cron_secret
```

Supabase also provides the required project credentials to the Edge Function environment.

## Development Commands

From the `frontend` directory:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Create a production frontend build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Security

Ratteb includes several security measures:

- Supabase authentication.
- Protected frontend routes.
- Backend authentication validation.
- Cloudflare Turnstile CAPTCHA.
- Restricted CORS origins.
- Server-side Supabase secret keys.
- Protected reminder worker requests.
- Password policy validation.

Sensitive environment variables and secret keys must never be committed to the repository.

## Deployment

The application architecture supports:

- **Frontend:** Vercel
- **Backend:** Render
- **Authentication and Database:** Supabase
- **Background Reminder Worker:** Supabase Edge Functions

Production environment variables must be configured separately from development credentials.

## Developer

**Khalaf Alshammari**  
Software Engineer

- GitHub: https://github.com/khalaf-alsh
- LinkedIn: https://www.linkedin.com/in/khalaf-alshammari-251b22392/
- Email: khratteb@gmail.com
