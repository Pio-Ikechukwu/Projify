import { useState, useEffect } from "react";
import { useParams } from "react-router";
import EditTask from "../../components/EditTask";
import { ClipboardList } from "lucide-react";
import TodoCard from "../../components/TodoCard";
import AddTaskModal from "../../components/AddTaskModal";
import toast from "react-hot-toast";
const TaskListPage = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:3000/projects/${projectId}/tasks`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId, token]);

  const handleUpdate = async (taskId, updates) => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update task");
        return;
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete task");
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const statusMatch = statusFilter === "All" || t.status === statusFilter;
    const priorityMatch =
      priorityFilter === "All" || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Task List</h1>

      {!projectId ? (
        <p className="text-gray-500">
          No project selected. Go to a project dashboard first!
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm">{tasks.length} tasks available.</p>

          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#ff6767]">To-Do</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setOpenTaskModal(true)}
              className="px-5 py-2 bg-[#ff6767] text-white rounded-lg hover:bg-[#ff5555] text-sm font-semibold cursor-pointer"
            >
              + Add Task
            </button>
          </div>

          <div className="flex gap-2 justify-end mb-4">
            <select
              className="text-xs border border-gray-200 rounded-lg p-2 outline-none bg-[#ff6767] text-white"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="text-xs border border-gray-200 rounded-lg p-2 outline-none bg-[#ff6767] text-white"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priority</option>
              <option value="Extreme">Extreme</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TodoCard
                  key={task.id}
                  todo={task}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onEdit={(task) => setEditingTask(task)}
                  projectId={projectId}
                />
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-10">
                <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-center text-gray-500">No tasks found.</p>
              </div>
            )}
          </div>
        </>
      )}
      {editingTask && (
        <EditTask
          projectId={projectId}
          task={editingTask}
          closeForm={() => setEditingTask(null)}
          onTaskUpdated={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t)),
            );
            setEditingTask(null);
          }}
        />
      )}
      {openTaskModal && (
        <AddTaskModal
          projectId={projectId}
          closeForm={() => setOpenTaskModal(false)}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [...prev, newTask]);
            setOpenTaskModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TaskListPage;
