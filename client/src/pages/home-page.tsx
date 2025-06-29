import NavigationHeader from "@/components/navigation-header";
import LeftSidebar from "@/components/left-sidebar";
import MainFeed from "@/components/main-feed";
import RightSidebar from "@/components/right-sidebar";
import UploadModal from "@/components/upload-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HomePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader onOpenUpload={() => setIsUploadModalOpen(true)} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <LeftSidebar onOpenUpload={() => setIsUploadModalOpen(true)} />
          </div>
          
          <div className="lg:col-span-6">
            <MainFeed onOpenUpload={() => setIsUploadModalOpen(true)} />
          </div>
          
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Button
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-crunevo-purple text-white rounded-full shadow-lg hover:bg-purple-600 z-40"
        onClick={() => setIsUploadModalOpen(true)}
      >
        <Plus className="text-xl" />
      </Button>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
