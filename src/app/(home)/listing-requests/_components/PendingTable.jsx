import React from "react";
import ArrowRight from "@/assets/icons/ArrowRight";
import Swal from 'sweetalert2';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const PendingTable = ({ listings = [], setShowModal }) => {
  const headers = [
    "No",
    "Title",
    "Location",
    "Price",
    "Status",
    "Accept/Reject",
    "Actions",
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getInitials = (title) => {
    if (!title) return "N/A";
    return title.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStatusChange = async (listingId, newStatus, listingTitle) => {
    const actionText = newStatus === 'approved' ? 'approve' : 'reject';
    const actionColor = newStatus === 'approved' ? '#10b981' : '#ef4444';
    
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this listing?`,
      text: `"${listingTitle}" will be ${actionText}d and moved to the ${newStatus} section.`,
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
        // Show loading state
        Swal.fire({
          title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ing...`,
          text: 'Please wait while we update the listing status.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await fetch(`/api/listings/${listingId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update listing status');
        }

        const result = await response.json();
        
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: `Listing has been ${actionText}d successfully.`,
          icon: 'success',
          confirmButtonColor: actionColor,
          timer: 2000,
          timerProgressBar: true
        });
        
      } catch (error) {
        console.error('Error updating listing status:', error);
        
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update listing status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };
  return (
    <div className="w-full border border-black/10 rounded-2xl overflow-hidden">
      {listings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending listings found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {headers.map((header, index) => (
                <TableHead key={index} className="px-4 py-3">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing, index) => (
              <TableRow key={listing.id} className="text-[#7A7C7F] text-sm">
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {listing.id.slice(0, 4).toUpperCase()}.
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <p className="bg-primary rounded-full w-7 h-7 text-xs items-center text-white justify-center flex shrink-0">
                      {getInitials(listing.title)}
                    </p>
                    <p className="truncate">{listing.title || "Untitled"}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {listing.location || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {formatPrice(listing.price)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="py-[2px] h-6 px-3 gap-2 flex rounded-full items-center bg-new-yellow/20 text-new-yellow w-fit">
                    <p className="h-[6px] w-[6px] rounded-full bg-new-yellow" />
                    <p className="rounded-full capitalize">{listing.status}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex gap-1">
                    <div 
                      onClick={() => handleStatusChange(listing.id, 'rejected', listing.title)}
                      className="px-4 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80 whitespace-nowrap"
                    >
                      <p>Reject</p>
                    </div>
                    <div 
                      onClick={() => handleStatusChange(listing.id, 'approved', listing.title)}
                      className="px-4 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80 whitespace-nowrap"
                    >
                      <p>Accept</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div
                    onClick={() => setShowModal(listing)}
                    className="gap-1 font-semibold flex items-center cursor-pointer text-primary w-fit"
                  >
                    View Details
                    <ArrowRight size={20} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PendingTable;
