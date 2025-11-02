
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/dashboard/Header';
import { FirebaseProvider } from '../firebase/provider';
import { Auth, User } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';

// Mock Firebase services
const mockAuth = {
  onAuthStateChanged: vi.fn(),
} as unknown as Auth;

const mockFirebaseApp = {} as unknown as FirebaseApp;
const mockFirestore = {} as unknown as Firestore;

describe('Header component', () => {
  it('should render the header with the correct title', () => {
    render(
      <FirebaseProvider
        firebaseApp={mockFirebaseApp}
        firestore={mockFirestore}
        auth={mockAuth}
      >
        <Header />
      </FirebaseProvider>
    );
    const headingElement = screen.getByRole('heading', { name: /GOLDEN HEART HUB/i });
    expect(headingElement).toBeInTheDocument();
  });
});
