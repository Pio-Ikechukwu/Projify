// import Header from "./Header";
// import SideBar from "./SideBar";
// import TodoCard from "./TodoCard";
// import Layout from "./Layout";
// import { Edit, Trash2Icon } from "lucide-react";

// const VitalTask = ({ todos }) => {
//   const activeTask = todos.vitalTasks.find((task) => task.isActive);
//   return (
//     <Layout>
//       <main className="grid grid-cols-2 ml-10 gap-2 px-3 py-4 overflow-y-auto">
//         <div className="border border-1 rounded-lg m-4 p-4  border-gray-300">
//           <h4 className="font-bold ">
//             <span className="border-b-3 border-[#f24e1e] pb-2 ">Vital </span>
//             Tasks
//           </h4>
//           <div className="space-y-4 mt-6 ">
//             {todos.vitalTasks.map((task) => {
//               return (
//                 <div
//                   className={
//                     task.isActive ? "bg-[#f1f3fb] rounded-lg" : "bg-white"
//                   }
//                 >
//                   <TodoCard todo={task} key={task.id} />
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//         <div className="border border-1 rounded-lg m-4 p-6  border-gray-300">
//           <div className="flex items-start gap-4  ">
//             <div>
//               <img
//                 className="w-40 h-40"
//                 src={`/images/${activeTask.image}.png`}
//                 alt={activeTask.title}
//               />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold m-4">{activeTask.title}</h2>
//               <div className="mb-4 text-xs">
//                 <span>Priority: </span>
//                 <span
//                   className={
//                     activeTask.priority === "Extreme"
//                       ? "font-medium  text-[#f21e1e]"
//                       : "font-medium mb-2 text-[#0225ff]"
//                   }
//                 >
//                   {activeTask.priority}
//                 </span>
//               </div>
//               <div className="mb-4 text-xs">
//                 <span>Status: </span>
//                 <span
//                   className={
//                     activeTask.status === "Not Started"
//                       ? "text-[#f21e1e] mb-2 font-medium"
//                       : "text-[#0225ff] mb-2 font-medium"
//                   }
//                 >
//                   {activeTask.status}
//                 </span>
//               </div>
//               <p className="text-xs text-[#a1a3ab]">
//                 Created On: {activeTask.createdOn}
//               </p>
//             </div>
//           </div>
//           <div className="text-[#747474] leading-[2] ">
//             <p className="mt-8 mb-8">{activeTask.description}</p>
//             <p className="mb-8">{activeTask.largeDescription}</p>
//             <ol className="list-decimal">
//               {activeTask.notes.map((note) => {
//                 return (
//                   <li className="ml-6 " key={note}>
//                     {note}
//                   </li>
//                 );
//               })}
//             </ol>
//           </div>
//           <div className="flex mt-15 gap-2 justify-end">
//             <Trash2Icon className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-700" />
//             <Edit className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-700" />
//           </div>
//         </div>
//       </main>
//     </Layout>
//   );
// };

// export default VitalTask;
