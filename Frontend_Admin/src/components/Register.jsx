import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";

const initialForm = { username: "", email: "", password: "", confirmPassword: "" };
const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const validate = () => {
    const next = {};

    const username = form.username.trim();
    if (!username) next.username = "Username is required.";
    else if (username.length < 3) next.username = "Username must be at least 3 characters.";
    else if (username.length > 20) next.username = "Username must be 20 characters or fewer.";
    else if (!/^[a-zA-Z0-9._-]+$/.test(username)) next.username = "Use only letters, numbers, dots, dashes, or underscores.";

    const email = form.email.trim();
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = "Include at least one letter and one number.";

    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";

    return next;
  };

  const passwordStrength = (() => {
    const value = form.password;
    if (!value) return null;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  })();

  const strengthMeta = [
    null,
    { label: "Weak", bar: "bg-rose-500", text: "text-rose-600", width: "w-1/4" },
    { label: "Fair", bar: "bg-amber-500", text: "text-amber-600", width: "w-2/4" },
    { label: "Good", bar: "bg-sky-500", text: "text-sky-600", width: "w-3/4" },
    { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600", width: "w-full" },
  ][passwordStrength ?? 0];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.username.trim(), email: form.email.trim(), password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create account.");
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      setIsSubmitting(false);
      setErrors({ form: error.message || "Unable to create account." });
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      errors[field]
        ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
    }`;

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Account created</h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome, <span className="font-medium text-slate-700">{form.username.trim()}</span>! We sent a verification link to{" "}
            <span className="font-medium text-slate-700">{form.email.trim()}</span>.
          </p>
          <button
            type="button"
            onClick={() => onSwitchToLogin?.()}
            className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Go to sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setForm(initialForm);
            }}
            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Create another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start managing your skincare store in minutes.</p>

          {errors.form && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={updateField("username")}
                  placeholder="janedoe"
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  className={`${inputClass("username")} pl-9`}
                />
              </div>
              {errors.username && <p id="username-error" className="mt-1.5 text-xs text-rose-600">{errors.username}</p>}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="password-hint"
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

              {strengthMeta && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${strengthMeta.bar} ${strengthMeta.width} transition-all duration-300`} />
                  </div>
                  <span className={`text-xs font-medium ${strengthMeta.text}`}>{strengthMeta.label}</span>
                </div>
              )}
              <p id="password-hint" className="mt-1.5 text-xs text-slate-400">Use 8+ characters with letters and numbers.</p>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                  className={`${inputClass("confirmPassword")} pl-9 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((current) => !current)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword === form.password && !errors.confirmPassword && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 size={13} /> Passwords match
                </p>
              )}
              {errors.confirmPassword && <p id="confirm-error" className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchToLogin?.()}
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
