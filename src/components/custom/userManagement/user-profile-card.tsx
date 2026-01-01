import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar,
  User
} from "lucide-react"

interface UserProfileCardProps {
  user: {
    id: string
    name: string
    studentId: string
    email: string
    phone: string
    location: string
    school: string
    dateOfBirth: string
    gender: string
    bio: string
    avatar?: string
    isActive: boolean
  }
  onToggleActive?: (isActive: boolean) => void
}

export function UserProfileCard({ user, onToggleActive }: UserProfileCardProps) {
  return (
    <div className="bg-blue-50 rounded-xl p-8 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                <Badge variant="success" className="bg-green-500 text-white">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Active</span>
                <Switch 
                  checked={user.isActive}
                  onCheckedChange={(checked) => onToggleActive?.(checked)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Student ID:</span>
                <span>:</span>
                <span className="font-semibold text-gray-900">{user.studentId}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 rounded-xl p-5 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-red-600 rounded grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UserDetailsCard({ user }: { user: UserProfileCardProps['user'] }) {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
        <p className="text-gray-900">{user.bio}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{user.gender}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{user.dateOfBirth}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{user.school}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{user.location}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{user.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{user.phone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}