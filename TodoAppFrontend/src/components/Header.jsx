import { useState, useEffect } from "react";
import { Bell, Calendar, Search, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const Header = ({ searchTerm, setSearchTerm }) => {
  const [invites, setInvites] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await fetch("http://localhost:3000/invites/received", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInvites(
          Array.isArray(data) ? data.filter((i) => i.status === "pending") : [],
        );
      } catch (err) {
        console.error("Failed to fetch invites");
      }
    };
    fetchInvites();
  }, [token]);

  const handleAccept = async (inviteId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/invites/${inviteId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        toast.error("Failed to accept invite");
        return;
      }
      toast.success("Invite accepted! You're now a member!");
      setInvites(invites.filter((i) => i.id !== inviteId));
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleReject = async (inviteId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/invites/${inviteId}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        toast.error("Failed to reject invite");
        return;
      }
      toast.success("Invite rejected!");
      setInvites(invites.filter((i) => i.id !== inviteId));
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <header className="w-full bg-white shadow-md px-20 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-10">
          <span className="text-[#ff6b6b]">To</span>-Do
        </h1>
        <div className="flex items-center w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your task here..."
            className="w-full px-4 py-2 rounded-l-lg bg-gray-100"
          />
          <button className="w-13 h-10 bg-[#ff6b6b] rounded-r-lg flex items-center justify-center">
            <Search className="text-white w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              className="w-10 h-10 bg-[#ff6b6b] rounded-lg flex items-center justify-center relative "
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Bell className="text-white w-4 h-4 cursor-pointer" />
              {invites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {invites.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div>
                <div
                  className="fixed inset-0 z-[199]"
                  onClick={() => setShowDropdown(false)}
                />
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-[200]">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Invites</h3>
                  </div>
                  {invites.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      No pending invites!
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="p-4 border-b border-gray-50 hover:bg-gray-50"
                        >
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            <span className="font-bold">
                              {invite.inviterName}
                            </span>{" "}
                            invited you to join{" "}
                            <span className="font-bold">
                              {invite.projectName}
                            </span>
                            !
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(invite.id)}
                              className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(invite.id)}
                              className="flex items-center gap-1 bg-red-400 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="w-10 h-10 bg-[#ff6b6b] rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-4 h-4" />
          </button>
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold">
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </span>
            <span className="text-sm text-[#0225ff]">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
