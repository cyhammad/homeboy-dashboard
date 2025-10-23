"use client";
import { IMAGES } from "@/assets";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

const CustomInput = ({ type, value, onChange, error, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="text-black">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-black/70">{placeholder}</p>
        </div>
        <div className={`rounded-lg flex items-center border px-4 py-2 ${
          error ? 'border-red-500' : 'border-black/20'
        }`}>
          <input
            type={
              type === "password"
                ? showPassword
                  ? "text"
                  : "password"
                : type
            }
            placeholder={placeholder}
            className="outline-none w-full h-full"
            value={value}
            onChange={onChange}
          />
          {type === "password" ? (
            showPassword ? (
              <BsEyeSlashFill 
                onClick={() => setShowPassword(false)}
                className="cursor-pointer"
              />
            ) : (
              <BsEyeFill 
                onClick={() => setShowPassword(true)}
                className="cursor-pointer"
              />
            )
          ) : null}
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

const SignUp = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (formData.email !== 'admin@homeboy.com') {
      newErrors.email = 'Only admin@homeboy.com is allowed';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Exchange custom token for ID token using Firebase client SDK
        try {
          const { signInWithCustomToken } = await import('firebase/auth');
          const { auth } = await import('@/lib/firebase-client');
          
          // Sign in with custom token to get ID token
          const userCredential = await signInWithCustomToken(auth, data.customToken);
          const idToken = await userCredential.user.getIdToken();
          
          // Set multiple cookies with user data
          const maxAge = 86400; // 24 hours
          const cookieOptions = `path=/; max-age=${maxAge}; secure; samesite=strict`;
          
          document.cookie = `firebase-token=${idToken}; ${cookieOptions}`;
          document.cookie = `user-name=${encodeURIComponent(data.user.name)}; ${cookieOptions}`;
          document.cookie = `user-email=${encodeURIComponent(data.user.email)}; ${cookieOptions}`;
          document.cookie = `user-imageUrl=${encodeURIComponent(data.user.imageUrl)}; ${cookieOptions}`;
          document.cookie = `user-fcmToken=${encodeURIComponent(data.user.fcmToken)}; ${cookieOptions}`;
          document.cookie = `user-role=${encodeURIComponent(data.user.role)}; ${cookieOptions}`;
          
          // Redirect to dashboard
          router.push('/');
          router.refresh();
        } catch (firebaseError) {
          console.error('Firebase sign-in error:', firebaseError);
          setErrors({ general: 'Failed to complete authentication' });
        }
      } else {
        setErrors({ general: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-4 flex h-screen font-sora">
      <div className="flex-[4]">
        <Image
          alt=""
          src={IMAGES.image}
          height={100}
          width={100}
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
      <div className="flex-[6] flex justify-center w-full">
        <div className="flex px-28 items-center justify-center flex-col gap-4 w-full">
          <div className="text-center text-[#24282E] flex flex-col gap-2 py-2">
            <p className="font-semibold text-2xl">Create Account!</p>
            <p className="text-new-grey text-sm">
              Create your account to get started.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-4/5 text-new-grey text-sm">
            <CustomInput 
              type="text" 
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              error={errors.displayName}
              placeholder="Full Name"
            />
            <CustomInput 
              type="email" 
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              placeholder="Email"
            />
            <CustomInput 
              type="password" 
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              placeholder="Password"
            />
            <CustomInput 
              type="password" 
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              placeholder="Confirm Password"
            />
            
            {errors.general && (
              <div className="text-red-500 text-sm text-center">
                {errors.general}
              </div>
            )}
            
            <div className="w-full">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-2 py-2 text-center hover:bg-primary/80 bg-primary rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <div className="text-center text-new-grey py-3 text-sm">
            <p className="flex gap-1">
              Already have an account?
              <Link 
                href="/login"
                className="underline text-primary font-semibold cursor-pointer"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;