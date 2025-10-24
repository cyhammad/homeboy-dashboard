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
import Swal from 'sweetalert2';

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

  const handleStatusChange = async (inquiryId, newStatus, buyerName) => {
    const actionText = newStatus === 'approved' ? 'approve' : 'reject';
    const actionColor = newStatus === 'approved' ? '#10b981' : '#ef4444';
    
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this inquiry?`,
      text: `"${buyerName}"'s inquiry will be ${actionText}d and moved to the ${newStatus} section.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText} it!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Processing...',
          text: `Please wait while we ${actionText} the inquiry.`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await fetch(`/api/inquiries/${inquiryId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update inquiry status');
        }

        Swal.fire({
          title: 'Success!',
          text: `Inquiry has been ${actionText}d successfully.`,
          icon: 'success',
          confirmButtonColor: actionColor,
          confirmButtonText: 'Great!'
        });

        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        console.error('Error updating inquiry status:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to update inquiry status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Try Again'
        });
      }
    }
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
            <TableHead className="text-start">Status</TableHead>
            <TableHead className="text-start">Actions</TableHead>
            <TableHead className="text-start">Accept/Reject</TableHead>
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  inquiry.status?.toLowerCase() === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : inquiry.status?.toLowerCase() === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {inquiry.status || 'Pending'}
                </span>
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
              <TableCell className="text-[#7A7C7F] text-sm">
                {inquiry.status?.toLowerCase() === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(inquiry.id, 'approved', inquiry.buyerName)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(inquiry.id, 'rejected', inquiry.buyerName)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">No actions</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetailsTable;
