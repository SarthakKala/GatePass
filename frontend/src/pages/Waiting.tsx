import axios from "axios";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

export default function Waiting() {
  const [parent, setParent] = useState<boolean>(false);
  const [admin, setAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [id, setId] = useState<string>("");
  const navigate = useNavigate();

  async function checkUpdates() {
    try {
      const res = await axios.get(`${API_URL}/api/user/me`, {
        headers: {
          authorization: localStorage.getItem("token"),
        },
      });
      const user = res.data;
      setId(user.id);
      setParent(user.parentAuth || false);
      setAdmin(user.adminAuth || false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkUpdates();
    const interval = setInterval(checkUpdates, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (parent && admin) {
      navigate(`/qr?id=${id}`);
    }
  });

  return (
    <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl pointer-events-none" />

      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-xl font-bold text-white tracking-tight">
            Gate<span className="text-indigo-400">Pass</span>
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-2">Application Status</h2>
          <p className="text-white/35 text-xs mt-0.5">Checking every 5 seconds</p>
        </div>

        {/* Steps */}
        <div className="relative pl-3 sm:pl-6">
          {/* Vertical line */}
          <div className="absolute left-[12px] sm:left-[18px] top-4 bottom-4 w-px bg-white/8 rounded-full" />

          <Step label="Application Sent" status={loading ? "loading" : "done"} />
          <Step label="Parent Verification" status={loading ? "loading" : parent ? "done" : "pending"} />
          <Step label="Admin Approval" status={loading ? "loading" : admin ? "done" : "pending"} />
        </div>

        {parent && admin && (
          <p className="text-center text-indigo-400 text-sm mt-6 font-medium">
            All done! Redirecting to your QR code…
          </p>
        )}
      </div>
    </div>
  );
}

interface StepProps {
  label: string;
  status: "pending" | "done" | "loading";
}

function Step({ label, status }: StepProps) {
  return (
    <div className="relative flex items-center gap-3 sm:gap-4 py-3.5">
      <div
        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0
          border transition-colors duration-300
          ${status === "done"
            ? "bg-indigo-500/20 border-indigo-500/40"
            : status === "loading"
            ? "bg-white/5 border-white/15"
            : "bg-white/3 border-white/8"
          }`}
      >
        {status === "done" && <CheckCircle className="text-indigo-400 w-5 h-5" />}
        {status === "loading" && <Loader2 className="text-white/40 w-5 h-5 animate-spin" />}
        {status === "pending" && <XCircle className="text-white/20 w-5 h-5" />}
      </div>

      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          status === "done"
            ? "text-indigo-300"
            : status === "loading"
            ? "text-white/50"
            : "text-white/25"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
