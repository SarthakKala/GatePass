import axios from "axios";
import { useEffect, useState } from "react";

function Admindash() {
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  async function fetchUsers() {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/getAll", {
        headers: {
          authorization: localStorage.getItem("token"),
        },
      });
      setUsers(res.data.users);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);

    return () => clearInterval(interval);
  }, []);

  async function allowUser(id: string) {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/allow?id=${id}`,
        {},
        {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        }
      );
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#070710]">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-white tracking-tight">
              Gate<span className="text-violet-400">Pass</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
              Admin
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-white/35 text-sm mt-0.5">
            Students awaiting your authorization. Auto-checking every 5 seconds.
          </p>
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/15 px-3 py-1 text-xs text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            <span className="truncate">Live updates{lastUpdated ? ` • Last checked ${lastUpdated}` : ""}</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="glass rounded-2xl p-6 sm:p-10 text-center text-white/30 text-sm">
              Checking for pending leave requests...
            </div>
          ) : users.length === 0 ? (
            <div className="glass rounded-2xl p-6 sm:p-10 text-center text-white/30 text-sm">
              No pending leave requests at the moment.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="glass rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
                  hover:border-white/15 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/20
                    flex items-center justify-center text-violet-300 font-semibold text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-white font-medium text-sm leading-tight">{user.name}</h2>
                    <p className="text-white/35 text-xs mt-0.5 truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => allowUser(user.id)}
                  className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold text-white shrink-0
                    bg-gradient-to-r from-violet-500 to-purple-600
                    hover:from-violet-400 hover:to-purple-500
                    active:scale-[0.97] transition-all duration-200
                    shadow-lg shadow-violet-500/20"
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Admindash;
