import { useEffect, useState } from "react";
import avatarImg from "../assets/avatar.jpg";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Header from "./Header";
import { fetchAllUsers, deleteUser } from "../store/slices/adminSlice";
import type { User } from "../types/index";

const Users = () => {
  const [page, setPage] = useState(1);
  const { loading, users, totalUsers } = useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();
  const [maxPage, setMaxPage] = useState<number | null>(null);

  useEffect(() => { dispatch(fetchAllUsers(page)); }, [page, dispatch]);
  useEffect(() => { if (totalUsers !== undefined) setMaxPage(Math.ceil(totalUsers / 10) || 1); }, [totalUsers]);
  useEffect(() => { if (maxPage && page > maxPage) setPage(maxPage); }, [maxPage, page]);

  return (
    <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
      <div className="flex-1 md:p-6">
        <Header />
        <h1 className="text-2xl font-bold">All Users</h1>
        <p className="text-sm text-gray-600 mb-6">Manage all your website users.</p>
      </div>
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className={`overflow-x-auto rounded-lg ${loading ? "p-10 shadow-none" : `${users && users.length > 0 && "shadow-lg"}`}`}>
          {loading ? (
            <div className="w-40 h-40 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : users && users.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Avatar</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Registered On</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User, index: number) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4"><img src={user?.avatar?.url || avatarImg} alt="avatar" className="w-10 h-10 rounded-full object-cover" /></td>
                    <td className="px-3 py-4">{user.name}</td>
                    <td className="px-3 py-4">{user.email}</td>
                    <td className="px-3 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-4">
                      <button onClick={() => dispatch(deleteUser(user.id, page))} className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-gradient hover:opacity-90">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <h3>No Users Found!!</h3>}
        </div>
        {!loading && users.length > 0 && (
          <div className="flex justify-center mt-6 gap-4">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50">Previous</button>
            <span className="px-4 py-2 text-gray-700">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={maxPage === page} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Users;
