import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, LogOut } from "lucide-react";

export default function Scan() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState<string>("");
  const [detailsError, setDetailsError] = useState("");
  const [exitDone, setExitDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exitTime, setExitTime] = useState("");

  async function allDone() {
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/api/guard/done?id=${id}`);
      setExitTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setExitDone(true);
    } catch (e) {
      alert("An error occurred while logging the exit.");
    } finally {
      setLoading(false);
    }
  }

  async function getDetail() {
    try {
      const res = await axios.get(`http://localhost:3000/api/guard/scan?id=${id}`);
      setName(res.data.name);
      setRollNo(res.data.rollno);
    } catch (e) {
      const message = axios.isAxiosError(e)
        ? e.response?.data?.msg || e.response?.data?.message
        : null;
      setDetailsError(message || "Error fetching student details.");
    }
  }

  useEffect(() => {
    getDetail();
  }, []);

  /* ── Success screen ── */
  if (exitDone) {
    return (
      <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-emerald-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 w-full max-w-sm shadow-2xl text-center">
          {/* Animated check */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40
            flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Exit Logged</h1>
          <p className="text-emerald-400 font-medium text-sm mb-6">
            Student has left the campus
          </p>

          {/* Summary */}
          <div className="glass rounded-2xl p-4 mb-6 text-left space-y-3">
            <div>
              <p className="text-white/35 text-xs uppercase tracking-widest mb-0.5">Student</p>
              <p className="text-white font-semibold text-sm">{name}</p>
            </div>
            <div className="border-t border-white/6 pt-3">
              <p className="text-white/35 text-xs uppercase tracking-widest mb-0.5">Roll No.</p>
              <p className="text-white font-semibold text-sm">{rollNo}</p>
            </div>
            <div className="border-t border-white/6 pt-3">
              <p className="text-white/35 text-xs uppercase tracking-widest mb-0.5">Exit Time</p>
              <p className="text-white font-semibold text-sm">{exitTime}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
            <LogOut className="w-3.5 h-3.5" />
            <span>Gate pass has been invalidated</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Default scan screen ── */
  return (
    <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-teal-600/6 rounded-full blur-3xl pointer-events-none" />

      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center">
        {/* Logo + badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xl font-bold text-white tracking-tight">
            Gate<span className="text-emerald-400">Pass</span>
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            Guard View
          </span>
        </div>

        {/* Status icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20
          flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>

        <h1 className="text-lg font-bold text-white mb-1">Student Authorized</h1>
        <p className="text-white/35 text-xs mb-6">
          {detailsError || "This student is permitted to leave the campus"}
        </p>

        {/* Student details */}
        <div className="glass rounded-2xl p-4 mb-6 text-left space-y-3">
          <div>
            <p className="text-white/35 text-xs uppercase tracking-widest mb-0.5">Name</p>
            <p className="text-white font-semibold text-sm">
              {name || "Loading…"}
            </p>
          </div>
          <div className="border-t border-white/6 pt-3">
            <p className="text-white/35 text-xs uppercase tracking-widest mb-0.5">Roll No.</p>
            <p className="text-white font-semibold text-sm">
              {rollNo || "Fetching…"}
            </p>
          </div>
        </div>

        <button
          onClick={allDone}
          disabled={loading || Boolean(detailsError)}
          className="w-full py-3 sm:py-2.5 rounded-xl font-semibold text-sm text-white
            bg-gradient-to-r from-emerald-500 to-teal-600
            hover:from-emerald-400 hover:to-teal-500
            active:scale-[0.98] transition-all duration-200
            shadow-lg shadow-emerald-500/20
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging exit…" : "Mark Exit Done"}
        </button>
      </div>
    </div>
  );
}
