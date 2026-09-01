// Displays account methods and lets authenticated users add or change a password.
import React, { useEffect, useState } from "react";
import { BadgeCheck, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    authProviders: [],
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const hasPassword = profile.authProviders.includes("password");

  useEffect(() => {
    authService
      .getProfile()
      .then(({ data }) => setProfile(data))
      .catch((error) => toast.error(error.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    if (newPassword !== confirmation) return toast.error("Passwords do not match.");

    setPasswordLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setProfile(response.data.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      toast.success(response.message);
    } catch (error) {
      toast.error(error.error || error.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const fieldShell =
    "flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-100";
  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-slate-100 focus:border-sky-400 focus:outline-none";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300";

  return (
    <div>
      <PageHeader eyebrow="Your account" title="Profile settings" subtitle="Review your sign-in methods and keep your LearnQuick account secure." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card rounded-[20px] p-6 sm:p-7">
          <h3 className="mb-5 text-lg font-semibold text-white">Account information</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Username</label>
              <div className={fieldShell}><User className="mr-3 h-4 w-4 text-sky-300" />{profile.username}</div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <div className={fieldShell}><Mail className="mr-3 h-4 w-4 text-sky-300" /><span className="truncate">{profile.email}</span></div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile.authProviders.map((provider) => (
                <span key={provider} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold capitalize text-emerald-200">
                  <BadgeCheck className="h-4 w-4" />{provider}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[20px] p-6 sm:p-7">
          <h3 className="mb-1 text-lg font-semibold text-white">
            {hasPassword ? "Change password" : "Add email/password sign-in"}
          </h3>
          <p className="mb-5 text-sm text-slate-400">
            {hasPassword
              ? "Confirm your current password before choosing a new one."
              : "You signed in with Google. Add a password if you also want email login."}
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {hasPassword && (
              <label className="block">
                <span className={labelClass}>Current password</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required className={inputClass} />
                </span>
              </label>
            )}

            {[
              ["New password", newPassword, setNewPassword],
              ["Confirm new password", confirmation, setConfirmation],
            ].map(([label, value, setter]) => (
              <label key={label} className="block">
                <span className={labelClass}>{label}</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="password" value={value} onChange={(event) => setter(event.target.value)} autoComplete="new-password" minLength={6} required className={inputClass} />
                </span>
              </label>
            ))}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Saving..." : hasPassword ? "Change password" : "Add password"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
