import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Layout from "./components/Layout";
import Users from "./assets/pages/Users";
import TaskCategories from "./assets/pages/TaskCategories";
import AddCategory from "./assets/pages/AddCategory";
import AddTaskPriority from "./components/AddTaskPriority";
import AddTaskStatus from "./components/AddTaskStatus";
import EditTaskPriority from "./components/EditTaskPriority";
import EditTaskStatus from "./components/EditTaskStatus";
import TaskDetail from "./assets/pages/TaskDetail";
import { Routes, Route } from "react-router";
import Settings from "./assets/pages/Settings";
import TaskListPage from "./assets/pages/TaskListPage";
import InviteModal from "./components/InviteModal";
import ProjectDashboard from "./assets/pages/ProjectDashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import NoProjects from "./assets/pages/NoProjectsPage";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full py-20">
    <h1 className="text-6xl font-bold text-[#ff6767]">404</h1>
    <p className="text-2xl font-semibold text-gray-700 mt-4">
      There's no project
    </p>
    <p className="text-gray-400 mt-2">
      There's currently no project available. Create a project!
    </p>
  </div>
);

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPriorityFormOpen, setIsPriorityFormOpen] = useState(false);
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const [isEditPriorityModalOpen, setIsEditPriorityModalOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <Routes>
                  <Route path="/" element={<NoProjects />} />
                  {/* Project Dashboard */}
                  <Route
                    path="/project/:projectId/dashboard"
                    element={<ProjectDashboard />}
                  />

                  {/* Task List */}
                  <Route
                    path="/projects/:projectId/tasks"
                    element={<TaskListPage />}
                  />

                  {/* Task Categories */}
                  <Route
                    path="/project/:projectId/categories"
                    element={
                      <TaskCategories
                        openPriorityForm={() => setIsPriorityFormOpen(true)}
                        openStatusForm={() => setIsStatusFormOpen(true)}
                        openPriorityEditModal={() =>
                          setIsEditPriorityModalOpen(true)
                        }
                        openStatusEditModal={() =>
                          setIsEditStatusModalOpen(true)
                        }
                      />
                    }
                  />

                  {/* Users */}
                  <Route
                    path="/project/:projectId/users"
                    element={
                      <Users
                        openInviteModal={() => setIsInviteModalOpen(true)}
                      />
                    }
                  />

                  {/* Task Detail */}
                  <Route path="/todo/:id" element={<TaskDetail />} />

                  {/* Settings - standalone */}
                  <Route path="/settings" element={<Settings />} />

                  {/* Add Category */}
                  <Route
                    path="/project/:projectId/categories/add-category"
                    element={<AddCategory />}
                  />

                  {/* Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {isPriorityFormOpen && (
        <AddTaskPriority
          closePriorityForm={() => setIsPriorityFormOpen(false)}
        />
      )}
      {isStatusFormOpen && (
        <AddTaskStatus closeStatusForm={() => setIsStatusFormOpen(false)} />
      )}
      {isEditPriorityModalOpen && (
        <EditTaskPriority
          closePriorityEditModal={() => setIsEditPriorityModalOpen(false)}
        />
      )}
      {isEditStatusModalOpen && (
        <EditTaskStatus
          closeStatusEditModal={() => setIsEditStatusModalOpen(false)}
        />
      )}
      {isInviteModalOpen && (
        <InviteModal closeInviteModal={() => setIsInviteModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
