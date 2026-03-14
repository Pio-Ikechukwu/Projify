import { useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";

const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
});

const AddProjectForm = ({ closeForm, onProjectCreated }) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = projectSchema.safeParse({
      projectName: projectName.trim(),
      description: description.trim(),
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
      const res = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectName, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create project");
        return;
      }
      onProjectCreated(data);
      closeForm();
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="border-b-2 border-[#f24e1e] py-2">Create</span> New
          Project
        </h1>
        <button onClick={closeForm}>
          <X className="w-5 h-5 cursor-pointer text-gray-500 hover:text-red-700" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-1">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setErrors({ ...errors, projectName: "" });
            }}
            className={`w-full p-3 border rounded text-gray-800 ${errors.projectName ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.projectName && (
            <p className="text-red-500 text-xs mt-1">{errors.projectName}</p>
          )}
        </div>

        <div>
          <label className="block font-bold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors({ ...errors, description: "" });
            }}
            className={`w-full p-3 border rounded text-gray-800 ${errors.description ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 bg-[#ff6767] text-white rounded hover:bg-[#ff5555] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
};

export default AddProjectForm;
