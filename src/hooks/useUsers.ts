import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/userService'
import type {
  CreateUserData,
  UpdateUserData,
  UpdateUserStatusData,
  UsersQueryParams
} from '@/types/user'

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UsersQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Get users with pagination and filters
export const useUsers = (params: UsersQueryParams = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get all users hook
export const useAllUsers = () => {
  return useQuery({
    queryKey: [...userKeys.lists(), 'all'],
    queryFn: () => userService.getUsersAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get single user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  })
}

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserData) => userService.createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserData }) =>
      userService.updateUser(id, userData),
    onSuccess: (_, variables) => {
      // Invalidate users list and specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

// Update user status mutation
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, statusData }: { id: string; statusData: UpdateUserStatusData }) =>
      userService.updateUserStatus(id, statusData),
    onSuccess: (_, variables) => {
      // Invalidate users list and specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
export const useDownloadUsers = () => {
  return useMutation({
    mutationFn: (params: UsersQueryParams) =>
      userService.downloadUsers(params),
  })
}
