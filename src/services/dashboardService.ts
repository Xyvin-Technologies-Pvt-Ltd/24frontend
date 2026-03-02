import { api } from '@/lib/api';

// Define types for dashboard data
export interface DashboardStats {
  total_users: {
    value: number;
    growth: number;
    trend: "up" | "down" | "neutral";
  };
  active_events: {
    value: number;
    growth: number;
    trend: "up" | "down" | "neutral";
  };
  active_campaigns: {
    value: number;
    growth: number;
    trend: "up" | "down" | "neutral";
  };
  otp_wallet_balance: number;
  total_donations: {
    value: string;
    raw_amount: number;
    growth: number;
    trend: "up" | "down" | "neutral";
  };
}

export interface DashboardAnalytics {
  stats: DashboardStats;
}

export interface MonthlyTrend {
  month: string;
  totalUsers: number;
  totalEvents: number;
  totalDonations: number;
  donationCount: number;
}

export interface DashboardServiceResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const dashboardService = {
  // Get dashboard analytics
  getAnalytics: async (): Promise<DashboardServiceResponse<DashboardAnalytics>> => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },

  // Get monthly trends for charts
  getMonthlyTrends: async (): Promise<DashboardServiceResponse<MonthlyTrend[]>> => {
    const response = await api.get('/dashboard/trends');
    return response.data;
  },

  // Get analytics with date range
  getAnalyticsByDateRange: async (
    startDate: string, 
    endDate: string
  ): Promise<DashboardServiceResponse<DashboardAnalytics>> => {
    const response = await api.get('/dashboard/analytics', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  },

  // Get trends with date range
  getTrendsByDateRange: async (
    startDate: string, 
    endDate: string
  ): Promise<DashboardServiceResponse<MonthlyTrend[]>> => {
    const response = await api.get('/dashboard/trends', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  }
};
