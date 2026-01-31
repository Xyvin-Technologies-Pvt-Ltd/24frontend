import { useParams } from "react-router-dom";
import React from "react";
import { Phone, Mail, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';

// Use the actual User interface from types/user.ts
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  status: 'active' | 'inactive' | 'pending' | 'deleted' | 'suspended' | 'rejected';
  is_admin: boolean;
  admin_role?: {
    _id: string;
    role_name: string;
    permissions: string[];
  };
  last_seen?: string;
  online: boolean;
  is_installed: boolean;
  reject_reason?: string;
  createdAt: string;
  updatedAt: string;
  qr_code?: string;
  bio?: string;
  fcm?: string;
  certificates?: Array<{
    name: string;
    link: string;
  }>;
  social_media?: Array<{
    name: string;
    url: string;
  }>;
  otp?: string | null;
  campus?: {
    _id: string;
    name: string;
    district?: {
      _id: string;
      name: string;
    }
  };
  referrals?: string;
  rewardStatus?: "Posted" | "Eligible" | "Not Eligible";
  profession?: string;
  id_number?: string;
  referral_code?: string;
  referral_count?: number;
  referral_reward_status?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  user: string;
}

const ProfileOverview = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['public-user-profile', id],
    queryFn: () => userService.getPublicUserProfile(id!),
    enabled: !!id,
    retry: false, // Don't retry on 404
  });

  const userProfile: User | null = userData?.data || null;

  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    user: id || ''
  });

  // State to toggle floating icons
  const [showFloatingIcons, setShowFloatingIcons] = React.useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent successfully!');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      user: id || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isSubmitting = false;

  // Format date from ISO string to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle Save Contact button
  const handleSaveContact = () => {
    if (!userProfile) return;
    
    // Create vCard data
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${userProfile.name}
TEL:${userProfile.phone}
EMAIL:${userProfile.email}
${userProfile.profession ? `TITLE:${userProfile.profession}` : ''}
${userProfile.campus ? `ORG:${userProfile.campus.name}` : ''}
END:VCARD`;

    // Create blob and download
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userProfile.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (isError || !userProfile) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-bold text-red-600">User not found</h2>
          <p className="text-gray-500 mt-2">The profile you're looking for doesn't exist or is unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-8">Digital Profile</h2>
        
        {/* Profile Section - Fixed Layout with Floating Buttons */}
        <div className="mb-8">
          {/* Profile Section */}
          <div className="bg-blue-50 rounded-lg p-2 relative min-h-[100px]">
            {/* Row 1: Profile Image + Name + Role */}
            <div className="flex items-start gap-4 h-full">
              {/* Profile Image */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                {userProfile.image ? (
                  <img 
                    src={userProfile.image} 
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white text-2xl font-semibold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Name and Role */}
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-semibold text-gray-900">{userProfile.name}</h3>
                <p className="text-base text-gray-600 mt-1">
                  {userProfile.profession || 'Student'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Row 2: Joined Date (Left) + Save Contact Button (Right) - White BG */}
          <div className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Joined On:</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(userProfile.createdAt)}
              </p>
            </div>
            
            {/* Save Contact Button */}
            <button 
              onClick={handleSaveContact}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Save Contact
            </button>
          </div>
          
          {/* Row 3: Bio - White BG */}
          {userProfile.bio && (
            <div className="pb-6">
              <p className="text-xs text-gray-500 mb-2">Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{userProfile.bio}</p>
            </div>
          )}
        </div>
        
        {/* Floating Action Buttons - Fixed at bottom right of the page */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
          {/* Phone Icon - Shows only when toggled */}
          {showFloatingIcons && (
            <a 
              href={`tel:${userProfile.phone}`}
              className="w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out"
              title="Call"
            >
              <Phone size={18} />
            </a>
          )}
          
          {/* Email Icon - Shows only when toggled */}
          {showFloatingIcons && (
            <a 
              href={`mailto:${userProfile.email}`}
              className="w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out"
              title="Email"
            >
              <Mail size={18} />
            </a>
          )}
          
          {/* Toggle Button (Cyan/Blue) - Always visible */}
          <button 
            onClick={() => setShowFloatingIcons(!showFloatingIcons)}
            className="w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            title="Contact"
          >
            <Headphones size={18} />
          </button>
        </div>
        
        {/* Details Section */}
        <div className="space-y-4 mb-8 bg-gray-50 rounded-lg">
          {/* ID Number */}
          {userProfile.id_number && (
            <div className=" p-4">
              <p className="text-xs text-gray-500 mb-1">ID Number</p>
              <p className="text-sm font-medium text-gray-900">{userProfile.id_number}</p>
            </div>
          )}
          
          {/* Campus */}
          {userProfile.campus && (
            <div className=" p-4 ">
              <p className="text-xs text-gray-500 mb-1">Campus</p>
              <p className="text-sm font-medium text-gray-900">{userProfile.campus.name}</p>
            </div>
          )}
          
          {/* District */}
          {userProfile.campus?.district && (
            <div className=" p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">District</p>
              <p className="text-sm font-medium text-gray-900">{userProfile.campus.district.name}</p>
            </div>
          )}
          
          {/* Mail */}
          <div className=" p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Mail</p>
            <p className="text-sm font-medium text-gray-900">{userProfile.email}</p>
          </div>
          
          {/* Phone Number */}
          <div className=" p-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Phone Number</p>
            <p className="text-sm font-medium text-gray-900">{userProfile.phone}</p>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-white">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Let's Connect</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-gray-50"
              />
            </div>
            
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-gray-50"
              />
            </div>
            
            {/* Mobile Number */}
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-gray-50"
              />
            </div>
            
            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm text-gray-700 mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter message"
                rows={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none bg-gray-50"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;