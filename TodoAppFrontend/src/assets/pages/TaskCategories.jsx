import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Edit, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import AddTaskStatus from "../../components/AddTaskStatus";
import AddTaskPriority from "../../components/AddTaskPriority";
import EditTaskStatus from "../../components/EditTaskStatus";
import EditTaskPriority from "../../components/EditTaskPriority";

const TaskCategories = () => {
  const { projectId } = useParams();
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddStatus, setShowAddStatus] = useState(false);
  const [showAddPriority, setShowAddPriority] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingPriority, setEditingPriority] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
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
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, token]);

  const handleDeleteStatus = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/statuses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        toast.error("Failed to delete status");
        return;
      }
      setStatuses(statuses.filter((s) => s.id !== id));
      toast.success("Status deleted!");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDeletePriority = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/projects/${projectId}/priorities/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        toast.error("Failed to delete priority");
        return;
      }
      setPriorities(priorities.filter((p) => p.id !== id));
      toast.success("Priority deleted!");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="border border-gray-300 rounded-3xl p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="border-b-2 border-[#f24e1e] py-2">Task </span>
            Categories
          </h1>
        </div>

        {/* Task Status */}
        <div className="bg-white p-8 mb-10 border-b border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              <span className="border-b-2 border-[#f24e1e] py-2">Task S</span>
              tatus
            </h2>
            <button
              className="text-xs text-gray-300 cursor-pointer font-bold"
              onClick={() => setShowAddStatus(true)}
            >
              <span className="text-[#f24e1e]">+</span> Add Task Status
            </button>
          </div>

          {statuses.length === 0 ? (
            <p className="text-gray-400 text-sm">No statuses yet. Add one!</p>
          ) : (
            <div className="overflow-hidden border border-gray-300 rounded-2xl">
              <table className="w-full border-separate border-spacing-0 text-center">
                <thead>
                  <tr className="bg-white">
                    <th className="w-16 border-r border-b border-gray-300 py-4 font-semibold text-gray-800">
                      SN
                    </th>
                    <th className="border-r border-b border-gray-300 py-4 font-semibold text-gray-800">
                      Task Status
                    </th>
                    <th className="w-80 border-b border-gray-300 py-4 font-semibold text-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-6 border-r border-gray-300">
                        {index + 1}
                      </td>
                      <td className="py-6 border-r border-gray-300 font-medium">
                        {item.name}
                      </td>
                      <td className="py-6">
                        <div className="flex justify-center gap-4 px-4">
                          <button
                            className="flex items-center gap-2 rounded-xl bg-[#f24e1e] px-6 py-2.5 text-white shadow-sm cursor-pointer"
                            onClick={() => setEditingStatus(item)}
                          >
                            <Edit />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 rounded-xl bg-[#f24e1e] px-6 py-2.5 text-white shadow-sm cursor-pointer"
                            onClick={() => handleDeleteStatus(item.id)}
                          >
                            <Trash2Icon />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Priority */}
        <div className="bg-white p-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              <span className="border-b-2 border-[#f24e1e] py-2">Task P</span>
              riority
            </h2>
            <button
              className="cursor-pointer text-xs text-gray-300 font-bold"
              onClick={() => setShowAddPriority(true)}
            >
              <span className="text-[#f24e1e]">+</span> Add Task Priority
            </button>
          </div>

          {priorities.length === 0 ? (
            <p className="text-gray-400 text-sm">No priorities yet. Add one!</p>
          ) : (
            <div className="overflow-hidden border border-gray-300 rounded-2xl">
              <table className="w-full border-separate border-spacing-0 text-center">
                <thead>
                  <tr className="bg-white">
                    <th className="w-16 border-r border-b border-gray-300 py-4 font-semibold text-gray-800">
                      SN
                    </th>
                    <th className="border-r border-b border-gray-300 py-4 font-semibold text-gray-800">
                      Task Priority
                    </th>
                    <th className="w-80 border-b border-gray-300 py-4 font-semibold text-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priorities.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border-r border-gray-300 py-6">
                        {index + 1}
                      </td>
                      <td className="border-r border-gray-300 py-6 font-medium">
                        {item.name}
                      </td>
                      <td className="py-6">
                        <div className="flex justify-center gap-4 px-4">
                          <button
                            className="flex items-center gap-2 rounded-xl bg-[#f24e1e] px-6 py-2.5 text-white shadow-sm cursor-pointer"
                            onClick={() => setEditingPriority(item)}
                          >
                            <Edit />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 rounded-xl bg-[#f24e1e] px-6 py-2.5 text-white shadow-sm cursor-pointer"
                            onClick={() => handleDeletePriority(item.id)}
                          >
                            <Trash2Icon />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddStatus && (
        <AddTaskStatus
          projectId={projectId}
          closeStatusForm={() => setShowAddStatus(false)}
          onStatusCreated={(newStatus) => setStatuses([...statuses, newStatus])}
        />
      )}
      {showAddPriority && (
        <AddTaskPriority
          projectId={projectId}
          closePriorityForm={() => setShowAddPriority(false)}
          onPriorityCreated={(newPriority) =>
            setPriorities([...priorities, newPriority])
          }
        />
      )}
      {editingStatus && (
        <EditTaskStatus
          closeStatusEditModal={() => setEditingStatus(null)}
          status={editingStatus}
          onStatusUpdated={(updated) =>
            setStatuses(
              statuses.map((s) => (s.id === updated.id ? updated : s)),
            )
          }
        />
      )}
      {editingPriority && (
        <EditTaskPriority
          closePriorityEditModal={() => setEditingPriority(null)}
          priority={editingPriority}
          onPriorityUpdated={(updated) =>
            setPriorities(
              priorities.map((p) => (p.id === updated.id ? updated : p)),
            )
          }
        />
      )}
    </div>
  );
};

export default TaskCategories;
