"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type AuthMode = "login" | "signup";
type ToastType = "success" | "error" | "info";

interface ToastState {
  type: ToastType;
  message: string;
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface LoginResponse {
  message?: string;
  role?: string;
  user?: AuthUser;
}

interface RegisterResponse {
  message?: string;
}

function getRoleTitle(role?: string) {
  if (role === "admin") return "Admin";
  if (role === "volunteer") return "Volunteer";
  return "Member";
}

function getInitial(user: AuthUser) {
  return (user.name ?? user.email).trim().charAt(0).toUpperCase();
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("mode") === "signup"
    ) {
      return "signup";
    }

    return "login";
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<string | undefined>();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (type: ToastType, message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const readJson = async <T,>(response: Response): Promise<T> => {
    const data = (await response.json().catch(() => ({}))) as T;

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Request failed. Please try again.";

      throw new Error(message);
    }

    return data;
  };

  const applyLogin = (data: LoginResponse) => {
    if (!data.user) {
      throw new Error("Login succeeded but no user profile was returned.");
    }

    setCurrentUser(data.user);
    setCurrentRole(data.role);
    setIsDropdownOpen(false);
    setIsProfileModalOpen(false);
    showToast("success", data.message ?? "Logged in successfully.");
  };

  const handleGoogleLogin = () => {
    showToast("info", "Google login is not connected yet.");
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          rememberMe,
        }),
      });

      const data = await readJson<LoginResponse>(response);
      applyLogin(data);
      setLoginPassword("");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!termsAccepted) {
      showToast("error", "Please accept the terms before creating an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupName,
          email: signupEmail,
          phone: signupPhone,
          password: signupPassword,
        }),
      });

      await readJson<RegisterResponse>(registerResponse);

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const loginData = await readJson<LoginResponse>(loginResponse);
      applyLogin(loginData);
      setSignupPassword("");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCurrentUser(null);
      setCurrentRole(undefined);
      setIsDropdownOpen(false);
      setIsProfileModalOpen(false);
      setIsSubmitting(false);
      showToast("info", "You have been logged out.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8] text-[#44403C] font-mali">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border-l-4 bg-white px-5 py-3.5 text-xs font-medium text-stone-800 shadow-lg font-prompt ${
              toast.type === "success"
                ? "border-emerald-400"
                : toast.type === "error"
                  ? "border-red-400"
                  : "border-[#E29578]"
            }`}
            role="status"
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gradient-to-b from-[#FDF0EB]/30 via-[#FCFAF8] to-white p-6">
        <section className="w-full max-w-md rounded-[2rem] border border-stone-200/80 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF0EB] text-2xl shadow-sm">
              <i className="fa-solid fa-paw text-[#C07055]" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">
              {mode === "login" ? "Login to PawMatch" : "Create an account"}
            </h1>
            <p className="mt-2 text-xs text-stone-500 font-prompt">
              {mode === "login"
                ? "Access your account and continue helping animals."
                : "Join the volunteer and adopter community."}
            </p>
          </div>

          {currentUser ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((open) => !open)}
                className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-left transition hover:bg-stone-100"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E29578] bg-[#FDF0EB] text-base font-bold text-[#C07055]">
                  {getInitial(currentUser)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-stone-800">
                    {currentUser.name ?? currentUser.email}
                  </span>
                  <span className="block truncate text-xs text-stone-500 font-prompt">
                    {currentUser.email}
                  </span>
                </span>
                <i className="fa-solid fa-chevron-down text-xs text-stone-400" aria-hidden="true" />
              </button>

              {isDropdownOpen && (
                <div className="rounded-2xl border border-stone-100 bg-white py-2 text-sm shadow-lg font-prompt">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-stone-700 transition hover:bg-[#FDF0EB]/50"
                  >
                    <i className="fa-solid fa-user" aria-hidden="true" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isSubmitting}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}

              <Link
                href="/cases"
                className="block w-full rounded-2xl bg-[#E29578] py-3 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#C07055]"
              >
                Browse cases
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex rounded-2xl bg-stone-100/80 p-1 text-xs font-prompt">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-xl py-2.5 font-medium transition ${
                    mode === "login"
                      ? "bg-white text-[#C07055] shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 rounded-xl py-2.5 font-medium transition ${
                    mode === "signup"
                      ? "bg-white text-[#C07055] shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 py-3 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 font-prompt"
              >
                <span className="font-bold text-[#4285F4]">G</span>
                Continue with Google
              </button>

              <div className="relative mb-4 flex items-center justify-center">
                <div className="w-full border-t border-stone-200" />
                <span className="bg-white px-3 text-[11px] uppercase text-stone-400 font-prompt">
                  or use email
                </span>
                <div className="w-full border-t border-stone-200" />
              </div>

              {mode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-stone-700 font-prompt">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      placeholder="example@mail.com"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs transition focus:border-[#E29578] focus:bg-white focus:outline-none font-prompt"
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="login-password" className="text-xs font-semibold text-stone-700 font-prompt">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast("info", "Password reset is not connected yet.")}
                        className="text-[11px] text-[#C07055] hover:underline font-prompt"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Password"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs transition focus:border-[#E29578] focus:bg-white focus:outline-none font-prompt"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded accent-[#E29578]"
                    />
                    <label htmlFor="remember-me" className="cursor-pointer text-xs text-stone-500 font-prompt">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-[#E29578] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#C07055] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="signup-name" className="mb-1 block text-xs font-semibold text-stone-700 font-prompt">
                      Full name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={signupName}
                      onChange={(event) => setSignupName(event.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs transition focus:border-[#E29578] focus:bg-white focus:outline-none font-prompt"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold text-stone-700 font-prompt">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(event) => setSignupEmail(event.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs transition focus:border-[#E29578] focus:bg-white focus:outline-none font-prompt"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-phone" className="mb-1 block text-xs font-semibold text-stone-700 font-prompt">
                      Phone
                    </label>
                    <input
                      id="signup-phone"
                      type="tel"
                      autoComplete="tel"
                      value={signupPhone}
                      onChange={(event) => setSignupPhone(event.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs transition focus:border-[#E29578] focus:bg-white focus:outline-none font-prompt"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold text-stone-700 font-prompt">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs transition focus:border-[#E29578] focus:bg-white focus:outline-none font-prompt"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#E29578]"
                    />
                    <label htmlFor="terms" className="cursor-pointer text-[11px] leading-tight text-stone-500 font-prompt">
                      I accept the terms of service and animal welfare policy.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-[#E29578] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#C07055] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </main>

      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-[2rem] border border-stone-100 bg-white p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500 hover:bg-stone-200"
              aria-label="Close profile"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>

            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#E29578] bg-[#FDF0EB] text-xl font-bold text-[#C07055]">
                {getInitial(currentUser)}
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-800">
                  {currentUser.name ?? currentUser.email}
                </h2>
                <span className="mt-1 inline-block rounded-full bg-[#FDF0EB] px-2.5 py-0.5 text-[11px] font-semibold text-[#C07055] font-prompt">
                  {getRoleTitle(currentRole)}
                </span>
                <p className="mt-1 text-xs text-stone-400 font-prompt">{currentUser.email}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4 text-xs text-stone-600 font-prompt">
              Your session is active for this browser.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-xl bg-[#E29578] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#C07055]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
