import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const editTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
});

const EditTask = ({ projectId, task, closeForm, onTaskUpdated }) => {
  const [title, setTitle] = useState(task.title || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : "",
  );
  const [description, setDescription] = useState(task.description || "");
  const [statusId, setStatusId] = useState(task.statusId || "");
  const [priorityId, setPriorityId] = useState(task.priorityId || "");
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

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
      } catch (err) {
        toast.error("Failed to load options");
      }
    };
    fetchOptions();
  }, [projectId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainDescription = description.replace(/<[^>]*>?/gm, "").trim();
    const result = editTaskSchema.safeParse({
      title: title.trim(),
      dueDate,
      description: plainDescription,
    });

    if (!result.success) {
      const newErrors = {};
      result.error.issues.forEach((e) => {
        newErrors[e.path[0]] = e.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/tasks/${task.id}`,
        {
          method: "PUT",
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
        toast.error(data.error || "Failed to update task");
        return;
      }
      toast.success("Task updated!");
      onTaskUpdated(data.task);
      closeForm();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Edit Task</h1>
          <button onClick={closeForm}>
            <X className="w-5 h-5 text-gray-500 hover:text-red-700 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: "" });
              }}
              className={`w-full p-3 border rounded-md text-gray-800 ${errors.title ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

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
              className={`w-full p-3 border rounded-md ${errors.dueDate ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Status</label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
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
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <div className="h-36 mb-12">
              <ReactQuill
                theme="snow"
                value={description}
                onChange={(val) => {
                  setDescription(val);
                  setErrors({ ...errors, description: "" });
                }}
                className={`h-28 ${errors.description ? "border border-red-400 rounded" : ""}`}
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-[#ff6767] text-white font-bold rounded-lg hover:bg-[#ff5555] cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Saving..." : "Update Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
