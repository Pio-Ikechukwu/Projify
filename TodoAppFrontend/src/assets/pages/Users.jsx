import { useState, useEffect } from "react";
import { useParams } from "react-router";
import InviteModal from "../../components/InviteModal";

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const Users = () => {
  const { projectId } = useParams();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, tasksRes, invitesRes] = await Promise.all([
          fetch(`http://localhost:3000/projects/${projectId}/members`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/projects/${projectId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/projects/${projectId}/invites`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const membersData = await membersRes.json();
        const tasksData = await tasksRes.json();
        const invitesData = await invitesRes.json();
        setMembers(Array.isArray(membersData) ? membersData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setInvites(Array.isArray(invitesData) ? invitesData : []);
      } catch (err) {
        console.error("Error fetching users data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, token]);

  const getActiveTasks = (userId) =>
    tasks.filter((t) => t.assignedToID === userId && t.status !== "Completed")
      .length;

  const getCompletedTasks = (userId) =>
    tasks.filter((t) => t.assignedToID === userId && t.status === "Completed")
      .length;

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Members</h1>
      <button
        className="py-2 px-4 rounded-lg border border-[#ff6767] text-[#ff6767] hover:bg-[#ff6767] hover:text-white cursor-pointer mb-4"
        onClick={() => setIsInviteModalOpen(true)}
      >
        Invite
      </button>

      {/* Members Grid */}
      {members.length === 0 ? (
        <p className="text-gray-400">No members yet. Invite someone!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center"
            >
              <div className="w-25 h-25 rounded-full bg-[#ff6767] text-white flex items-center justify-center text-3xl font-bold mb-4">
                {member.fullName?.[0] || "?"}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {member.fullName}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{member.email}</p>
              <div className="w-full pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-400">
                  Active Tasks:
                </span>
                <span className="bg-[#ff6767] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {getActiveTasks(member.userId)}
                </span>
              </div>
              <div className="w-full pt-2 border-t border-gray-100 flex justify-between items-center mt-2">
                <span className="text-xs font-medium text-gray-400">
                  Completed Tasks:
                </span>
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {getCompletedTasks(member.userId)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invites Section */}
      {invites.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sent Invites</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-gray-700">{invite.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full  ${statusBadge[invite.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {invite.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <InviteModal
          projectId={projectId}
          closeInviteModal={() => {
            setIsInviteModalOpen(false);
            fetch(`http://localhost:3000/projects/${projectId}/invites`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => setInvites(Array.isArray(data) ? data : []));
          }}
        />
      )}
    </div>
  );
};

export default Users;
