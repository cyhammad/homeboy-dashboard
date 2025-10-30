import React from "react";
import ArrowRight from "@/assets/icons/ArrowRight";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DetailsTable = ({ inquiries, setShowModal }) => {
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="w-full border border-black/10 rounded-2xl p-8 text-center">
        <p className="text-gray-500">No inquiries found</p>
      </div>
    );
  }
  return (
    <div className="w-full border border-black/10 rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 rounded-2xl">
            <TableHead className="text-start">No</TableHead>
            <TableHead className="text-start">Customer</TableHead>
            <TableHead className="text-start">Email</TableHead>
            <TableHead className="text-start">Phone</TableHead>
            <TableHead className="text-start">Request Date</TableHead>
            <TableHead className="text-start">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inquiry, index) => (
            <TableRow key={inquiry.id} className="border-b border-b-black/10">
              <TableCell className="text-[#7A7C7F] text-sm">
                {index + 1}.
              </TableCell>
              <TableCell className="text-[#7A7C7F] text-sm">
                <div className="flex items-center gap-2">
                  <p className="bg-primary rounded-full w-7 h-7 text-xs items-center text-white justify-center flex">
                    {getInitials(inquiry.buyerName)}
                  </p>
                  <p>{inquiry.buyerName || 'N/A'}</p>
                </div>
              </TableCell>
              <TableCell className="text-[#7A7C7F] text-sm">
                {inquiry.buyerEmail || 'N/A'}
              </TableCell>
              <TableCell className="text-[#7A7C7F] text-sm">
                {inquiry.buyerPhone || 'N/A'}
              </TableCell>
              <TableCell className="text-[#7A7C7F] text-sm">
                {formatDate(inquiry.requestedAt)}
              </TableCell>
              <TableCell className="text-[#7A7C7F] text-sm">
                <div
                  onClick={() => setShowModal(inquiry)}
                  className="gap-1 font-semibold flex items-center cursor-pointer text-primary"
                >
                  View Details
                  <ArrowRight size={20} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetailsTable;
