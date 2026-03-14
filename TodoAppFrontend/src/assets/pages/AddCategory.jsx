import { X } from "lucide-react";
import Layout from "../../components/Layout";
import { NavLink } from "react-router";

const AddCategory = () => {
  return (
    <Layout>
      <div className="border border-gray-300 rounded-3xl min-h-[600px] p-10">
        <div className="flex justify-between items-center  mb-6 ">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="border-b-2 border-[#f24e1e] py-2">Crea</span>te
            Categories
          </h1>
          <NavLink
            className="text-sm font-semibold text-gray-700 underline cursor-pointer"
            to={"/categories"}
          >
            <X className="w-5 h-5 text-gray-500 hover:text-red-700" />
          </NavLink>
        </div>
        <div className="mb-6 ">
          <label
            htmlFor="category-name"
            className="block text-sm font-medium  mb-2"
          >
            Category Name
          </label>
          <input
            type="text"
            className="w-1/2 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="">
          <NavLink
            className="mt-4 bg-[#f24e1e] text-white px-4 py-2 rounded-md cursor-pointer mr-4"
            to={"/categories"}
          >
            Create
          </NavLink>
          <NavLink
            className="mt-4 bg-[#f24e1e] text-white px-4 py-2 rounded-md cursor-pointer ml-4"
            to={"/categories"}
          >
            Cancel
          </NavLink>
        </div>
      </div>
    </Layout>
  );
};

export default AddCategory;
