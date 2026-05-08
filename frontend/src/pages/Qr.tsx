import QRCode from "react-qr-code";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Download, Home } from "lucide-react";
import { API_URL, FRONTEND_URL } from "../lib/config";

interface LeaveDetails {
  from: string;
  to: string;
  place: string;
  reason: string;
}

const getStoredLeaveDetails = (): LeaveDetails | null => {
  const rawDetails = localStorage.getItem("leaveDetails");

  if (!rawDetails) {
    return null;
  }

  try {
    return JSON.parse(rawDetails) as LeaveDetails;
  } catch {
    return null;
  }
};

function QrCode() {
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const qrValue = `${FRONTEND_URL}/scan?id=${id}`;

  const [exitDone, setExitDone] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [leaveDetails] = useState<LeaveDetails | null>(getStoredLeaveDetails);

  useEffect(() => {
    const checkExitStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: token },
        });
        const { name, rollno, parentAuth, adminAuth } = res.data;
        setStudentName(name || "");
        setRollNo(rollno || "");

        // Guard marking exit done resets both flags to false
        if (!parentAuth && !adminAuth) {
          setExitTime(
            new Date().toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })
          );
          setExitDone(true);
          return true;
        }
      } catch {
        // silently ignore polling errors
      }

      return false;
    };

    checkExitStatus();
    const interval = setInterval(async () => {
      const isDone = await checkExitStatus();
      if (isDone) {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

  const downloadReturnPass = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1250;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      alert("Could not create return pass image.");
      return;
    }

    ctx.fillStyle = "#070710";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1e1b4b");
    gradient.addColorStop(0.55, "#111122");
    gradient.addColorStop(1, "#312e81");
    ctx.fillStyle = gradient;
    roundRect(ctx, 70, 70, 760, 1110, 42);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    roundRect(ctx, 70, 70, 760, 1110, 42);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 42px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GatePass", 450, 150);

    ctx.fillStyle = "#a5b4fc";
    ctx.font = "700 34px Arial";
    ctx.fillText("Return Pass", 450, 220);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 46px Arial";
    ctx.fillText("Exit Verified", 450, 305);

    ctx.fillStyle = "#a5b4fc";
    ctx.font = "500 24px Arial";
    ctx.fillText("Your exit has been validated by the guard", 450, 348);

    drawDetail(ctx, 130, 430, "Student", studentName || "Student");
    drawDetail(ctx, 130, 515, "Roll No.", rollNo || "Not available");
    drawDetail(ctx, 130, 600, "Exit Confirmed", exitTime || "Just now");
    drawDetail(ctx, 130, 705, "From", leaveDetails?.from || "Not available");
    drawDetail(ctx, 130, 790, "To", leaveDetails?.to || "Not available");
    drawDetail(ctx, 130, 875, "Destination", leaveDetails?.place || "Not available");
    drawDetail(ctx, 130, 960, "Reason", leaveDetails?.reason || "Not available", 620);

    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.font = "500 23px Arial";
    ctx.textAlign = "center";
    wrapCanvasText(
      ctx,
      "Keep this return pass on your device and show it to the guard when returning to college.",
      450,
      1090,
      650,
      32
    );

    ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
    ctx.font = "500 20px Arial";
    ctx.fillText("Gate pass has been invalidated after verified exit", 450, 1150);

    const imageUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "gatepass-return-pass.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Exit confirmed screen ── */
  if (exitDone) {
    return (
      <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl text-center bg-[#111122]/80">
            {/* Big animated check */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400/40
              flex items-center justify-center mx-auto mb-5 animate-pulse">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <span className="text-xl font-bold text-white tracking-tight">
                Gate<span className="text-indigo-400">Pass</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                Return Pass
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Exit Verified</h1>
            <p className="text-indigo-400 font-medium text-sm mb-6">
              Your exit has been validated by the guard
            </p>

            <div className="glass rounded-2xl p-4 mb-4 text-left space-y-3">
              <Detail label="Student" value={studentName || "Student"} />
              <Detail label="Roll No." value={rollNo || "Not available"} />
              <Detail label="Exit Confirmed" value={exitTime || "Just now"} />
            </div>

            <div className="glass rounded-2xl p-4 mb-5 text-left space-y-3">
              <Detail label="From" value={leaveDetails?.from || "Not available"} />
              <Detail label="To" value={leaveDetails?.to || "Not available"} />
              <Detail label="Destination" value={leaveDetails?.place || "Not available"} />
              <Detail label="Reason" value={leaveDetails?.reason || "Not available"} />
            </div>

            <div className="glass rounded-2xl p-4 mb-5">
              <p className="text-white/75 text-sm leading-relaxed">
                Keep this return pass on your device and show it to the guard when
                returning to college.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
              <Home className="w-3.5 h-3.5" />
              <span>Gate pass has been invalidated after verified exit</span>
            </div>
          </div>

          <button
            onClick={downloadReturnPass}
            className="mt-5 w-full py-3 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-indigo-500 to-violet-600
              hover:from-indigo-400 hover:to-violet-500
              active:scale-[0.98] transition-all duration-200
              shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Return Pass
          </button>
        </div>
      </div>
    );
  }

  /* ── QR code screen ── */
  return (
    <div className="relative min-h-screen bg-[#070710] flex items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl pointer-events-none" />

      <div className="glass relative z-10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-xs shadow-2xl text-center">
        <div className="mb-1">
          <span className="text-xl font-bold text-white tracking-tight">
            Gate<span className="text-indigo-400">Pass</span>
          </span>
        </div>

        <h2 className="text-white font-semibold mt-3 mb-1">Your Gate Pass</h2>
        <p className="text-white/35 text-xs mb-6">
          Show this to the security guard at the exit
        </p>

        <div className="p-4 bg-white rounded-2xl inline-block mx-auto mb-5">
          <QRCode size={164} value={qrValue} />
        </div>

        <p className="text-white/20 text-xs">
          Valid for your approved leave period only
        </p>
      </div>
    </div>
  );
}

interface DetailProps {
  label: string;
  value: string;
}

function Detail({ label, value }: DetailProps) {
  return (
    <div className="border-b border-white/6 last:border-b-0 last:pb-0 pb-3">
      <p className="text-white/35 text-xs uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-white font-semibold text-sm break-words">{value}</p>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawDetail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
  maxWidth = 620
) {
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "700 18px Arial";
  ctx.fillText(label.toUpperCase(), x, y);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px Arial";
  wrapCanvasText(ctx, value, x, y + 38, maxWidth, 32);
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

export default QrCode;
