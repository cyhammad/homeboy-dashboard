import ArrowRight from "@/assets/icons/ArrowRight";
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const CancelledTable = ({ listings = [], setShowModal }) => {
  const headers = [
    "No",
    "Title",
    "Location",
    "Price",
    "Beds",
    "Baths",
    "Area",
    "Condition",
    "Status",
    "Rejected Date",
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

  return (
    <div className="w-full border border-black/10 rounded-2xl overflow-hidden">
      {listings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No rejected listings found
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
                <TableCell className="px-4 py-4 max-w-[300px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="bg-primary rounded-full w-7 h-7 text-xs items-center text-white justify-center flex shrink-0">
                      {getInitials(listing.title)}
                    </p>
                    <p className="truncate">{listing.title || "Untitled"}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 max-w-[300px] truncate whitespace-nowrap">
                  {listing.location || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {formatPrice(listing.price)}
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {listing.bedCount || 0}
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {listing.bathCount || 0}
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap max-w-[300px] truncate">
                  {listing.area ? `${listing.area.toLocaleString()} sq ft` : "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {listing.propertyCondition ? `${listing.propertyCondition}/10` : "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="py-[2px] px-3 gap-2 flex rounded-full items-center bg-new-red/20 text-new-red w-fit">
                    <p className="h-[6px] w-[6px] rounded-full bg-new-red" />
                    <p className="rounded-full capitalize">{listing.status}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {formatDate(listing.updatedAt)}
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

export default CancelledTable;
