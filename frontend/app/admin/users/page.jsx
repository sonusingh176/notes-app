"use client";


import { useState,useEffect } from "react";
import { DataTable } from "../../../components/ui/DataTable";
import { registeredUserApi } from "@/lib/api";

const AdminUsersPage = () => {

  const [users,setUsers]= useState([]);
  const [loading,setLoading]=useState(true);
  
  useEffect(()=>{
    registeredUserApi.getAll()
      .then((res)=>setUsers(res.users))
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);


  const columns = [
    {
      key: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      accessorKey: "email",
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      accessorKey: "phone",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
    },
  ];

  // Convert API data into table rows
  const rows = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    status: user.is_blocked ? "Blocked" : "Active",
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">
        Customers List
      </h1>

       {loading ? (
        <p className="text-white">Loading customers...</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found."
        />
      )}
    </div>
  );
};

export default AdminUsersPage;