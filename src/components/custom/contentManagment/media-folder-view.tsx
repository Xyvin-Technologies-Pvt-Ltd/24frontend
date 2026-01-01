import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { AddFolderModal } from "@/components/custom/contentManagment/add-folder-modal"
import { 
  Search, 
  SlidersHorizontal,
  Plus,
  Play
} from "lucide-react"

interface MediaFolderViewProps {
  onBack: () => void
  folderName: string
}

interface MediaItem {
  id: string
  type: "image" | "video"
  thumbnail: string
  title?: string
}

// Mock media items - replace with actual data
const mockMediaItems: MediaItem[] = [
  {
    id: "1",
    type: "image",
    thumbnail: "/public/sk.png",
    title: "Event Photo 1"
  },
  {
    id: "2",
    type: "image", 
    thumbnail: "/public/sk.png",
    title: "Event Photo 2"
  },
  {
    id: "3",
    type: "video",
    thumbnail: "/public/sk.png",
    title: "Event Video 1"
  },
  {
    id: "4",
    type: "image",
    thumbnail: "/public/sk.png", 
    title: "Event Photo 3"
  },
  {
    id: "5",
    type: "image",
    thumbnail: "/public/sk.png",
    title: "Event Photo 4"
  },
  {
    id: "6",
    type: "image",
    thumbnail: "/public/sk.png",
    title: "Event Photo 5"
  },
  {
    id: "7",
    type: "image",
    thumbnail: "/public/sk.png",
    title: "Event Photo 6"
  },
  {
    id: "8",
    type: "image",
    thumbnail: "/public/sk.png",
    title: "Event Photo 7"
  }
]

export function MediaFolderView({ onBack, folderName }: MediaFolderViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [mediaItems] = useState(mockMediaItems)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)

  const handleAddFolder = () => {
    setIsAddFolderModalOpen(true)
  }

  const handleSaveFolder = (newFolderName: string) => {
    // Handle saving the new folder - you can add your logic here
    console.log("New folder created:", newFolderName)
  }

  const filteredMediaItems = mediaItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] bg-[#F8F9FA] overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 px-6">
          <button 
            onClick={onBack}
            className="hover:text-gray-700"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <button 
            onClick={onBack}
            className="hover:text-gray-700"
          >
            Events
          </button>
          <span className="mx-2">›</span>
          <button 
            onClick={onBack}
            className="hover:text-gray-700"
          >
            SKN40 - Rise Against Drugs
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{folderName}</span>
        </div>

        <div className="bg-white mx-6 rounded-lg shadow-sm">
          {/* Header with Search and Actions */}
          <div className="flex items-center justify-end p-6 ">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-gray-400 rounded-full h-10"
                />
              </div>
              <Button 
                variant="outline" 
                className="border-gray-300 hover:border-gray-400 rounded-lg h-10 w-10 p-0"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              </Button>
              <Button 
                onClick={handleAddFolder}
                className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Media
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-4 gap-4">
              {filteredMediaItems.map((item) => (
                <div 
                  key={item.id} 
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                >
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Video Play Button Overlay */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Folder Modal */}
      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onSave={handleSaveFolder}
      />
    </div>
  )
}