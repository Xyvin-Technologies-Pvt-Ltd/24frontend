import { useState } from "react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TopBar } from "@/components/custom/top-bar"
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar,
  User,
  Edit,
  MoreHorizontal,
  Users,
  Award,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  userId: string
  email: string
  phone: string
  campus: string
  district: string
  dateOfBirth: string
  gender: string
  bio: string
  avatar?: string
  joinDate: string
  lastActive: string
  rewardStatus: "Posted" | "Eligible" | "Not Eligible"
  referrals: {
    total: number
    completed: number
    pending: number
  }
  points: number
  level: string
  achievements: Array<{
    id: string
    title: string
    description: string
    earnedDate: string
    icon: string
  }>
  activities: Array<{
    id: string
    type: string
    description: string
    date: string
    points?: number
  }>
}

const mockUserProfile: UserProfile = {
  id: "1",
  name: "Sebastian Sharun",
  userId: "CON1234",
  email: "charles5182@ummoh.com",
  phone: "33757005467",
  campus: "St. Xaviers",
  district: "Thrissur",
  dateOfBirth: "June 26, 1980",
  gender: "Male",
  bio: "Growing. Learning. Becoming better.",
  avatar: "",
  joinDate: "2024-01-15",
  lastActive: "2024-01-20",
  rewardStatus: "Eligible",
  referrals: {
    total: 5,
    completed: 5,
    pending: 0
  },
  points: 2450,
  level: "Gold",
  achievements: [
    {
      id: "1",
      title: "First Referral",
      description: "Successfully referred your first member",
      earnedDate: "2024-01-16",
      icon: "🎯"
    },
    {
      id: "2",
      title: "Top Performer",
      description: "Reached 5 successful referrals",
      earnedDate: "2024-01-18",
      icon: "🏆"
    },
    {
      id: "3",
      title: "Community Builder",
      description: "Active member for 30 days",
      earnedDate: "2024-01-20",
      icon: "🌟"
    }
  ],
  activities: [
    {
      id: "1",
      type: "referral",
      description: "Referred a new member: John Doe",
      date: "2024-01-20",
      points: 100
    },
    {
      id: "2",
      type: "achievement",
      description: "Earned 'Community Builder' achievement",
      date: "2024-01-20",
      points: 50
    },
    {
      id: "3",
      type: "login",
      description: "Logged into the platform",
      date: "2024-01-19"
    },
    {
      id: "4",
      type: "referral",
      description: "Referred a new member: Jane Smith",
      date: "2024-01-18",
      points: 100
    }
  ]
}

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user] = useState(mockUserProfile)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Posted":
        return "bg-blue-100 text-blue-800"
      case "Eligible":
        return "bg-green-100 text-green-800"
      case "Not Eligible":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "referral":
        return <Users className="w-4 h-4 text-blue-600" />
      case "achievement":
        return <Award className="w-4 h-4 text-yellow-600" />
      case "login":
        return <Activity className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[70px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={["User Management", "Profile"]} />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">User Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-white/20 text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{user.name}</h2>
                  <Badge className={`${getStatusColor(user.rewardStatus)} border-0`}>
                    {user.rewardStatus}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <p className="text-white/90 mb-1">Student ID: {user.userId}</p>
                  <p className="text-white/80">{user.bio}</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Last active {user.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-4 mb-3">
                <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
                <p className="text-white/90 text-sm">Total Points</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-xl font-bold">{user.level}</p>
                <p className="text-white/90 text-sm">Current Level</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{user.referrals.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{user.referrals.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{user.achievements.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+24%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Content */}
        <div className="bg-white rounded-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 px-6">
              <TabsList className="bg-transparent p-0">
                <TabsTrigger 
                  value="overview" 
                  active={activeTab === "overview"}
                  className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  active={activeTab === "activity"}
                  className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  active={activeTab === "achievements"}
                  className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Achievements
                </TabsTrigger>
                <TabsTrigger 
                  value="referrals" 
                  active={activeTab === "referrals"}
                  className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Referrals
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="font-medium text-gray-900">{user.gender}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-medium text-gray-900">{user.dateOfBirth}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Campus</p>
                          <p className="font-medium text-gray-900">{user.campus}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">District</p>
                          <p className="font-medium text-gray-900">{user.district}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Current Level</p>
                          <p className="font-medium text-gray-900">{user.level}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Total Points</p>
                          <p className="font-medium text-gray-900">{user.points.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {user.activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.date}</p>
                        </div>
                        {activity.points && (
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+{activity.points}</p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="achievements">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.earnedDate}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="referrals">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Referral Details</h4>
                    <p className="text-gray-600 mb-4">
                      {user.referrals.completed} out of {user.referrals.total} referrals completed
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(user.referrals.completed / user.referrals.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Detailed referral list would be displayed here
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}