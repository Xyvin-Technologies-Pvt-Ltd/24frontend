import { X, CheckCircle2, XCircle, Edit, Trash2, ExternalLink, FileText, Globe, Phone, Mail, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Association, AssociationStatus } from "@/types/association"

interface ViewAssociationModalProps {
  isOpen: boolean
  onClose: () => void
  association: Association | null
  onEdit?: (association: Association) => void
  onApprove?: (association: Association) => void
  onReject?: (association: Association) => void
  onDelete?: (association: Association) => void
}

export function ViewAssociationModal({
  isOpen,
  onClose,
  association,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}: ViewAssociationModalProps) {
  if (!isOpen || !association) return null

  const getStatusBadge = (status: AssociationStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pending Approval</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Rejected</Badge>
      case "suspended":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Suspended</Badge>
      case "deleted":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Deleted</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const nameEn = association.name?.en || "Untitled Association"
  const nameMl = association.name?.ml || ""
  const aboutEn = association.about?.en || ""
  const aboutMl = association.about?.ml || ""

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Banner / Header */}
        <div className="relative">
          {association.banner_image ? (
            <div className="h-36 w-full overflow-hidden bg-gray-100">
              <img
                src={association.banner_image}
                alt={nameEn}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="h-36 w-full"
              style={{
                background: `linear-gradient(135deg, ${association.gradient_start || "#34C0CB"}, ${association.gradient_end || "#1A78A3"})`,
              }}
            />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo / Monogram overlay */}
          <div className="absolute -bottom-8 left-6">
            {association.logo_image ? (
              <img
                src={association.logo_image}
                alt="Logo"
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${association.gradient_start || "#34C0CB"}, ${association.gradient_end || "#1A78A3"})`,
                }}
              >
                {association.monogram || nameEn.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Header Details */}
        <div className="pt-10 px-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{nameEn}</h2>
              {association.is_verified && (
                <span title="Verified Association">
                  <ShieldCheck className="w-5 h-5 text-blue-600 inline" />
                </span>
              )}
              {getStatusBadge(association.status)}
            </div>
            {nameMl && (
              <p className="text-sm font-medium text-emerald-800">
                {nameMl}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {association.category} • {association.location}
              {association.district_name ? `, ${association.district_name}` : ""}
              {association.ward ? ` (Ward: ${association.ward})` : ""}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-gray-700">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Members</p>
              <p className="text-lg font-bold text-gray-900">{association.member_count ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Events</p>
              <p className="text-lg font-bold text-gray-900">{association.event_count ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Est. Year</p>
              <p className="text-lg font-bold text-gray-900">
                {association.established_year || "N/A"}
              </p>
            </div>
          </div>

          {/* Registration Info */}
          {association.registration_number && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
              <div>
                <p className="text-xs text-blue-600 font-medium">Registration Number</p>
                <p className="text-sm font-semibold text-gray-900">{association.registration_number}</p>
              </div>
              {association.certificate_url && (
                <a
                  href={association.certificate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Certificate
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* About / Description Multilingual */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">About Association</h3>
            {aboutEn ? (
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <span className="text-[11px] font-semibold uppercase text-gray-500">English</span>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{aboutEn}</p>
              </div>
            ) : null}
            {aboutMl ? (
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg space-y-1">
                <span className="text-[11px] font-semibold uppercase text-emerald-700">Malayalam</span>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-normal">{aboutMl}</p>
              </div>
            ) : null}
            {!aboutEn && !aboutMl && (
              <p className="text-gray-400 italic">No description provided.</p>
            )}
          </div>

          {/* Contact Person */}
          {association.contact_person && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Contact Person</h3>
              <div className="border border-gray-200 rounded-xl p-3.5 space-y-2 bg-white">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {association.contact_person.name || "N/A"}
                  </span>
                  {association.contact_person.role && (
                    <Badge variant="outline" className="text-xs">
                      {association.contact_person.role}
                    </Badge>
                  )}
                </div>
                {association.contact_person.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{association.contact_person.phone}</span>
                  </div>
                )}
                {association.contact_person.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{association.contact_person.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {association.social_links && association.social_links.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Social Links</h3>
              <div className="flex flex-wrap gap-2">
                {association.social_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="max-w-xs truncate">{link}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rejection / Note Details if any */}
          {association.status === "rejected" && association.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-semibold text-red-700">Rejection Reason</p>
              <p className="text-sm text-red-900 mt-1">{association.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(association)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(association)}
                className="text-gray-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {association.status === "pending" && (
              <>
                {onReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(association)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                )}
                {onApprove && (
                  <Button
                    size="sm"
                    onClick={() => onApprove(association)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Approve
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
