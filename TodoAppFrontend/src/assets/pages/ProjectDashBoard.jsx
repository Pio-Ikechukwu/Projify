import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router";
import AddTaskModal from "../../components/AddTaskModal";

const statusColumnClassName = {
  "Not Started": "border-t-4 border-gray-400",
  "In Progress": "border-t-4 border-blue-400",
  Completed: "border-t-4 border-green-400",
};

const priorityColors = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-yellow-100 text-yellow-700",
  Extreme: "bg-red-100 text-red-600",
};

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [statuses, setStatuses] = useState([]); // New state for dynamic statuses
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectRes, tasksRes, membersRes, statusRes] = await Promise.all(
          [
            fetch(`http://localhost:3000/projects/${projectId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3000/projects/${projectId}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3000/projects/${projectId}/members`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            // Make sure this endpoint matches your backend
            fetch(`http://localhost:3000/projects/${projectId}/statuses`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ],
        );

        const projectData = await projectRes.json();
        const tasksData = await tasksRes.json();
        const membersData = await membersRes.json();
        const statusData = await statusRes.json();

        setProject(projectData);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setMembers(Array.isArray(membersData) ? membersData : []);
        setStatuses(Array.isArray(statusData) ? statusData : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, token]);

  const getTasksByStatus = (statusName) =>
    tasks.filter((t) => t.status === statusName);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!project || project.error)
    return <p className="p-6 text-gray-500">Project not found.</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Project Header */}
      <div className="sticky top-0 bg-white z-10 rounded-2xl shadow-md p-6 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {project.projectName}
        </h1>
        <p className="text-gray-500 mt-1">{project.description}</p>
        <div className="flex items-center justify-between mt-4">
          <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
          <button
            onClick={() => setOpenTaskModal(true)}
            className="px-5 py-2 bg-[#ff6767] text-white rounded-lg hover:bg-[#ff5555] text-sm font-semibold cursor-pointer"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <div
            key={status.id}
            className={`bg-white rounded-2xl shadow-sm p-4 min-h-[200px] ${
              statusColumnClassName[status.name] || "border-t-4 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700">{status.name}</h3>
              <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                {getTasksByStatus(status.name).length}
              </span>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(status.name).length === 0 ? (
                <p className="text-gray-400 text-sm">No tasks</p>
              ) : (
                getTasksByStatus(status.name).map((task) => (
                  <NavLink key={task.id} to={`/projects/${projectId}/tasks`}>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800 hover:text-[#ff6767]">
                          {task.title}
                        </h4>
                        {task.priority && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[task.priority] || "bg-gray-100 text-gray-600"}`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1 break-words">
                        <div
                          className="text-gray-500 text-sm mt-1 break-words"
                          dangerouslySetInnerHTML={{ __html: task.description }}
                        />
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-400 mt-2">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </NavLink>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Members</h2>
        <ul className="space-y-2">
          {/* Owner always at top */}
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ff6767] text-white flex items-center justify-center text-sm font-bold">
              {project.ownerName?.[0] || "?"}
            </div>
            <span className="text-gray-700">{project.ownerName}</span>
            <span className="text-xs bg-[#ff6767] text-white px-2 py-0.5 rounded-full font-semibold">
              Owner
            </span>
          </li>
          {/* Members */}
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold">
                {member.fullName?.[0] || "?"}
              </div>
              <span className="text-gray-700">{member.fullName}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                Member
              </span>
            </li>
          ))}
          {members.length === 0 && (
            <p className="text-gray-400 text-sm">No members yet.</p>
          )}
        </ul>
      </div>
      {/* Add Task Modal */}
      {openTaskModal && (
        <AddTaskModal
          projectId={projectId}
          closeForm={() => setOpenTaskModal(false)}
          onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;
