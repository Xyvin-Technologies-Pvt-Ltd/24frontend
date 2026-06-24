import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { votingService } from '@/services/votingService'
import type {
  CreateVotingData,
  UpdateVotingData,
  CreateContestantData,
  UpdateContestantData
} from '@/types/voting'

export const votingKeys = {
  all: ['voting'] as const,
  sessions: () => [...votingKeys.all, 'sessions'] as const,
  session: (id: string) => [...votingKeys.all, 'session', id] as const,
  contestants: (votingId: string) => [...votingKeys.all, 'contestants', votingId] as const,
  stats: (votingId: string) => [...votingKeys.all, 'stats', votingId] as const,
  voters: (contestantId: string, page: number, search: string) => [...votingKeys.all, 'voters', contestantId, page, search] as const,
}

// Get all voting sessions
export const useVotings = () => {
  return useQuery({
    queryKey: votingKeys.sessions(),
    queryFn: () => votingService.getVotingSessions(),
    staleTime: 2 * 60 * 1000,
  })
}

// Get single voting session by ID
export const useVoting = (id: string) => {
  return useQuery({
    queryKey: votingKeys.session(id),
    queryFn: () => votingService.getVotingSessionById(id),
    enabled: !!id,
  })
}

// Create voting session
export const useCreateVoting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVotingData) => votingService.createVotingSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: votingKeys.sessions() })
    },
  })
}

// Update voting session
export const useUpdateVoting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVotingData }) =>
      votingService.updateVotingSession(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: votingKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: votingKeys.session(id) })
    },
  })
}

// Delete voting session
export const useDeleteVoting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => votingService.deleteVotingSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: votingKeys.sessions() })
    },
  })
}

// Get contestants for a voting session
export const useContestants = (votingId: string) => {
  return useQuery({
    queryKey: votingKeys.contestants(votingId),
    queryFn: () => votingService.getAdminContestants(votingId),
    enabled: !!votingId,
  })
}

// Create contestant
export const useCreateContestant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContestantData) => votingService.createContestant(data),
    onSuccess: (data) => {
      if (data?.data?.voting_id) {
        queryClient.invalidateQueries({ queryKey: votingKeys.contestants(data.data.voting_id) })
      }
    },
  })
}

// Update contestant
export const useUpdateContestant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContestantData }) =>
      votingService.updateContestant(id, data),
    onSuccess: (data) => {
      if (data?.data?.voting_id) {
        queryClient.invalidateQueries({ queryKey: votingKeys.contestants(data.data.voting_id) })
      }
    },
  })
}

// Delete contestant
export const useDeleteContestant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; votingId: string }) =>
      votingService.deleteContestant(id),
    onSuccess: (_, { votingId }) => {
      queryClient.invalidateQueries({ queryKey: votingKeys.contestants(votingId) })
    },
  })
}

// Toggle contestant active/inactive status
export const useToggleContestantStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => votingService.toggleContestantStatus(id),
    onSuccess: (data) => {
      if (data?.data?.voting_id) {
        queryClient.invalidateQueries({ queryKey: votingKeys.contestants(data.data.voting_id) })
      }
    },
  })
}

// Get voting statistics
export const useVotingStats = (votingId: string) => {
  return useQuery({
    queryKey: votingKeys.stats(votingId),
    queryFn: () => votingService.getVotingStatistics(votingId),
    enabled: !!votingId,
    refetchInterval: 10 * 1000, // Refetch stats every 10 seconds for a "live leaderboard" experience
  })
}

// Get contestant voters
export const useContestantVoters = (
  contestantId: string,
  page: number,
  limit: number,
  search: string
) => {
  return useQuery({
    queryKey: votingKeys.voters(contestantId, page, search),
    queryFn: () => votingService.getContestantVoters(contestantId, page, limit, search),
    enabled: !!contestantId,
  })
}
