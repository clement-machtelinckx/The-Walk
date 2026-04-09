import "@testing-library/jest-dom";
import { vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Mock Supabase to avoid real network calls
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  })),
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Mock Next.js navigation
export const mockPush = vi.fn();
export const mockRefresh = vi.fn();
export const mockBack = vi.fn();
export const mockReplace = vi.fn();
export const mockPrefetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    refresh: mockRefresh,
  })),
  usePathname: vi.fn(() => ""),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
}));
