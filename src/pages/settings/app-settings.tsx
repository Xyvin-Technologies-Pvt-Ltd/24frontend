import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { useSettings, useUpdateSettings } from "@/hooks/useSettings"
import { useToast } from "@/hooks/useToast"
import type { ApplicationSettings } from "@/types/settings"
import { Save, Loader2 } from "lucide-react"

export function ApplicationSettingsPage() {
    const { toasts, removeToast, success, error: showError } = useToast()
    const { data: settingsResponse, isLoading } = useSettings()
    const updateSettingsMutation = useUpdateSettings()

    const [formData, setFormData] = useState<ApplicationSettings>({
        customer: {
            ios: {
                version: 0,
                force: false,
                applink: "",
                updateDate: "",
                updateMessage: ""
            },
            android: {
                version: 0,
                force: false,
                applink: "",
                updateDate: "",
                updateMessage: ""
            }
        }
    })

    // Load initial data when settings are fetched
    useEffect(() => {
        if (settingsResponse?.data?.application) {
            setFormData(settingsResponse.data.application)
        }
    }, [settingsResponse])

    const handleInputChange = (
        platform: 'ios' | 'android',
        field: string,
        value: string | number | boolean
    ) => {
        setFormData(prev => ({
            customer: {
                ...prev.customer,
                [platform]: {
                    ...prev.customer[platform],
                    [field]: value
                }
            }
        }))
    }

    const handleSave = async () => {
        try {
            await updateSettingsMutation.mutateAsync({ application: formData })
            success("Settings updated successfully")
        } catch (error: any) {
            showError(
                "Failed to update settings",
                error?.response?.data?.message || "An error occurred"
            )
        }
    }

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return ""
        try {
            const date = new Date(dateString)
            return date.toISOString().slice(0, 16)
        } catch {
            return ""
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen">
                <TopBar />
                <div className="flex-1 pt-[100px] p-8 bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <TopBar />

            <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                        <span>Settings</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-900">Application Settings</span>
                    </div>
                    <Button
                        className="bg-black rounded-full hover:bg-gray-800 text-white"
                        onClick={handleSave}
                        disabled={updateSettingsMutation.isPending}
                    >
                        {updateSettingsMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* iOS Settings */}
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-xl font-semibold text-gray-900">iOS Application</h2>
                                <p className="text-sm text-gray-600 mt-1">Configure iOS app version and update settings</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Version Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.customer.ios.version}
                                        onChange={(e) => handleInputChange('ios', 'version', parseInt(e.target.value) || 0)}
                                        placeholder="e.g., 11"
                                        className="border-gray-300 focus:border-gray-400 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Force Update
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="ios-force"
                                                checked={formData.customer.ios.force === true}
                                                onChange={() => handleInputChange('ios', 'force', true)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="ios-force"
                                                checked={formData.customer.ios.force === false}
                                                onChange={() => handleInputChange('ios', 'force', false)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">No</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        App Store Link <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="url"
                                        value={formData.customer.ios.applink}
                                        onChange={(e) => handleInputChange('ios', 'applink', e.target.value)}
                                        placeholder="https://apps.apple.com/..."
                                        className="border-gray-300 focus:border-gray-400 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Date
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={formatDateForInput(formData.customer.ios.updateDate)}
                                        onChange={(e) => handleInputChange('ios', 'updateDate', new Date(e.target.value).toISOString())}
                                        className="border-gray-300 focus:border-gray-400 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Message
                                    </label>
                                    <textarea
                                        value={formData.customer.ios.updateMessage}
                                        onChange={(e) => handleInputChange('ios', 'updateMessage', e.target.value)}
                                        placeholder="We have fixed a small bug, Please update the app"
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Android Settings */}
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Android Application</h2>
                                <p className="text-sm text-gray-600 mt-1">Configure Android app version and update settings</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Version Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.customer.android.version}
                                        onChange={(e) => handleInputChange('android', 'version', parseInt(e.target.value) || 0)}
                                        placeholder="e.g., 15"
                                        className="border-gray-300 focus:border-gray-400 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Force Update
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="android-force"
                                                checked={formData.customer.android.force === true}
                                                onChange={() => handleInputChange('android', 'force', true)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="android-force"
                                                checked={formData.customer.android.force === false}
                                                onChange={() => handleInputChange('android', 'force', false)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">No</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Play Store Link <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="url"
                                        value={formData.customer.android.applink}
                                        onChange={(e) => handleInputChange('android', 'applink', e.target.value)}
                                        placeholder="https://play.google.com/store/apps/..."
                                        className="border-gray-300 focus:border-gray-400 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Date
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={formatDateForInput(formData.customer.android.updateDate)}
                                        onChange={(e) => handleInputChange('android', 'updateDate', new Date(e.target.value).toISOString())}
                                        className="border-gray-300 focus:border-gray-400 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Message
                                    </label>
                                    <textarea
                                        value={formData.customer.android.updateMessage}
                                        onChange={(e) => handleInputChange('android', 'updateMessage', e.target.value)}
                                        placeholder="We have fixed a small bug, Please update the app"
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
