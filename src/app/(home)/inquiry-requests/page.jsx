"use client";
import React, { useState, useMemo } from "react";
import DetailsTable from "./_components/DetailsTable";
import DetailsModal from "./_components/DetailsModal";
import { useRouter } from "next/navigation";
import { useAllInquiries } from "@/hooks/useInquiries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const Bookings = () => {
  const [currentButton, setCurrentButton] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const { inquiries, loading, error } = useAllInquiries();

  const toggleModal = (inquiry = null) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  // Filter inquiries based on current tab
  const getFilteredInquiries = () => {
    if (!inquiries) return [];
    
    switch (currentButton) {
      case "All":
        return inquiries;
      case "Pending":
        return inquiries.filter(inquiry => inquiry.status?.toLowerCase() === "pending");
      case "Approved":
        return inquiries.filter(inquiry => inquiry.status?.toLowerCase() === "approved");
      case "Rejected":
        return inquiries.filter(inquiry => inquiry.status?.toLowerCase() === "rejected");
      default:
        return inquiries;
    }
  };

  const filteredInquiries = getFilteredInquiries();

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInquiries.slice(startIndex, endIndex);
  }, [filteredInquiries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);

  // Reset to first page when switching tabs
  const handleTabChange = (tab) => {
    setCurrentButton(tab);
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen px-8 py-2 font-sora flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-8 py-2 font-sora flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading inquiries: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-8 py-2 font-sora">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1 ">
              <p
                className="text-2xl font-bold cursor-pointer"
                onClick={() => {
                  router.back();
                }}
              >
                Dashboard
              </p>
              <p className="text-sm">
                <span className="text-primary"> Dashboard </span> / Inquiry
                Requests
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-col px-8 py-4 border border-black/10 rounded-2xl bg-white">
            <div className="flex items-center justify-between py-4 border-b border-b-black/20">
              <p className="font-semibold text-black/60">Inquiry Requests</p>
            </div>
            
            {/* Status Tabs */}
            <div className="flex">
              <div className="flex gap-2 border-b-[#90929414] border-b-2">
                <p
                  onClick={() => {
                    handleTabChange("All");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "All" &&
                    "bg-white text-black/60 border-b-4 border-b-primary font-bold"
                  } cursor-pointer text-sm`}
                >
                  All
                </p>
                <p
                  onClick={() => {
                    handleTabChange("Pending");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Pending" &&
                    "bg-white border-b-4 border-b-primary text-black/60 font-bold"
                  } cursor-pointer text-sm`}
                >
                  Pending
                </p>
                <p
                  onClick={() => {
                    handleTabChange("Approved");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Approved" &&
                    "bg-white border-b-4 border-b-primary text-black/60 font-bold"
                  } cursor-pointer text-sm`}
                >
                  Approved
                </p>
                <p
                  onClick={() => {
                    handleTabChange("Rejected");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Rejected" &&
                    "bg-white border-b-4 border-b-primary text-black/60 font-bold"
                  } cursor-pointer text-sm`}
                >
                  Rejected
                </p>
              </div>
            </div>
            
            <DetailsTable inquiries={paginatedData} setShowModal={toggleModal} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={handlePreviousPage}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first 3 pages, last 3 pages, and current page with ellipsis
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={handleNextPage}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          <DetailsModal
            inquiry={selectedInquiry}
            onclose={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Bookings;
