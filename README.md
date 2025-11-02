# Golden Heart Hub

Golden Heart Hub is a Next.js application designed to help users track their daily Islamic practices, including prayers and Dhikr, and to learn the 99 names of Allah.

## Features

- **Daily Prayer Counter:** Tracks the completion of daily prayers (Subh/Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha).
- **Dhikr Tracker:** Allows users to track their daily Dhikr (remembrance) goal, with customizable increments and a progress bar.
- **99 Names of Allah Mastery:** Presents the 99 names of Allah with their meanings.
- **Dhikr Mastery:** Allows users to manually input Dhikrs for study.
- **Day Streak Counter:** Tracks the user's consecutive days of completing at least 5 prayers.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/golden-heart-hub.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a `.env.local` file in the root of your project and add your Firebase configuration:
   ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Running the Application

```sh
npm run dev
```

### Running Tests

```sh
npm run test
```
