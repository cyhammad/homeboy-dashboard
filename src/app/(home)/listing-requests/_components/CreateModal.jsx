"use client";
import React, { useState, useRef } from "react";
import { createListingWithImages } from "@/lib/firebaseUtils";
import { useAuth } from "@/context/AuthContext";
import FilteredNotificationService from "@/lib/filteredNotificationService";
import clientNotificationService from "@/lib/clientNotificationService";

const CustomInput = ({ type, title, value, onChange, error }) => {
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

const CreateModal = ({
  onclose,
  status
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: ''
  });
  
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }
    
    // Validate that at least one image is uploaded
    if (files.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') && 
      (file.type === 'image/jpeg' || file.type === 'image/png')
    );
    
    if (imageFiles.length !== selectedFiles.length) {
      alert('Please select only PNG or JPEG images');
    }
    
    setFiles(prev => [...prev, ...imageFiles].slice(0, 10)); // Limit to 10 images
    
    // Clear images error when files are added
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') && 
      (file.type === 'image/jpeg' || file.type === 'image/png')
    );
    
    if (imageFiles.length !== droppedFiles.length) {
      alert('Please drop only PNG or JPEG images');
    }
    
    setFiles(prev => [...prev, ...imageFiles].slice(0, 10));
    
    // Clear images error when files are dropped
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // If removing this file would result in no files, show error
      if (newFiles.length === 0) {
        setErrors(prevErrors => ({
          ...prevErrors,
          images: 'At least one image is required'
        }));
      }
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }


    setIsSubmitting(true);

    try {
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        price: parseFloat(formData.price),
        userId: user?.uid || 'admin',
        ownerName: user?.displayName || 'Admin',
        ownerEmail: user?.email || 'admin@example.com'
      };

      const createdListing = await createListingWithImages(listingData, files);
      
      // Send notification about new listing creation to users (only pending requests are stored)
      await FilteredNotificationService.notifyNewListing({
        id: createdListing.id,
        title: listingData.title,
        ownerName: listingData.ownerName,
        ...listingData
      });

      // Send notification to admin's mobile app about listing creation
      await clientNotificationService.notifyListingCreated({
        id: createdListing.id,
        title: listingData.title,
        location: listingData.location,
        price: listingData.price,
        ownerName: listingData.ownerName,
        ...listingData
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        price: ''
      });
      setFiles([]);
      setErrors({});
      
      // Show success message
      alert('Listing created successfully!');
      onclose();
      
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Error creating listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: ''
    });
    setFiles([]);
    setErrors({});
    onclose();
  };

  return (
    <>
      <div className="z-20 absolute justify-end flex top-6 right-6 rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-1 w-[34rem]">
            <div className="flex justify-between py-3 px-6 border-b border-b-black/10">
              <p>Create Listing</p>
              <p className="cursor-pointer" onClick={handleCancel}>
                X
              </p>
            </div>
            <div className="flex flex-col gap-2 px-6 text-sm">
              <div className="text-sm border-b py-4 border-b-black/20">
                <p className="font-semibold text-black">Create Listing</p>
                <p>
                  Enter details here and listing will be live as you click
                  upload
                </p>
              </div>
              <div className="flex flex-col gap-4 py-4 text-xs">
                <div className="flex flex-col gap-2 w-full">
                  <CustomInput 
                    type="text" 
                    title="Title" 
                    value={formData.title}
                    onChange={handleInputChange('title')}
                  />
                  <CustomInput 
                    type="area" 
                    title="Description" 
                    value={formData.description}
                    onChange={handleInputChange('description')}
                  />
                  <div className="flex gap-2">
                    <CustomInput 
                      type="text" 
                      title="Location" 
                      value={formData.location}
                      onChange={handleInputChange('location')}
                    />
                    <CustomInput 
                      type="text" 
                      title="Asking Price" 
                      value={formData.price}
                      onChange={handleInputChange('price')}
                    />
                  </div>
                  <div>
                    <div className="flex flex-col gap-1">
                      <p>Gallery ({files.length}/10) <span className="text-red-500">*</span></p>
                      <label htmlFor="file">
                        <div 
                          className={`border cursor-pointer flex justify-center items-center border-dashed rounded-lg h-24 w-full transition-colors ${
                            isDragOver 
                              ? 'border-primary bg-primary/5' 
                              : 'border-black/30'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
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
                        ref={fileInputRef}
                        multiple
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                      />
                      
                      {files.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {files.map((file, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-16 object-cover rounded"
                              />
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.images && (
                        <p className="text-red-500 text-xs mt-1">{errors.images}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex text-xs gap-2 py-2 px-6 justify-end border-t border-t-black/10">
              <div 
                className="px-6 py-2 rounded-sm text-primary bg-transparent border border-primary cursor-pointer"
                onClick={handleCancel}
              >
                <p>Cancel</p>
              </div>
              <div 
                className={`px-6 py-2 rounded-sm text-white cursor-pointer ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary/80'
                }`}
                onClick={isSubmitting ? undefined : handleSubmit}
              >
                <p>{isSubmitting ? 'Uploading...' : 'Upload'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateModal;
