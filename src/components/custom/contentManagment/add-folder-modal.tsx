import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"

interface AddFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (folderName: string) => void
}

export function AddFolderModal({ isOpen, onClose, onSave }: AddFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  const handleSave = () => {
    if (folderName.trim()) {
      onSave(folderName.trim())
      setFolderName("")
      onClose()
    }
  }

  const handleCancel = () => {
    setFolderName("")
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel}
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add New Folder</h2>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name
            </label>
            <Input
              type="text"
              placeholder="Enter file name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full border-gray-300 rounded-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!folderName.trim()}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-full"
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  )
}