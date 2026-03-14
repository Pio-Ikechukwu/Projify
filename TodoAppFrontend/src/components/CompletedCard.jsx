import { Check, ChevronDown } from "lucide-react";

const CompletedCard = ({ completed, onUpdate, members }) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 ">
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border rounded-lg border-gray-400">
        <div className="mt-1">
          <div className="flex w-6 h-6 rounded-full border-2 border-green-500 items-center justify-center">
            <Check className="w-3 h-3 text-green-500" />
          </div>
        </div>
        <div className="flex-1 ">
          <h3 className="font-semibold text-gray-800 mb-1">
            {completed.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {completed.description}
          </p>
          <div className="text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-x-7 gap-y-3 items-center text-[11px]">
              <div className="relative flex items-center bg-gray-50 px-2 py-3 rounded-lg border border-gray-200">
                <span className="text-gray-400 mr-1">Priority:</span>
                <select
                  value={completed.priority}
                  onChange={(e) =>
                    onUpdate(completed.id, { priority: e.target.value })
                  }
                  className={`bg-transparent font-bold appearance-none pr-4 outline-none cursor-pointer ${
                    completed.priority === "Extreme"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Extreme">Extreme</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1 pointer-events-none text-gray-400"
                />
              </div>

              {/* Status Dropdown */}
              <div className="relative flex items-center bg-gray-50 px-2 py-3 rounded-lg border border-gray-200">
                <span className="text-gray-400 mr-1">Status:</span>
                <select
                  value={completed.status}
                  onChange={(e) =>
                    onUpdate(completed.id, { status: e.target.value })
                  }
                  className="bg-transparent font-bold text-gray-700 appearance-none pr-4 outline-none cursor-pointer"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1 pointer-events-none text-gray-400"
                />
              </div>
              <div className="relative flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 gap-2">
                <span className="text-gray-400 mr-1">Was Assigned to:</span>
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden  border border-white shadow-sm">
                  {completed.assignedTo ? (
                    <img
                      src={
                        members.find((m) => m.name === completed.assignedTo)
                          ?.img
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                      ?
                    </div>
                  )}
                </div>
                <select
                  value={completed.assignedTo}
                  onChange={(e) =>
                    onUpdate(completed.id, { assignedTo: e.target.value })
                  }
                  className="bg-transparent font-bold text-gray-700 cursor-pointer appearance-none pr-4"
                >
                  <option value="">None</option>
                  {members.map((member) => (
                    <option key={member.name} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1 pointer-events-none text-gray-400"
                />
              </div>

              <div className="ml-auto text-gray-400 italic font-medium">
                Created: {completed.createdOn}
              </div>
            </div>
            <p className="mt-4">{completed.smalltext}</p>
          </div>
        </div>
        <div className="w-16 h-16 bg-gray-100 rounded-xl  ">
          <img
            src={`/images/${completed.image}.png`}
            className="rounded-md w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CompletedCard;
