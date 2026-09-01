import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");
    setLoading(true); setError("");
    try {
      const session = await authService.resetPassword(token, password);
      login(session.user, session.token);
      toast.success("Password reset successfully.");
      navigate("/dashboard", { replace: true });
    } catch (requestError) { setError(requestError.error || requestError.message || "The password could not be reset."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout eyebrow="Secure reset" title="Choose a new password" subtitle="Create a password you'll remember. The reset link can only be used once.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {[["New password", password, setPassword], ["Confirm new password", confirmation, setConfirmation]].map(([label, value, setter]) => (
          <label key={label} className="block"><span className="mb-2 block text-xs font-bold text-stone-700 dark:text-stone-300">{label}</span><span className="relative block"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input type="password" value={value} onChange={(event) => setter(event.target.value)} autoComplete="new-password" minLength={6} required className="h-12 w-full rounded-xl border border-stone-300 bg-white pl-11 pr-4 text-sm text-stone-950 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white" aria-label={label} /></span></label>
        ))}
        <p className="text-xs leading-5 text-stone-500">Your new password must contain at least six characters.</p>
        {error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="w-full">Update password</Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
