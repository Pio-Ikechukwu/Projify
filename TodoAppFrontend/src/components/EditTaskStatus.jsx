import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Status name must be at least 3 characters"),
});

const EditTaskStatus = ({ closeStatusEditModal, status, onStatusUpdated }) => {
  const { projectId } = useParams();
  const [name, setName] = useState(status?.name || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleUpdate = async () => {
    const result = schema.safeParse({ name: name.trim() });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/statuses/${status.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }
      toast.success("Status updated!");
      onStatusUpdated(data.status);
      closeStatusEditModal();
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
            <span className="border-b-2 border-[#f24e1e] py-2">Edit </span>Task
            Status
          </h1>
          <button onClick={closeStatusEditModal}>
            <X className="w-5 h-5 text-gray-500 hover:text-red-700" />
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Task Status Title
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            className={`w-1/2 p-2 border rounded-md text-gray-800 ${error ? "border-red-400" : "border-gray-300"}`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`mt-4 bg-[#f24e1e] text-white px-4 py-2 rounded-md cursor-pointer ${loading ? "opacity-50" : ""}`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            onClick={closeStatusEditModal}
            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskStatus;
