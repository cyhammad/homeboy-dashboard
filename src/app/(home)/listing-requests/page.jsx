"use client";
import React, { useState, useMemo } from "react";
import DetailsTable from "./_components/DetailsTable";
import DetailsModal from "./_components/DetailsModal";
import CancelledTable from "./_components/CancelledTable";
import PendingTable from "./_components/PendingTable";
import CreateModal from "./_components/CreateModal";
import { useAllListings } from "@/hooks/useListings";
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

const ListingRequests = () => {
  const [currentButton, setCurrentButton] = useState("Approved");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { listings, loading, error } = useAllListings();

  const toggleModal = (listing = null) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  // Filter listings based on current tab
  const getFilteredListings = () => {
    if (!listings) return [];
    
    switch (currentButton) {
      case "Approved":
        return listings.filter(listing => listing.status?.toLowerCase() === "approved");
      case "Pending":
        return listings.filter(listing => listing.status?.toLowerCase() === "pending");
      case "Rejected":
        return listings.filter(listing => listing.status?.toLowerCase() === "rejected");
      default:
        return listings;
    }
  };

  const filteredListings = getFilteredListings();

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredListings.slice(startIndex, endIndex);
  }, [filteredListings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

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
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-8 py-2 font-sora flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading listings: {error}</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen px-8 py-2 font-sora">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-new-black">Dashboard</p>
              <p className="text-new-grey text-sm">
                <span className="text-primary">Dashboard</span> / Listing
                Requests
              </p>
            </div>
            <div className="flex justify-end">
              <p onClick={() => setShowCreateModal(true)} className="flex bg-primary text-sm hover:bg-primary/90 cursor-pointer text-white px-3 py-2 rounded-xl ">
                Create Listing
              </p>
            </div>
          </div>
          <div className="flex flex-col px-8 py-4 border border-black/10 rounded-2xl bg-white">
            <div className="flex items-center justify-between py-4 border-b border-b-black/20">
              <p className="font-semibold text-black/60">Listing Requests</p>
            </div>
            <div className="flex">
              <div className="flex gap-2 border-b-[#90929414] border-b-2">
                <p
                  onClick={() => {
                    handleTabChange("Approved");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Approved" &&
                    "bg-white text-black/60 border-b-4 border-b-primary font-bold"
                  } cursor-pointer text-sm`}
                >
                  Approved
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
            <div className="flex flex-col gap-4">
              {currentButton == "Approved" && (
                <DetailsTable listings={paginatedData} setShowModal={toggleModal} />
              )}
              {currentButton == "Pending" && (
                <PendingTable listings={paginatedData} setShowModal={toggleModal} />
              )}
              {currentButton == "Rejected" && (
                <CancelledTable listings={paginatedData} setShowModal={toggleModal} />
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
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
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Listing Requests</DialogTitle>
          </DialogHeader>
          <DetailsModal
            listing={selectedListing}
            status={currentButton}
            onclose={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Listing</DialogTitle>
          </DialogHeader>
          <CreateModal
            status={currentButton}
            onclose={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListingRequests;