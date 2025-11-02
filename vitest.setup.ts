
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // No user initially
    return () => {}; // Return an unsubscribe function
  }),
  signOut: vi.fn(() => Promise.resolve()),
  signInAnonymously: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  getAuth: vi.fn(() => ({})),
}));
