import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/common/Button";
import authService from "../../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try { const response = await authService.forgotPassword(email); setMessage(response.message); }
    catch (requestError) { setError(requestError.error || requestError.message || "The reset request could not be completed."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout eyebrow="Account recovery" title="Reset your password" subtitle="Enter your account email and we'll send you a secure, one-time reset link.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="reset-email" className="mb-2 block text-xs font-bold text-stone-700 dark:text-stone-300">Email address</label>
          <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="h-12 w-full rounded-xl border border-stone-300 bg-white pl-11 pr-4 text-sm text-stone-950 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white" placeholder="you@example.com" /></div>
        </div>
        {message && <p role="status" className="rounded-xl border border-emerald-300/50 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">{message}</p>}
        {error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="w-full">Send reset link</Button>
      </form>
      <Link to="/login" className="mt-6 flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-300"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
