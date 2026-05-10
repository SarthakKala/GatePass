import { useState } from "react";
import Heading from "../components/Heading";
import Inputbox from "../components/InputBox";
import Button from "../components/Button";
import axios from "axios";
import frontImage from "../Images/frontImage.png";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSignin() {
    try {
      const res = await axios.post(`${API_URL}/api/user/signin`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dash");
    } catch (e) {
      console.log(e);
      alert("Invalid credentials. Please try again.");
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#070710]/60 via-[#0a0a1a]/40 to-[#070710]/60" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gate<span className="text-indigo-400">Pass</span>
          </span>
        </div>

        <Heading
          heading="Welcome back"
          subheading="New here?"
          log="Create account"
          link="/signup"
        />

        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <Link
            to="/signin"
            className="text-center rounded-xl py-2 text-sm font-semibold text-white bg-indigo-500/25 border border-indigo-400/25"
          >
            Student
          </Link>
          <Link
            to="/adminsignin"
            className="text-center rounded-xl py-2 text-sm font-semibold text-white/45 hover:text-white transition-colors"
          >
            Admin
          </Link>
        </div>

        <div className="space-y-4">
          <Inputbox
            label="Email"
            type="email"
            placeholder="you@example.com"
            setValue={setEmail}
          />
          <Inputbox
            label="Password"
            type="password"
            placeholder="••••••••"
            setValue={setPassword}
          />
          <div className="pt-1">
            <Button label="Sign In" onClick={handleSignin} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
