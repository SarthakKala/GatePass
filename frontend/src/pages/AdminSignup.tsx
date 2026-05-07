import { useState } from "react";
import Inputbox from "../components/InputBox";
import axios from "axios";
import frontImage from "../Images/frontImage.png";
import { useNavigate, Link } from "react-router-dom";

function AdminSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostel, setHostel] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const navigate = useNavigate();

  async function handleSignUp() {
    try {
      const res = await axios.post("http://localhost:3000/api/admin/signup", {
        name,
        email,
        password,
        hostelName: hostel,
        adminCode,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/admindash");
    } catch (e) {
      console.log(e);
      const message = axios.isAxiosError(e)
        ? e.response?.data?.msg || e.response?.data?.error
        : null;
      alert(message || "Could not register admin. Please check the admin access code.");
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
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

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
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Register Admin</h1>
          <p className="text-white/40 text-sm">
            Already have an account?{" "}
            <Link to="/adminsignin" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <Link
            to="/signup"
            className="text-center rounded-xl py-2 text-sm font-semibold text-white/45 hover:text-white transition-colors"
          >
            Student
          </Link>
          <Link
            to="/adminsignup"
            className="text-center rounded-xl py-2 text-sm font-semibold text-white bg-violet-500/25 border border-violet-400/25"
          >
            Admin
          </Link>
        </div>

        <div className="space-y-4">
          <Inputbox label="Full Name" type="text" placeholder="Admin name" setValue={setName} />
          <Inputbox label="Email" type="email" placeholder="admin@example.com" setValue={setEmail} />
          <Inputbox label="Hostel Name" type="text" placeholder="e.g. Kalpana Chawla Bhawan" setValue={setHostel} />
          <Inputbox label="Password" type="password" placeholder="••••••••" setValue={setPassword} />
          <Inputbox label="Admin Access Code" type="password" placeholder="Enter demo admin code" setValue={setAdminCode} />
          <div className="pt-1">
            <button
              onClick={handleSignUp}
              className="w-full py-3 sm:py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-violet-500 to-purple-600
                hover:from-violet-400 hover:to-purple-500
                active:scale-[0.98] transition-all duration-200
                shadow-lg shadow-violet-500/25"
            >
              Create Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;
