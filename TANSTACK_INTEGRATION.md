# TanStack Query Integration

This document outlines the TanStack Query integration for the 24Connect frontend application.

## Overview

The application now uses TanStack Query (React Query) v5 for efficient data fetching, caching, and state management for API calls.

## Key Components

### 1. Query Client Setup
- **File**: `src/lib/queryClient.ts`
- Configured with 5-minute stale time and retry policies

### 2. API Configuration
- **File**: `src/lib/api.ts`
- Axios instance with interceptors for authentication and error handling
- Base URL from environment variable `VITE_BASE_URL`

### 3. User Types
- **File**: `src/types/user.ts`
- TypeScript interfaces for User, CreateUserData, UpdateUserData, etc.

### 4. User Service
- **File**: `src/services/userService.ts`
- API service functions for all user operations (CRUD)

### 5. Custom Hooks
- **File**: `src/hooks/useUsers.ts`
- React Query hooks for user operations:
  - `useUsers()` - Fetch users with pagination/filters
  - `useUser(id)` - Fetch single user
  - `useCreateUser()` - Create user mutation
  - `useUpdateUser()` - Update user mutation
  - `useUpdateUserStatus()` - Update user status mutation
  - `useDeleteUser()` - Delete user mutation

## Updated Components

### User Management Page
- **File**: `src/pages/user/user-management.tsx`
- Now uses real API data instead of mock data
- Includes loading states and error handling
- Real-time updates after mutations

### Add Member Form
- **File**: `src/components/custom/userManagement/add-member-form.tsx`
- Integrated with `useCreateUser` mutation
- Loading states during form submission

### Edit Member Form
- **File**: `src/components/custom/userManagement/edit-member-form.tsx`
- New component for editing users
- Integrated with `useUpdateUser` mutation

## Features

### Data Fetching
- Automatic caching with 5-minute stale time
- Background refetching
- Optimistic updates
- Error handling with retry logic

### User Operations
- ✅ List users with pagination and search
- ✅ Create new users
- ✅ Update user details
- ✅ Update user status
- ✅ View user profiles
- ✅ Delete users (soft delete)

### Loading States
- Loading spinners during API calls
- Disabled buttons during mutations
- Error messages for failed operations

### Query Invalidation
- Automatic cache invalidation after mutations
- Ensures data consistency across components

## Environment Variables

```env
VITE_BASE_URL=http://localhost:3003
```

## Usage Examples

### Fetching Users
```tsx
const { data, isLoading, error } = useUsers({
  page_no: 1,
  limit: 10,
  search: 'john'
})
```

### Creating a User
```tsx
const createUser = useCreateUser()

const handleCreate = async (userData) => {
  try {
    await createUser.mutateAsync(userData)
    // Success handling
  } catch (error) {
    // Error handling
  }
}
```

### Updating User Status
```tsx
const updateStatus = useUpdateUserStatus()

const handleStatusUpdate = async (userId, status) => {
  await updateStatus.mutateAsync({
    id: userId,
    statusData: { status }
  })
}
```

## Backend API Endpoints

All endpoints require authentication and proper permissions:

- `GET /api/v1/user` - List users
- `POST /api/v1/user` - Create user
- `GET /api/v1/user/:id` - Get user by ID
- `PUT /api/v1/user/:id` - Update user
- `PUT /api/v1/user/:id/status` - Update user status
- `DELETE /api/v1/user/:id` - Delete user
- `GET /api/v1/user/download` - Download users CSV

## Next Steps

1. Add form validation to create/edit forms
2. Implement user profile image upload
3. Add more advanced filtering options
4. Implement real-time notifications for user status changes
5. Add bulk operations for multiple users