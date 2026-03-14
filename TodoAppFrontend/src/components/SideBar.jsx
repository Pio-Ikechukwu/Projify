import { NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import ProjectSwitcher from "./ProjectSwitcher";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  List,
  ListCheck,
} from "lucide-react";

const SideBar = () => {
  const [currentProjectId, setCurrentProjectId] = useState(
    localStorage.getItem("currentProjectId"),
  );
  const location = useLocation();

  useEffect(() => {
    setCurrentProjectId(localStorage.getItem("currentProjectId"));
  }, [location]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setUser(data);
    };

    fetchUser();
  }, []);
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="mr-2 w-6 h-6" />,
      path: currentProjectId ? `/project/${currentProjectId}/dashboard` : "/",
    },
    ...(currentProjectId
      ? [
          {
            name: "Task List",
            icon: <ListCheck className="mr-2 w-6 h-6" />,
            path: `/projects/${currentProjectId}/tasks`,
          },
          {
            name: "Task Categories",
            icon: <List className="mr-2 w-6 h-6" />,
            path: `/project/${currentProjectId}/categories`,
          },
          {
            name: "Users",
            icon: <Users className="mr-2 w-6 h-6" />,
            path: `/project/${currentProjectId}/users`,
          },
        ]
      : []),
    {
      name: "Settings",
      icon: <Settings className="mr-2 w-6 h-6" />,
      path: "/settings",
    },
  ];
  return (
    <div className="w-64 bg-[#ff6767] text-white rounded-r-md flex flex-col relative flex-shrink-0 h-full pt-6">
      <div className="flex justify-center mb-2">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
          <img
            src="/images/profile.png"
            alt="Profile"
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="flex flex-col items-center pb-5">
        <h2 className="font-semibold">{user?.fullName || "User"}</h2>
        <p className="text-xs">{user?.email || "email@example.com"}</p>
      </div>
      <div className="py-3 rounded-lg mb-2 font-medium flex justify-center text-white">
        <ProjectSwitcher />
      </div>
      <nav className="flex flex-col px-6 flex-1">
        {menuItems.filter(Boolean).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) =>
              `text-left py-2 px-3 rounded-lg mb-1 text-sm font-medium flex transition-colors ${
                isActive
                  ? "bg-white text-[#ff6767]"
                  : "text-white hover:bg-[#ff5555]"
              }`
            }
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-6 pb-6">
        <NavLink
          to="/login"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("currentProjectId");
          }}
          className="flex items-center gap-2 text-white hover:bg-[#ff5555] py-3 px-4 rounded-lg font-medium"
        >
          <LogOut className="w-6 h-6" />
          Logout
        </NavLink>
      </div>
    </div>
  );
};

export default SideBar;
