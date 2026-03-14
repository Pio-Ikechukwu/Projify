import { useState, useEffect } from "react";
import {
  Ban,
  Check,
  Loader,
  Minus,
  ChevronDown,
  Trash2,
  Pencil,
} from "lucide-react";

const TodoCard = ({ todo, onUpdate, onDelete, onEdit, projectId }) => {
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
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
        console.error("Failed to load options");
      }
    };
    fetchOptions();
  }, [projectId, token]);

  return (
    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Status Icon */}
      <div
        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          todo.status === "Not Started"
            ? "border-gray-300"
            : todo.status === "In Progress"
              ? "border-blue-500"
              : todo.status === "Completed"
                ? "border-green-500"
                : "border-red-300"
        }`}
      >
        {todo.status === "Completed" ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : todo.status === "In Progress" ? (
          <Loader className="w-3 h-3 text-blue-500" />
        ) : todo.status === "Blocked" ? (
          <Ban className="w-3 h-3 text-red-500" />
        ) : (
          <Minus className="w-3 h-3 text-gray-400" />
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{todo.title}</h3>
        <p className="text-sm text-gray-500 mb-4 break-words">
          <div dangerouslySetInnerHTML={{ __html: todo.description }} />
        </p>

        <div className="grid grid-cols-2 gap-x-7 gap-y-3 items-center text-[11px]">
          {/* Priority */}
          <div className="relative flex items-center bg-gray-50 px-2 py-3 rounded-lg border border-gray-200 w-30">
            <span className="text-gray-400 mr-1">Priority:</span>
            <select
              value={todo.priorityId || ""}
              onChange={(e) =>
                onUpdate(todo.id, { priorityId: Number(e.target.value) })
              }
              className={`bg-transparent font-bold appearance-none pr-4 outline-none cursor-pointer ${
                todo.priority === "Extreme"
                  ? "text-red-600"
                  : todo.priority === "Moderate"
                    ? "text-blue-600"
                    : "text-green-600"
              }`}
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1 pointer-events-none text-gray-400"
            />
          </div>

          {/* Status */}
          <div className="relative flex items-center bg-gray-50 px-2 py-3 rounded-lg border border-gray-200 w-30">
            <span className="text-gray-400 mr-1">Status:</span>
            <select
              value={todo.statusId || ""}
              onChange={(e) =>
                onUpdate(todo.id, { statusId: Number(e.target.value) })
              }
              className="bg-transparent font-bold text-gray-700 appearance-none pr-4 outline-none cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1 pointer-events-none text-gray-400"
            />
          </div>

          {/* Due Date */}
          {todo.dueDate && (
            <div className="text-gray-400 italic font-medium">
              Due: {new Date(todo.dueDate).toLocaleDateString()}
            </div>
          )}

          {/* Edit & Delete */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => onEdit(todo)}
              className="text-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
