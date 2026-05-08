import { useState } from "react";
import Inputbox from "../components/InputBox";
import Button from "../components/Button";
import axios from "axios";
import frontImage from "../Images/frontImage.png";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

function LeaveApplication() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [placeToGo, setPlaceToGo] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  async function handleLeaveApplication() {
    try {
      await axios.post(
        `${API_URL}/api/user/send`,
        {
          from: fromDate,
          to: toDate,
          place: placeToGo,
          reason,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      localStorage.setItem(
        "leaveDetails",
        JSON.stringify({
          from: fromDate,
          to: toDate,
          place: placeToGo,
          reason,
        })
      );
      navigate("/waiting");
      alert("Leave application submitted successfully.");
    } catch (e) {
      console.log(e);
      const message = axios.isAxiosError(e)
        ? e.response?.data?.msg || e.response?.data?.message
        : null;
      alert(message || "Failed to submit. Please check your details and try again.");
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#070710]/60 to-[#0a0a18]/60" />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-violet-600/6 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xl font-bold text-white tracking-tight">
            Gate<span className="text-indigo-400">Pass</span>
          </span>
          <h2 className="text-lg font-semibold text-white mt-2">Leave Application</h2>
          <p className="text-white/35 text-xs mt-0.5">
            Fill in the details to request leave
          </p>
        </div>

        <div className="space-y-4">
          {/* Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Inputbox label="From Date" type="date" placeholder="" setValue={setFromDate} />
            <Inputbox label="To Date" type="date" placeholder="" setValue={setToDate} />
          </div>

          <Inputbox
            label="Destination"
            type="text"
            placeholder="Place to visit"
            setValue={setPlaceToGo}
          />

          <div className="w-full">
            <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-widest">
              Reason
            </label>
            <textarea
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for your leave"
              rows={3}
              className="glass-input w-full px-4 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm resize-none"
            />
          </div>

          <div className="pt-1">
            <Button label="Submit Application" onClick={handleLeaveApplication} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveApplication;
