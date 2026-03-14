import React from "react";
import { useParams } from "react-router";
import Layout from "../../components/Layout";
import { Trash2, FileEdit } from "lucide-react";

const TaskDetail = ({ todos }) => {
  const { id } = useParams();
  const todo = todos.find((t) => t.id === parseInt(id));

  if (!todo)
    return (
      <Layout>
        <div className="p-10 text-gray-500">Task not found!</div>
      </Layout>
    );

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-sm p-10 w-full  border border-gray-100 relative">
        <div className="flex gap-6 mb-10">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={`/images/${todo.image}.png`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {todo.title}
            </h1>
            <p className="text-sm font-semibold text-gray-400">
              Priority:{" "}
              <span className="text-[#ff6767] ml-1">{todo.priority}</span>
            </p>
            <p className="text-sm font-semibold text-gray-400 mt-1">
              Status: <span className="text-[#ff6767] ml-1">{todo.status}</span>
            </p>
            <p className="text-sm font-semibold text-gray-400 mt-1">
              Assigned To:
              <span className="text-[#ff6767] ml-1">
                {todo.assignedTo || "None"}
              </span>
            </p>
          </div>
        </div>
        <div className="space-y-6 text-[14px] leading-relaxed text-gray-500">
          <p>
            <span className="font-bold text-gray-700 block mb-1">
              Task Title:
            </span>
            {todo.title || todo.title}
          </p>

          <p>
            <span className="font-bold text-gray-700 block mb-1">
              Objective:
            </span>
            {todo.objective}
          </p>

          <p>
            <span className="font-bold text-gray-700 block mb-1">
              Task Description:
            </span>
            {todo.taskDescription || todo.description}
          </p>

          <div>
            <span className="font-bold text-gray-700 block mb-2">
              Additional Notes:
            </span>
            <ul className="list-disc ml-5 space-y-2 text-gray-500">
              {(todo.additionalNotes || todo.notes || []).map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <p className="">
              <span className="font-bold text-gray-700  mb-1">Deadline: </span>
              {todo.deadline}
            </p>

            <p className="text-[11px] text-gray-500  italic">
              Created on: {todo.createdOn}
            </p>
            <p className="text-[11px] text-gray-500 italic">
              {(() => {
                const parseDate = (str) => {
                  const [d, m, y] = str.split("/");
                  return new Date(`${y}-${m}-${d}`);
                };

                const deadlineDiff = Math.ceil(
                  (parseDate(todo.deadline) - new Date()) /
                    (1000 * 60 * 60 * 24),
                );
                const currentDiff = Math.ceil(
                  (new Date() - parseDate(todo.deadline)) /
                    (1000 * 60 * 60 * 24),
                );
                if (isNaN(deadlineDiff)) return "Invalid Date";
                return deadlineDiff < 0
                  ? `${currentDiff} days past due date!`
                  : deadlineDiff === 0
                    ? "It's Task Day!"
                    : `${deadlineDiff} days to go!`;
              })()}
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 flex gap-3">
          <button className="p-3 bg-[#ff6767] text-white rounded-xl  shadow-md">
            <Trash2 size={18} />
          </button>
          <button className="p-3 bg-[#ff6767] text-white rounded-xl  shadow-md">
            <FileEdit size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
