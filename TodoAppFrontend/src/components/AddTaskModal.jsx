import AddTask from "../assets/pages/AddTask";

const AddTaskModal = ({ projectId, closeForm, onTaskCreated }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
      <AddTask
        projectId={projectId}
        closeForm={closeForm}
        onTaskCreated={onTaskCreated}
      />
    </div>
  );
};

export default AddTaskModal;
