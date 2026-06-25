import { api } from '@/lib/api'
import type {
  CreateVotingData,
  UpdateVotingData,
  CreateContestantData,
  UpdateContestantData,
  VotingsResponse,
  VotingResponse,
  ContestantsResponse,
  ContestantResponse,
  VotingStatsResponse,
  VotersListResponse
} from '@/types/voting'

export const votingService = {
  // Get all voting sessions
  getVotingSessions: async (): Promise<VotingsResponse> => {
    const response = await api.get('/voting/admin/sessions')
    return response.data
  },

  // Get voting session by id
  getVotingSessionById: async (id: string): Promise<VotingResponse> => {
    const response = await api.get(`/voting/admin/session/${id}`)
    return response.data
  },

  // Create voting session
  createVotingSession: async (data: CreateVotingData): Promise<VotingResponse> => {
    const response = await api.post('/voting/admin/session', data)
    return response.data
  },

  // Update voting session
  updateVotingSession: async (id: string, data: UpdateVotingData): Promise<VotingResponse> => {
    const response = await api.put(`/voting/admin/session/${id}`, data)
    return response.data
  },

  // Delete voting session
  deleteVotingSession: async (id: string): Promise<any> => {
    const response = await api.delete(`/voting/admin/session/${id}`)
    return response.data
  },

  // Create contestant
  createContestant: async (data: CreateContestantData): Promise<ContestantResponse> => {
    const response = await api.post('/voting/admin/contestant', data)
    return response.data
  },

  // Update contestant
  updateContestant: async (id: string, data: UpdateContestantData): Promise<ContestantResponse> => {
    const response = await api.put(`/voting/admin/contestant/${id}`, data)
    return response.data
  },

  // Delete contestant
  deleteContestant: async (id: string): Promise<any> => {
    const response = await api.delete(`/voting/admin/contestant/${id}`)
    return response.data
  },

  // Toggle contestant status
  toggleContestantStatus: async (id: string): Promise<ContestantResponse> => {
    const response = await api.patch(`/voting/admin/contestant/${id}/toggle`)
    return response.data
  },

  // Get admin contestants
  getAdminContestants: async (votingId: string): Promise<ContestantsResponse> => {
    const response = await api.get(`/voting/admin/contestants/${votingId}`)
    return response.data
  },

  // Get voting statistics
  getVotingStatistics: async (votingId: string): Promise<VotingStatsResponse> => {
    const response = await api.get(`/voting/admin/stats/${votingId}`)
    return response.data
  },

  // Get contestant voters
  getContestantVoters: async (
    contestantId: string,
    page: number,
    limit: number,
    search: string,
    startDate?: string,
    endDate?: string
  ): Promise<VotersListResponse> => {
    const response = await api.get(`/voting/admin/contestant/${contestantId}/voters`, {
      params: { 
        page_no: page, 
        limit, 
        search,
        start_date: startDate,
        end_date: endDate
      }
    })
    return response.data
  }
}
