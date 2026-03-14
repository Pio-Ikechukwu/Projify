import { useState } from "react";
import { NavLink, Navigate } from "react-router";
import { Lock, UserRoundPen } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const currentProjectId = localStorage.getItem("currentProjectId");

  if (token) {
    return (
      <Navigate
        to={currentProjectId ? `/project/${currentProjectId}/dashboard` : "/"}
      />
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
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
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(`Login failed: ${data.error || data.message}`);
        return;
      }
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      const projectsRes = await fetch("http://localhost:3000/projects", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const projects = await projectsRes.json();
      if (projects.length > 0) {
        const savedProjectId = localStorage.getItem("currentProjectId");
        const targetId = savedProjectId || projects[0].id;
        localStorage.setItem("currentProjectId", targetId);
        window.location.href = `/project/${targetId}/dashboard`;
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      toast.error("Login failed: something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl max-w-5xl w-full flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-10">
          <img
            src="../public/images/ach3 1.png"
            alt="Login"
            className="max-w-xs"
          />
        </div>

        <div className="flex-1 p-16">
          <h1 className="text-[#212427] text-4xl font-semibold mb-8">
            Sign In
          </h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <UserRoundPen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  type="text"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.email ? "border-red-400" : "border-gray-200"}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.password ? "border-red-400" : "border-gray-200"}`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 mr-2 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-[#212427] text-sm cursor-pointer"
              >
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#FF9090] text-white p-3 rounded-lg font-medium cursor-pointer w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-[#212427] text-sm mt-5">
            Don't have an account?
            <NavLink
              to="/register"
              className="text-[#ff9090] hover:underline ml-2"
            >
              Create One
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
