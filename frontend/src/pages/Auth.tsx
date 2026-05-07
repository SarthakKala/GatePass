import axios from "axios";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ShieldCheck } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/api/user/auth?token=${token}`);
      setAuthorized(true);
    } catch (e) {
      const message = axios.isAxiosError(e)
        ? e.response?.data?.msg || e.response?.data?.message
        : null;
      alert(message || "Authorization failed. The link may have expired or already been used.");
    } finally {
      setLoading(false);
    }
  }

  if (authorized) {
    return (
      <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-teal-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 w-full max-w-sm shadow-2xl text-center">
          <div className="mb-6">
            <span className="text-xl font-bold text-white tracking-tight">
              Gate<span className="text-emerald-400">Pass</span>
            </span>
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40
            flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Leave Authorized</h1>
          <p className="text-emerald-400 font-medium text-sm mb-6">
            Parent verification completed successfully.
          </p>

          <div className="glass rounded-2xl p-4 text-left">
            <p className="text-white/70 text-sm leading-relaxed">
              The student has been notified. The request will now move to admin
              approval before the QR gate pass is generated.
            </p>
          </div>

          <p className="text-white/25 text-xs mt-5">
            This authorization link has now been used.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 w-full max-w-sm shadow-2xl text-center">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-xl font-bold text-white tracking-tight">
            Gate<span className="text-indigo-400">Pass</span>
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-500/20
          flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Parent Authorization</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Your ward has submitted a leave request.
          <br />
          Tap below to authorize it.
        </p>

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-3 sm:py-2.5 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-indigo-500 to-violet-600
            hover:from-indigo-400 hover:to-violet-500
            active:scale-[0.98] transition-all duration-200
            shadow-lg shadow-indigo-500/25
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Authorizing..." : "Authorize Leave"}
        </button>

        <p className="text-white/20 text-xs mt-5">
          This link can only be used once.
        </p>
      </div>
    </div>
  );
}
