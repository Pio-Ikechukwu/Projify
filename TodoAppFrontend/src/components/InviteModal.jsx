import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const InviteModal = ({ projectId, closeInviteModal }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async () => {
    const result = schema.safeParse({ email: email.trim() });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/invites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send invite");
        return;
      }
      toast.success("Invite sent successfully!");
      setEmail("");
      closeInviteModal();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
      <div className="border bg-white border-gray-300 rounded-sm min-h-[300px] p-10 w-1/2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="border-b-2 border-[#f24e1e] py-2">Invite </span>
            People
          </h1>
          <button onClick={closeInviteModal}>
            <X className="w-5 h-5 text-gray-500 hover:text-red-700" />
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">User Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={`w-full p-2 border rounded-md text-gray-800 ${error ? "border-red-400" : "border-gray-300"}`}
            placeholder="Enter email address"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-4 bg-[#f24e1e] text-white px-4 py-2 rounded-md cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>
      </div>
    </div>
  );
};

export default InviteModal;
