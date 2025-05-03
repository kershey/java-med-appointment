# Java Medical Clinic

A comprehensive web-based Medical Appointment System built with Next.js and Firebase.

## Features

- User authentication (register, login, password reset)
- Multi-role support (Patient, Doctor, Staff, Admin)
- Doctor management
- Appointment booking and management
- Patient records
- Payment integration
- Dashboards and reporting
- Notification system

## Tech Stack

- **Frontend**: Next.js (React framework)
- **UI Framework**: Shadcn UI + Tailwind CSS
- **Backend/Database**: Firebase
  - Firestore for database
  - Firebase Authentication
  - Firebase Storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/java-med-appointment.git
cd java-med-appointment
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up Firebase

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Get your Firebase config from Project Settings

4. Create a `.env.local` file in the root directory with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. Start the development server

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/
├── app/               # Next.js app directory
│   ├── auth/          # Authentication pages
│   │   ├── login/     # Login page
│   │   ├── register/  # Registration page
│   │   └── password-reset/ # Password reset page
│   ├── dashboard/     # Dashboard pages
│   ├── firebase/      # Firebase configuration
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions
├── components/        # Shadcn UI components
├── public/            # Static assets
└── ...
```

## Development Roadmap

### Phase 1: Setup & Authentication ✅

1. Initialize Next.js project with TypeScript
2. Configure Firebase and set up authentication
3. Create login, registration, and password reset pages
4. Implement responsive layout detection
5. Set up basic navigation and routing

### Phase 2: User & Doctor Management

1. Create user profile management
2. Implement doctor listing and filtering
3. Build doctor profile pages
4. Set up admin interfaces for user management
5. Implement role-based access control

### Phase 3: Appointment System

1. Create appointment booking interface
2. Implement calendar views for scheduling
3. Build queue management system
4. Develop appointment status tracking
5. Set up real-time updates for appointments

### Phase 4: Medical Records & Diagnosis

1. Create patient medical record interfaces
2. Implement diagnosis recording for doctors
3. Build prescription management
4. Develop medical history viewing
5. Set up secure access controls for medical data

### Phase 5: Payment & Notifications

1. Implement payment status tracking
2. Set up GCash integration (or mockup)
3. Create notification system
4. Implement appointment reminders
5. Build payment confirmation flows

### Phase 6: Reporting & Finalization

1. Develop dashboard with statistics
2. Create reporting interfaces
3. Implement data export functionality
4. Optimize performance
5. Test and debug all features

## License

This project is licensed under the MIT License - see the LICENSE file for details.
