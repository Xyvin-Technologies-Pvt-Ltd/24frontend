import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"

interface EditLevelModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, data: any) => void
    levelType: "district" | "campus"
    districts?: { id: string, name: string }[]
    initialData: {
        id: string
        name: string
        districtId?: string // district id if levelType is campus
    } | null
}

export function EditLevelModal({
    isOpen,
    onClose,
    onSave,
    levelType,
    districts = [],
    initialData
}: EditLevelModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        district: ""
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                district: initialData.districtId || ""
            })
        }
    }, [initialData, isOpen])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = () => {
        if (formData.name.trim() && initialData) {
            if (levelType === "campus" && !formData.district) return

            const updateData: any = {
                name: formData.name
            }

            if (levelType === "campus") {
                updateData.district = formData.district
            }

            onSave(initialData.id, updateData)
        }
    }

    const title = levelType === "district" ? "Edit District" : "Edit Campus"

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                {/* Level Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {levelType === "district" ? "District Name" : "Campus Name"}
                    </label>
                    <Input
                        placeholder={levelType === "district" ? "Enter district name" : "Enter campus name"}
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full border-gray-300 rounded-xl h-12"
                    />
                </div>

                {/* District Field for Campus */}
                {levelType === "campus" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            District
                        </label>
                        <Select
                            value={formData.district}
                            onChange={(e) => handleInputChange("district", e.target.value)}
                            placeholder="Select District"
                            className="w-full border-gray-300 rounded-xl h-12"
                        >
                            <option value="" disabled>Select District</option>
                            {districts.map(district => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.name.trim() || (levelType === "campus" && !formData.district)}
                        className="px-6 bg-black hover:bg-gray-800 text-white rounded-full disabled:opacity-50"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
