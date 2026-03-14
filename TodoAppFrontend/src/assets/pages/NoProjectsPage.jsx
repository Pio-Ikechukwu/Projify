import { useState } from "react";
import { FolderOpen } from "lucide-react";
import AddProjectModal from "../../components/AddProjectModal";
import { useNavigate } from "react-router";

const NoProjects = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const handleProjectCreated = (newProject) => {
    localStorage.setItem("currentProjectId", newProject.id);
    setShowCreateModal(false);
    navigate(`/project/${newProject.id}/dashboard`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-12 h-12 text-[#ff6767]" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">No Projects Yet</h1>
      <p className="text-gray-400 mb-8 text-sm">
        Create your first project to get started!
      </p>
      <button
        onClick={() => setShowCreateModal(true)}
        className="px-8 py-4 bg-[#ff6767] text-white rounded-xl font-semibold text-lg hover:bg-[#ff5555] transition-colors cursor-pointer"
      >
        + Create Project
      </button>

      {showCreateModal && (
        <AddProjectModal
          closeForm={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default NoProjects;
