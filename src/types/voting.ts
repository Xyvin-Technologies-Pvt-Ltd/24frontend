import type { MultilingualField } from './campaign'

export interface Voting {
  _id: string
  title: MultilingualField
  description?: MultilingualField
  banner?: string
  rules?: MultilingualField
  start_date: string
  end_date: string
  is_active: boolean
  show_leaderboard: boolean
  created_by: string
  createdAt: string
  updatedAt: string
}

export interface Contestant {
  _id: string
  voting_id: string
  name: MultilingualField
  contestant_no: string
  bio?: MultilingualField
  image: string
  slug: string
  deeplink: string
  qr_url: string
  is_active: boolean
  createdAt: string
  updatedAt: string
  vote_count?: number
}

export interface CreateVotingData {
  title: MultilingualField
  description?: MultilingualField
  banner?: string
  rules?: MultilingualField
  start_date: string
  end_date: string
  is_active?: boolean
  show_leaderboard?: boolean
}

export interface UpdateVotingData extends Partial<CreateVotingData> {}

export interface CreateContestantData {
  voting_id: string
  name: MultilingualField
  contestant_no: string
  bio?: MultilingualField
  image: string
  is_active?: boolean
}

export interface UpdateContestantData extends Partial<CreateContestantData> {}

export interface VotingStats {
  total_votes: number
  total_contestants: number
  daily_votes: Array<{ date: string; count: number }>
  rankings: Contestant[]
}

export interface VotingsResponse {
  status: number
  message: string
  data: Voting[]
}

export interface VotingResponse {
  status: number
  message: string
  data: Voting
}

export interface ContestantsResponse {
  status: number
  message: string
  data: Contestant[]
}

export interface ContestantResponse {
  status: number
  message: string
  data: Contestant
}

export interface VotingStatsResponse {
  status: number
  message: string
  data: VotingStats
}

export interface VoterInfo {
  vote_id: string
  user_id: string | null
  name: string
  email: string
  phone: string
  image: string | null
  vote_date: string
  voted_at: string
}

export interface VotersListResponse {
  status: number
  message: string
  data: {
    total_count: number
    voters: VoterInfo[]
  }
}
