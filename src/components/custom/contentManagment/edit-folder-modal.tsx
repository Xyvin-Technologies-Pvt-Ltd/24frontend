import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { X } from "lucide-react"
import type { Folder } from "@/types/folder"

interface EditFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (folderName: string) => void
  folder: Folder | null
  isLoading?: boolean
}

export function EditFolderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  folder,
  isLoading = false 
}: EditFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name)
    }
  }, [folder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onSave(folderName.trim())
    }
  }

  const handleClose = () => {
    setFolderName("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Folder</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name
            </label>
            <Input
              id="folderName"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim() || isLoading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}