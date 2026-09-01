import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const inputClass = "h-12 w-full rounded-xl border border-stone-300 bg-white pl-11 pr-4 text-sm font-medium text-stone-950 placeholder-stone-400 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await authService.login(email, password);
      login(session.user, session.token);
      toast.success("Welcome back to LearnQuick.");
      navigate("/dashboard");
    } catch (requestError) {
      const message = requestError.error || requestError.message || "Unable to sign in.";
      setError(message);
      toast.error(message);
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Continue learning" subtitle="Sign in with Google or use your LearnQuick email and password.">
      <SocialAuthButtons />
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-xs font-bold text-stone-700 dark:text-stone-300">Email address</label>
          <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input id="login-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required className={inputClass} /></div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between"><label htmlFor="login-password" className="text-xs font-bold text-stone-700 dark:text-stone-300">Password</label><Link to="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-300">Forgot password?</Link></div>
          <div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input id="login-password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" required className={inputClass} /></div>
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="w-full">Sign in{!loading && <ArrowRight className="h-4 w-4" />}</Button>
      </form>
      <p className="mt-7 border-t border-stone-200 pt-6 text-center text-sm text-stone-600 dark:border-white/10 dark:text-stone-400">New to LearnQuick?{" "}<Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 dark:text-orange-300">Create an account</Link></p>
    </AuthLayout>
  );
};

export default LoginPage;
