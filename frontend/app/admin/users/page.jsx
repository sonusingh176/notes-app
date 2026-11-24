"use client";

import React from "react";
import { DataTable } from "../../../components/ui/DataTable";

const AdminUsersPage = () => {
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
    },
  ];

  const rows = [
    {
      _id: "1",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "9876543210",
      status: "Active",
    },
    {
      _id: "2",
      name: "Priya Singh",
      email: "priya@example.com",
      phone: "9876543211",
      status: "Inactive",
    },
    {
      _id: "3",
      name: "Amit Kumar",
      email: "amit@example.com",
      phone: "9876543212",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">
        Customers List
      </h1>

      <DataTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search customers..."
        emptyMessage="No customers found."
      />
    </div>
  );
};

export default AdminUsersPage;