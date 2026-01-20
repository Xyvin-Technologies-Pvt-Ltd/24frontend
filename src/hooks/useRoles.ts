import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/services/roleService'
import type { 
  CreateRoleData, 
  UpdateRoleData,
  RolesQueryParams,
} from '@/types/role'

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params: RolesQueryParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
}

export const useRoles = (params: RolesQueryParams = {}) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => roleService.getRoles(params),
    staleTime: 5 * 60 * 1000, 
  })
}

export const useRole = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getRoleById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (roleData: CreateRoleData) => 
      roleService.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: UpdateRoleData }) => 
      roleService.updateRole(id, roleData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) })
    },
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}