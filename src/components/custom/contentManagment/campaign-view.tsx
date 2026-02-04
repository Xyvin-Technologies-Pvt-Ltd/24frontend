import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/custom/top-bar"
import { ArrowLeft, Edit, Calendar, Target, Users, DollarSign } from "lucide-react"
import { useCampaign } from "@/hooks/useCampaigns"
import type { MultilingualField } from "@/types/campaign"

interface CampaignViewProps {
  onBack: () => void
  onEdit: (campaignId: string) => void
  campaignId: string
}

// Helper function to safely get English text from multilingual fields
const getEnglishText = (text: string | MultilingualField | undefined): string => {
  if (!text) return 'N/A'
  
  if (typeof text === 'string') {
    return text
  }
  
  if (typeof text === 'object' && text !== null) {
    return text.en || text.ml || 'N/A'
  }
  
  return 'N/A'
}

export function CampaignView({ onBack, onEdit, campaignId }: CampaignViewProps) {
  const { data: campaignResponse, isLoading, error } = useCampaign(campaignId)
  
  const campaign = campaignResponse?.data

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading campaign details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Failed to load campaign details</div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const progressPercentage = Math.min((campaign.collected_amount / campaign.target_amount) * 100, 100)

  // Get English text from multilingual fields
  const title = getEnglishText(campaign.title)
  const description = getEnglishText(campaign.description)
  const organizedBy = getEnglishText(campaign.organized_by)

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span>Content Management</span>
                <span className="mx-2">›</span>
                <span>Campaigns</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900">Campaign Details</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
          
          <Button
            onClick={() => onEdit(campaignId)}
            className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            {campaign.cover_image && (
              <div className="bg-white rounded-2xl p-6">
                <img
                  src={campaign.cover_image}
                  alt={title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">About this Campaign</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="font-medium">{organizedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(campaign.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Target Date</p>
                    <p className="font-medium">{formatDate(campaign.target_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-center text-sm font-bold text-gray-400">#</span>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">#{campaign.tag}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Campaign Progress</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : campaign.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Raised</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Raised</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(campaign.collected_amount)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(campaign.target_amount)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Donors</span>
                  </div>
                  <span className="font-semibold">{campaign.total_donation || 0}</span>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.approval_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : campaign.approval_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.approval_status.charAt(0).toUpperCase() + campaign.approval_status.slice(1)}
                </span>
              </div>
              {campaign.reason && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">Reason:</p>
                  <p className="text-sm text-gray-700">{campaign.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}