import Layout from "../../components/Layout";
import { NavLink } from "react-router";
const Settings = () => {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Settings</h1>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-50">
          <div className="relative group cursor-pointer">
            <img
              src="/images/profile.png"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Profile Picture</h3>

            <button className="text-xs font-bold text-[#ff6767] hover:underline">
              Change Photo
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Sundar Gurung"
              className="w-full p-3  border border-gray-100 rounded-xl text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="sundargurung3806@gmail.com"
              className="w-full p-3 bg-gray-50 border border-gray-100 text-gray-700"
            />
          </div>

          <NavLink
            to={"/"}
            className="bg-[#ff6767] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ff5252] "
          >
            Save Changes
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Settings;
