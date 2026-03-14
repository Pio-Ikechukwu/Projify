// import { useState } from "react";
import { useNavigate } from "react-router";
import TodoCard from "../../components/TodoCard";
import CompletedCard from "../../components/CompletedCard";
import { NavLink } from "react-router";
import Layout from "../../components/Layout";
import { ClipboardList } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
const ProgressRing = ({ value, color, label }) => {
  const data = [{ value: value }, { value: 100 - value }];

  return (
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              // stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
              <Label
                value={`${value}%`}
                position="center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  fill: "#374151",
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs font-medium text-gray-700">
        <span style={{ color: color }}>●</span> {label}
      </p>
    </div>
  );
};

const DashBoard = ({
  openForm,
  onUpdate,
  filteredTodos,
  members,
  completedTasks,
  // searchTerm,
  // setSearchTerm,
}) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-GB");
  const todayTasks = filteredTodos.filter((t) => t.deadline === today);
  const handleMoreClick = (filterType, filterValue) => {
    navigate("/tasks", { state: { filterType, filterValue } });
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, Sundar 👋
          </h1>
        </div>
        <button
          onClick={openForm}
          className="text-[#f24e1e] py-2 px-4 border border-[#f24e1e] rounded-lg hover:bg-[#ff6767] hover:text-white cursor-pointer"
        >
          <span className="">+</span>
          Add task
        </button>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member, index) => (
              <img
                key={index}
                src={member.img}
                alt={member.name}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          {members.length > 5 && (
            <NavLink
              to="/users"
              className="text-xs font-bold hover:underline  text-red-500 cursor-pointer"
            >
              +{members.length - 5}
            </NavLink>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-1 bg-white rounded-3xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#ff6767]">
                Due Tasks
              </h2>
              <p className="text-sm text-gray-500">{today}</p>
            </div>
          </div>

          <div className="space-y-4">
            {todayTasks.length > 0 ? (
              <div>
                {todayTasks.slice(0, 3).map((todo) => (
                  <TodoCard
                    todo={todo}
                    members={members}
                    key={todo.id}
                    onUpdate={onUpdate}
                  />
                ))}
                <button
                  onClick={() => handleMoreClick("dueDate", today)}
                  className="text-xs text-[#f24e1e]  hover:underline mt-2 cursor-pointer"
                >
                  More →
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-center text-gray-500">No tasks found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#ff6767] mb-6">
              Task Status
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <ProgressRing value={84} color="#22c55e" label="Completed" />
              <ProgressRing value={46} color="#3b82f6" label="In Progress" />
              <ProgressRing value={13} color="#ef4444" label="Not Started" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#f21e4e] mb-4">
              Completed Tasks
            </h2>
            <div className="space-y-4">
              {completedTasks.length > 0 &&
                completedTasks
                  .slice(0, 3)
                  .map((completed) => (
                    <CompletedCard
                      completed={completed}
                      key={completed.id}
                      onUpdate={onUpdate}
                      members={members}
                    />
                  ))}
            </div>
            <button
              onClick={() => handleMoreClick("status", "Completed")}
              className="text-xs text-[#f24e1e] hover:underline cursor-pointer"
            >
              More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
