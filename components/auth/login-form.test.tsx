import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./login-form";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";

// Mock the useAuth hook
vi.mock("./auth-provider", () => ({
  useAuth: vi.fn(),
}));

describe("LoginForm", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
    });
    
    // useRouter is already mocked in vitest.setup.ts
    const mockPush = vi.fn();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
    });
  });

  it("should render the login form", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Se connecter/i })).toBeInTheDocument();
  });

  it("should show error message on failed login", async () => {
    mockLogin.mockResolvedValue({ success: false, error: "Invalid credentials" });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("should redirect on successful login", async () => {
    const mockPush = vi.fn();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
    });
    mockLogin.mockResolvedValue({ success: true });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/tables");
    });
  });

  it("should disable button while loading", async () => {
    // Return a promise that doesn't resolve immediately
    mockLogin.mockReturnValue(new Promise(() => {}));
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

    expect(screen.getByRole("button", { name: /Connexion en cours.../i })).toBeDisabled();
  });
});
