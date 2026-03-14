import AddProjectForm from "./AddProjectForm";
const AddProjectModal = ({ closeForm, onProjectCreated }) => {
  console.log("AddProjectModal rendered!");
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
      <AddProjectForm
        closeForm={closeForm}
        onProjectCreated={onProjectCreated}
      />
    </div>
  );
};

export default AddProjectModal;
