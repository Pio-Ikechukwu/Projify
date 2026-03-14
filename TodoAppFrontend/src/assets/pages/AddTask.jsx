import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
});

const AddTask = ({ projectId, closeForm, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [statusRes, priorityRes] = await Promise.all([
          fetch(`http://localhost:3000/projects/${projectId}/statuses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/projects/${projectId}/priorities`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const statusData = await statusRes.json();
        const priorityData = await priorityRes.json();
        setStatuses(Array.isArray(statusData) ? statusData : []);
        setPriorities(Array.isArray(priorityData) ? priorityData : []);
        if (statusData.length > 0) setStatusId(statusData[0].id);
        if (priorityData.length > 0) setPriorityId(priorityData[0].id);
      } catch (err) {
        toast.error("Failed to load statuses and priorities");
      }
    };
    fetchOptions();
  }, [projectId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainDescription = description.replace(/<[^>]*>?/gm, "").trim();
    const result = taskSchema.safeParse({
      title: title.trim(),
      dueDate,
      description: plainDescription,
    });
    if (!result.success) {
      const newErrors = {};
      result.error.issues.map((e) => {
        newErrors[e.path[0]] = e.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            dueDate,
            description,
            statusId: Number(statusId),
            priorityId: Number(priorityId),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create task");
        return;
      }
      onTaskCreated(data);
      closeForm();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center p-8 pb-4">
        <h1 className="text-xl font-bold text-gray-800 pb-1">
          <span className="border-b-4 border-[#ff6767]">Add New Ta</span>sk
        </h1>
        <button onClick={closeForm} className="cursor-pointer">
          <X className="w-5 h-5 text-gray-500 hover:text-red-700" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-8 pt-0 max-h-[80vh] overflow-y-auto"
      >
        <div className="border border-gray-400 p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: "" });
              }}
              className={`w-full p-3 bg-gray-50 border rounded-md ${errors.title ? "border-red-400" : "border-gray-400"}`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Date To Be Completed
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setErrors({ ...errors, dueDate: "" });
              }}
              className={`w-full p-3 bg-gray-50 border rounded-md ${errors.dueDate ? "border-red-400" : "border-gray-400"}`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-1">Status</label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-400 rounded-md"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Priority</label>
              <select
                value={priorityId}
                onChange={(e) => setPriorityId(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-400 rounded-md"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description + Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-1">
                Task Description
              </label>
              <div className="h-40 mb-16 md:mb-12">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={(val) => {
                    setDescription(val);
                    setErrors({ ...errors, description: "" });
                  }}
                  className={`h-32 bg-gray-50 ${errors.description ? "border border-red-400 rounded" : ""}`}
                  placeholder="Start writing here..."
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">
                Upload Image
              </label>
              <div className="border border-gray-400 rounded-md h-40 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <img
                  src="/images/upload.png"
                  alt="upload"
                  className="w-10 opacity-20 mb-2"
                />
                <p className="text-xs">Drag & Drop files here</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer mt-8 px-12 py-3 bg-[#ff6767] text-white font-bold rounded shadow-lg hover:bg-[#ff5555] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Saving..." : "Done"}
        </button>
      </form>
    </div>
  );
};

export default AddTask;
