import { useState } from "react";
import { UserRoundPen, Mail, Lock, LockKeyhole } from "lucide-react";
import { NavLink, Navigate, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),
  email: z.string().email("Email must be valid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) {
      setErrors({ terms: "You must agree to the terms to register" });
      return;
    }
    console.log("handleSubmit called");
    console.log("formData", formData);
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    const result = registerSchema.safeParse({
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    });
    console.log(result.success);
    console.log(result.error);

    console.log(result);
    if (!result.success) {
      const newErrors = {};
      result.error.issues.map((e) => {
        newErrors[e.path[0]] = e.message;
      });
      console.log("newErrors", newErrors);
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.firstName + " " + formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }
      navigate("/login");
      toast.success("Registered successfully! You can now log in.");
    } catch (err) {
      toast.error("Registration failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center auth-bg justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        <div className="hidden md:flex items-center justify-center p-8 bg-white w-1/2">
          <img
            src="../public/images/R 2.png"
            alt="Sign Up"
            className="max-w-xs"
          />
        </div>

        <div className="p-12 flex flex-col justify-center w-full">
          <h1 className="text-2xl font-bold mb-8 text-gray-800">Sign Up</h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <UserRoundPen className="absolute left-4 top-4 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter First Name"
                className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="relative">
              <UserRoundPen className="absolute left-4 top-4 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Last Name"
                className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Email"
                className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.email ? "border-red-400" : "border-gray-200"}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5" />
              <input
                type="password"
                placeholder="Enter Password"
                className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.password ? "border-red-400" : "border-gray-200"}`}
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-4 w-5 h-5" />
              <input
                type="password"
                placeholder="Confirm Password"
                className={`w-full pl-12 pr-4 py-4 border rounded-lg text-sm placeholder:text-[#999999] ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 rounded"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to all terms
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
              )}
            </div>

            <button
              type="submit"
              className={`bg-[#ff9090] text-white font-semibold p-3 rounded-lg mt-6 shadow-md w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-8 text-sm">
            <p className="text-gray-600">
              Already have an account?
              <NavLink
                to="/login"
                className="text-[#ff6767] font-semibold hover:underline ml-2"
              >
                Sign In
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
