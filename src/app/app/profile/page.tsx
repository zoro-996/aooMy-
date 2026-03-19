"use client";

import { useState } from "react";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";

export default function ProfilePage() {
  const [name] = useState("User Name");
  const [email] = useState("user@email.com");
  const [image, setImage] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  return (
    <PageTransition>
      <ModulePage
        moduleKey="profile"
        title="Profile"
        subtitle="Manage your account"
      >
        {/* CENTERED CONTENT */}
        <div className="flex items-center justify-center px-4">
          
          {/* GLASS CARD */}
          <div className="w-full max-w-md rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl p-6">
            
            {/* INNER CARD */}
            <div className="bg-[#1F2937] rounded-2xl p-6 text-white flex flex-col items-center">
              
              {/* PROFILE IMAGE */}
              <div className="w-24 h-24 rounded-full border-4 border-red-300 overflow-hidden mb-4">
                <img
                  src={image || "/default-avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* UPLOAD */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="mb-4 text-sm"
              />

              {/* NAME */}
              <div className="text-lg font-semibold">{name}</div>

              {/* EMAIL */}
              <div className="text-sm text-gray-400">{email}</div>
            </div>
          </div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}