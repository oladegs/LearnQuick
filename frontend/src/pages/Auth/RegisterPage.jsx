import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const inputClass = "h-12 w-full rounded-xl border border-stone-300 bg-white pl-11 pr-4 text-sm font-medium text-stone-950 placeholder-stone-400 transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
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
      const session = await authService.register(username, email, password);
      login(session.user, session.token);
      toast.success("Your learning workspace is ready.");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message = requestError.error || requestError.message || "Unable to create your account.";
      setError(message);
      toast.error(message);
    } finally { setLoading(false); }
  };

  const fields = [
    { id: "register-username", label: "Username", type: "text", value: username, setter: setUsername, autoComplete: "username", placeholder: "Your display name", Icon: User },
    { id: "register-email", label: "Email address", type: "email", value: email, setter: setEmail, autoComplete: "email", placeholder: "you@example.com", Icon: Mail },
    { id: "register-password", label: "Password", type: "password", value: password, setter: setPassword, autoComplete: "new-password", placeholder: "At least 6 characters", Icon: Lock },
  ];

  return (
    <AuthLayout eyebrow="Start learning" title="Create your workspace" subtitle="Use Google for a quick start, or create an email and password account.">
      <SocialAuthButtons />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {fields.map(({ id, label, type, value, setter, autoComplete, placeholder, Icon }) => (
          <div key={id}>
            <label htmlFor={id} className="mb-2 block text-xs font-bold text-stone-700 dark:text-stone-300">{label}</label>
            <div className="relative"><Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input id={id} name={id.replace("register-", "")} type={type} value={value} onChange={(event) => setter(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} minLength={type === "password" ? 6 : type === "text" ? 3 : undefined} required className={inputClass} /></div>
          </div>
        ))}
        <p className="text-xs leading-5 text-stone-500">Use at least six characters. You can connect Google to the same email later.</p>
        {error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="w-full">Create account{!loading && <ArrowRight className="h-4 w-4" />}</Button>
      </form>
      <p className="mt-7 border-t border-stone-200 pt-6 text-center text-sm text-stone-600 dark:border-white/10 dark:text-stone-400">Already have an account?{" "}<Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-300">Sign in</Link></p>
    </AuthLayout>
  );
};

export default RegisterPage;
