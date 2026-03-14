import Layout from "../../components/Layout";
import TodoCard from "../../components/TodoCard";
const MyTask = ({ todos }) => {
  const activeTask = todos.myTasks.find((task) => task.isActive);
  return (
    <Layout>
      <main className="grid grid-cols-2 ml-10 gap-2 px-3 py-8 overflow-y-auto">
        <div className="border border-1 rounded-lg m-4 p-4  border-gray-300">
          <h4 className="font-bold ">
            <span className="border-b-3 border-[#f24e1e] pb-2 ">My </span>
            Tasks
          </h4>
          <div className="space-y-4 mt-6 ">
            {todos.myTasks.map((task) => {
              return (
                <div
                  className={
                    task.isActive ? "bg-[#f1f3fb] rounded-lg" : "bg-white"
                  }
                >
                  <TodoCard todo={task} key={task.id} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border border-1 rounded-lg m-4 p-6  border-gray-300">
          <div className="flex items-start gap-4  ">
            <div>
              <img
                className="w-40 h-40"
                src={`/images/${activeTask.image}.png`}
                alt={activeTask.title}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold m-4">{activeTask.title}</h2>
              <div className="mb-4 text-xs">
                <span>Priority: </span>
                <span
                  className={
                    activeTask.priority === "Extreme"
                      ? "font-medium  text-[#f21e1e]"
                      : "font-medium mb-2 text-[#0225ff]"
                  }
                >
                  {activeTask.priority}
                </span>
              </div>
              <div className="mb-4 text-xs">
                <span>Status: </span>
                <span
                  className={
                    activeTask.status === "Not Started"
                      ? "text-[#f21e1e] mb-2 font-medium"
                      : "text-[#0225ff] mb-2 font-medium"
                  }
                >
                  {activeTask.status}
                </span>
              </div>
              <p className="text-xs text-[#a1a3ab]">
                Created On: {activeTask.createdOn}
              </p>
            </div>
          </div>
          <div className="text-[#747474] ">
            <div className="leading-[2]">
              <span className="font-bold ">Task Title: </span>
              <span>{activeTask.taskTitle}</span>
            </div>
            <div className=" leading-[2]">
              <span className="font-bold">Objective: </span>
              <span>{activeTask.Objective}</span>
            </div>
            <div className="leading-[2]">
              <span className="font-bold">Task Description: </span>
              <span>{activeTask.taskDescription}</span>
            </div>
            <div className=" leading-[2]">
              <span className="font-bold">Additional Notes :</span>
              <div>
                {activeTask.additionalNotes.map((note) => {
                  return (
                    <li className="ml-6" key={note}>
                      {note}
                    </li>
                  );
                })}
              </div>
            </div>
            <div className=" leading-[2]">
              <span className="font-bold">Deadline For Submission: </span>
              <span>{activeTask.deadline}</span>
            </div>
          </div>
          <div className="flex mt-15 gap-2 justify-end">
            <img
              src="/images/trashicon.png"
              alt="Delete Task"
              className="w-6 h-6 cursor-pointer"
            />
            <img
              src="/images/notesicon.png"
              alt="note"
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default MyTask;
