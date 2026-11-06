import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../lib/api";

// Safe JWT decoder for Google ID tokens (HS256/RS256, base64url payload)
const jwtDecode = (token) => {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Invalid JWT");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  const json = decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join("")
  );

  return JSON.parse(json);
};

import { AlertCircle, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";

const initialForm = { email: "", password: "", remember: false };
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

const saveToken = (token, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", token);
};

function Login({ onSwitchToRegister, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const validate = () => {
    const next = {};
    const email = form.email.trim();
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to sign in.");
      saveToken(data.token, form.remember);
      onSuccess?.(data.user);
    } catch (error) {
      setErrors({ form: error.message || "Unable to sign in." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});
    setIsGoogleLoading(true);
    try {
      const data = await api("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const googleUser = jwtDecode(credentialResponse.credential);
      saveToken(data.token, form.remember);
      onSuccess?.({
        provider: "google",
        email: data.user?.email || googleUser.email,
        name: data.user?.name || googleUser.name,
        picture: data.user?.avatar || googleUser.picture,
      });
    } catch (error) {
      console.error("Google login failed:", error);
      setErrors({ form: error.message || "Google sign-in failed. Please try again." });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ form: "Google sign-in was cancelled or failed." });
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      errors[field]
        ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">GlowSkin</p>
            <p className="text-xs text-slate-500">Skincare dashboard</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue managing your store.</p>

          {errors.form && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or sign in with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="jane@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`${inputClass("email")} pl-9`}
                />
              </div>
              {errors.email && <p id="email-error" className="mt-1.5 text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => window.location.assign("/forgot-password")}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`${inputClass("password")} pl-9 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(event) => setForm((current) => ({ ...current, remember: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-200"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or continue with Google</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div>
            {!googleClientId ? (
              <div className="flex h-10 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-center text-xs text-amber-700">
                Google sign-in is not configured.
              </div>
            ) : isGoogleLoading ? (
              <div className="flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-500">
                Signing in with Google...
              </div>
            ) : (
              <div className="flex w-full justify-center overflow-hidden [&>div]:w-full [&>div>div]:w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  width="360"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchToRegister?.()}
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Create one
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By signing in you agree to our{" "}
          <a href="/terms" className="underline hover:text-slate-600">Terms</a> and{" "}
          <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default Login;
