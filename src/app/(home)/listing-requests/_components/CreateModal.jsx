"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Swal from "sweetalert2";

const CustomInput = ({ type, title, value, onChange }) => {
  return (
    <div className="text-black w-full">
      <div className="flex flex-col gap-2">
        <div className="flex ">
          <p className="text-black/70">{title}</p>
        </div>
        <div className="rounded-lg flex items-center border border-black/20 px-4 py-2">
          {type == "area" ? (
            <textarea
              placeholder="Write"
              cols={10}
              rows={3}
              className="w-full outline-none"
              value={value}
              onChange={onChange}
            />
          ) : (
            <input
              type={type}
              placeholder="Write"
              className="outline-none w-full h-full"
              value={value}
              onChange={onChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const CreateModal = ({ onclose, status }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current logged in user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => [...prev, ...imageUrls]);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.price
    ) {
      // Close dialog first
      onclose();

      await Swal.fire({
        title: "Missing Information",
        text: "Please fill in all required fields before submitting.",
        icon: "warning",
        confirmButtonColor: "#27ABEB",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!currentUserId) {
      // Close dialog first
      onclose();

      await Swal.fire({
        title: "Authentication Error",
        text: "You must be logged in to create a listing. Please log in and try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsUploading(true);

    // Close dialog first
    onclose();

    // Show loading state
    Swal.fire({
      title: "Creating Listing...",
      text: "Please wait while we save your listing.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Upload images to Firebase Storage via API route
      const userId = currentUserId;
      const imageUrls = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const timestamp = Date.now() + i; // Ensure unique timestamps
        
        // Upload via API route to get URL in phone app format
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('userId', userId);
        uploadFormData.append('timestamp', timestamp.toString());
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || 'Failed to upload image');
        }
        
        const data = await response.json();
        imageUrls.push(data.url);
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        status: status?.toLowerCase() || "pending",
        imageUrls: imageUrls,
        userId: userId,
        createdAt: serverTimestamp(),
        likedBy: [],
        sharedBy: [],
      };

      await addDoc(collection(db, "listings"), listingData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        price: "",
      });
      setUploadedImages([]);
      setUploadedFiles([]);

      // Success message
      await Swal.fire({
        title: "Success!",
        text: "Your listing has been created successfully and is now live.",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Great!",
      });
    } catch (error) {
      console.error("Error creating listing:", error);

      // Error message
      await Swal.fire({
        title: "Error",
        text: "Failed to create listing. Please check your connection and try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full px-6 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col gap-2 text-sm">
        <div className="text-sm border-b py-4 border-b-black/20">
          <p>Enter details here and listing will be live as you click upload</p>
        </div>
        <div className="flex flex-col gap-4 py-4 text-xs">
          <div className="flex flex-col gap-2 w-full">
            <CustomInput
              type="text"
              title="Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            <CustomInput
              type="area"
              title="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            <div className="flex gap-2">
              <CustomInput
                type="text"
                title="Location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
              <CustomInput
                type="number"
                title="Asking Price"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
              />
            </div>
            <div>
              <div className="flex flex-col gap-1">
                <p>Gallery</p>
                <label htmlFor="file">
                  <div className="border cursor-pointer flex justify-center items-center border-dashed border-black/30 rounded-lg h-24 w-full">
                    <div className="text-center">
                      <p>Drag here or upload</p>
                      <p>Png or Jpeg</p>
                    </div>
                  </div>
                </label>
                <input
                  type="file"
                  className="hidden"
                  id="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Display uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Uploaded Images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((imageUrl, index) => {
                      return (
                        <div key={index} className="relative">
                          {imageUrl !== "" ? (
                            <Image
                              src={imageUrl}
                              alt={`Upload ${index + 1}`}
                              width={150}
                              height={100}
                              className="rounded-lg object-cover w-full h-24"
                            />
                          ) : (
                            <div className="rounded-lg object-cover w-full h-24 bg-gray-200 flex items-center justify-center">
                              <p>No image</p>
                            </div>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex text-xs gap-2 py-2 justify-end border-t border-t-black/10">
        <div
          onClick={onclose}
          className="px-6 py-2 rounded-sm text-primary bg-transparent border border-primary cursor-pointer"
        >
          <p>Cancel</p>
        </div>
        <div
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-sm text-white cursor-pointer ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/80"
          }`}
        >
          <p>{isUploading ? "Uploading..." : "Upload"}</p>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
