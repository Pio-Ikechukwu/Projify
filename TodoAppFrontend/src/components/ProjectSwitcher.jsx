import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, FolderOpen, X, Plus } from "lucide-react";
import AddProjectModal from "./AddProjectModal";

const ProjectSwitcher = ({ autoOpen = false }) => {
  const [currentProjectId, setCurrentProjectId] = useState(
    localStorage.getItem("currentProjectId"),
  );
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3000/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [token, isOpen]);

  const handleSwitch = (projectId) => {
    setIsOpen(false);
    localStorage.setItem("currentProjectId", projectId);
    setCurrentProjectId(String(projectId));
    navigate(`/project/${projectId}/dashboard`);
  };
  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setShowCreateModal(false);
    setIsOpen(false);
    localStorage.setItem("currentProjectId", newProject.id);
    setCurrentProjectId(String(newProject.id));
    navigate(`/project/${newProject.id}/dashboard`);
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#ff6767] hover:border cursor-pointer hover:border-gray-200 hover:rounded-lg hover:shadow-md text-sm font-semibold text-white justify-center"
      >
        <FolderOpen className="w-4 h-4 text-white" />
        {projects.length === 0 ? "Create Project" : "Switch Project"}
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Your Projects</h2>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" />
          </button>
        </div>

        {/* Projects List */}
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-140px)]">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-8 space-y-2">
              <p className="text-gray-400 text-sm text-center">
                No projects yet. Create your first one!
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSwitch(project.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                  project.id === Number(currentProjectId)
                    ? "border-[#ff6767] bg-red-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {project.projectName}
                  </h3>
                  {project.id === Number(currentProjectId) && (
                    <span className="text-xs text-[#ff6767] font-bold">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">{project.description}</p>
              </button>
            ))
          )}
        </div>

        {/* Create Project Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => {
              setIsOpen(false);
              setShowCreateModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff6767] text-white rounded-xl font-semibold hover:bg-[#ff5555] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <AddProjectModal
          closeForm={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectSwitcher;
