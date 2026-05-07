import { useState } from "react";
import Heading from "../components/Heading";
import Inputbox from "../components/InputBox";
import Button from "../components/Button";
import axios from "axios";
import frontImage from "../Images/frontImage.png";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentEmail, setParentsEmail] = useState("");
  const [hostel, setHostel] = useState("");
  const [rollno, setRollno] = useState("");
  const navigate = useNavigate();

  async function handleSignUp() {
    try {
      const res = await axios.post("http://localhost:3000/api/user/signup", {
        name,
        email,
        password,
        parentEmail,
        rollno,
        hostelName: hostel,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dash");
    } catch (e) {
      console.log(e);
      alert("Could not create account. Please check your details.");
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
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gate<span className="text-indigo-400">Pass</span>
          </span>
        </div>

        <Heading
          heading="Create account"
          subheading="Already registered?"
          log="Sign in"
          link="/signin"
        />

        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <Link
            to="/signup"
            className="text-center rounded-xl py-2 text-sm font-semibold text-white bg-indigo-500/25 border border-indigo-400/25"
          >
            Student
          </Link>
          <Link
            to="/adminsignup"
            className="text-center rounded-xl py-2 text-sm font-semibold text-white/45 hover:text-white transition-colors"
          >
            Admin
          </Link>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Inputbox label="Full Name" type="text" placeholder="Your name" setValue={setName} />
            <Inputbox label="Roll No" type="text" placeholder="e.g. 102203010" setValue={setRollno} />
          </div>
          <Inputbox
            label="Email"
            type="email"
            placeholder="you@example.com"
            setValue={setEmail}
          />
          <Inputbox
            label="Parent's Email"
            type="email"
            placeholder="parent@example.com"
            setValue={setParentsEmail}
          />
          <Inputbox
            label="Hostel Name"
            type="text"
            placeholder="e.g. Kalpana Chawla Bhawan"
            setValue={setHostel}
          />
          <Inputbox
            label="Password (min 6 chars)"
            type="password"
            placeholder="••••••••"
            setValue={setPassword}
          />
          <div className="pt-1">
            <Button label="Create Account" onClick={handleSignUp} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
