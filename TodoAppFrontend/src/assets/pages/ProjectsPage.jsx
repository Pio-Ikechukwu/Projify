import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AddProjectModal from "../../components/AddProjectModal";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3000/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [token]);

  const handleSelect = (projectId) => {
    navigate(`/project/${projectId}/dashboard`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Projects Page</h1>

      <button
        onClick={() => setOpenModal(true)}
        className="mb-6 px-6 py-2 bg-[#ff6767] text-white cursor-pointer rounded-lg hover:bg-[#ff5555]"
      >
        Create Project
      </button>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleSelect(project.id)}
              className="p-6 bg-white rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold mb-1">{project.projectName}</h2>
              <p className="text-gray-500 text-sm">{project.description}</p>
            </div>
          ))}
        </div>
      )}

      {openModal && (
        <AddProjectModal
          closeForm={() => setOpenModal(false)}
          onProjectCreated={(newProject) =>
            setProjects([...projects, newProject])
          }
        />
      )}
    </div>
  );
};

export default ProjectPage;
