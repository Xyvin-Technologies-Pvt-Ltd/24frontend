import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface ViewLevelModalProps {
    isOpen: boolean
    onClose: () => void
    levelType: "district" | "campus"
    data: {
        id: string
        name: string
        displayId: string // uid
        dateCreated: string
        districtName?: string // for campus
        totalCampuses?: number // for district
        totalMembers?: number
    } | null
}

export function ViewLevelModal({ isOpen, onClose, levelType, data }: ViewLevelModalProps) {
    if (!data) return null

    const title = levelType === "district" ? "District Details" : "Campus Details"

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            {levelType === "district" ? "District Name" : "Campus Name"}
                        </label>
                        <p className="text-sm font-semibold text-gray-900">{data.name}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            ID
                        </label>
                        <p className="text-sm font-semibold text-gray-900">{data.displayId}</p>
                    </div>

                    {levelType === "campus" && (
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                District
                            </label>
                            <p className="text-sm font-semibold text-gray-900">{data.districtName}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Date Created
                        </label>
                        <p className="text-sm font-semibold text-gray-900">{data.dateCreated}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Total Members
                        </label>
                        <p className="text-sm font-semibold text-gray-900">{data.totalMembers}</p>
                    </div>

                    {levelType === "district" && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                Total Campuses
                            </label>
                            <p className="text-sm font-semibold text-gray-900">{data.totalCampuses}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={onClose}
                        className="px-8 bg-black hover:bg-gray-800 text-white rounded-full"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
