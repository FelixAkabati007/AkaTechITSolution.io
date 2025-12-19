import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CookieConsent } from './CookieConsent';
import { Icons } from './Icons';

// Mock the icons to avoid issues if lucide-react is not fully compatible in test env
// But we actually want to test if Icons.Cookie is defined, so maybe we shouldn't mock it entirely?
// Actually, if Icons.Cookie is undefined, rendering <Icons.Cookie /> will throw.
// So we can just rely on the real Icons import. 
// However, if we want to be safe about environment, we can just test if it crashes.

describe('CookieConsent Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage/cookies if needed
    document.cookie = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders without crashing and becomes visible after delay', async () => {
    render(<CookieConsent />);
    
    // Initially not visible
    expect(screen.queryByText(/We value your privacy/i)).toBeNull();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1600);
    });

    // Should be visible now
    // If Icons.Cookie is undefined, this will likely throw an error during render
    expect(screen.getByText(/We value your privacy/i)).toBeDefined();
    expect(screen.getByText(/Customize/i)).toBeDefined();
  });

  it('has Cookie icon defined in Icons', () => {
     expect(Icons.Cookie).toBeDefined();
  });
});
