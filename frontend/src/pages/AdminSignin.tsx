import { useState } from "react";
import Inputbox from "../components/InputBox";
import axios from "axios";
import frontImage from "../Images/frontImage.png";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../lib/config";

function AdminSignin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSignin() {
    try {
      const res = await axios.post(`${API_URL}/api/admin/signin`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/admindash");
    } catch (e) {
      console.log(e);
      alert("Invalid admin credentials.");
    }
  }

  return (
    <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
      {/* Background image — replace frontend/src/Images/frontImage.jpg with your own */}
      <img
        src={frontImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#070710]/60 via-[#0d0a1a]/40 to-[#070710]/60" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl">
        {/* Logo + badge */}
        <div className="text-center mb-6">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gate<span className="text-violet-400">Pass</span>
          </span>
          <div className="mt-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Admin Sign In</h1>
          <p className="text-white/40 text-sm">
            No account?{" "}
            <Link to="/adminsignup" className="text-violet-400 hover:text-violet-300 transition-colors">
              Register here
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <Inputbox label="Email" type="email" placeholder="admin@example.com" setValue={setEmail} />
          <Inputbox label="Password" type="password" placeholder="••••••••" setValue={setPassword} />
          <div className="pt-1">
            <button
              onClick={handleSignin}
              className="w-full py-3 sm:py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-violet-500 to-purple-600
                hover:from-violet-400 hover:to-purple-500
                active:scale-[0.98] transition-all duration-200
                shadow-lg shadow-violet-500/25"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignin;
