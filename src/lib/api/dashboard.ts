// Project member interface
import axiosInstance from "../axiosInstance";
interface IProjectMember {
  id: number;
  createdAt: string;
  updatedAt: string;
  projectId: number;
  userId: number;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

// User task metrics interface
interface IUserTaskMetrics {
  total: number;
  todo: number;
  inProgress: number;
  underReview: number;
  completed: number;
  overdue: number;
  priorities: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

// Project task metrics interface
interface IProjectTaskMetrics {
  total: number;
  todo: number;
  inProgress: number;
  underReview: number;
  completed: number;
  unassigned: number;
  overdue: number;
}

// Task interface for upcoming deadlines
interface ITask {
  id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

// Enhanced project interface
interface IProject {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  creatorId: number;
  creator: {
    id: number;
    name: string | null;
    email: string;
  };
  members: IProjectMember[];
  _count: {
    tasks: number;
  };
  userTaskMetrics: IUserTaskMetrics;
  projectTaskMetrics: IProjectTaskMetrics;
  completionPercentage: number;
  upcomingDeadlines: ITask[];
}

// Dashboard summary interface
interface IDashboardSummary {
  totalProjects: number;
  totalTasks: number;
  userAssignedTasks: {
    total: number;
    completed: number;
    overdue: number;
  };
  projectsCreatedByUser: number;
}

// Updated response interface
export interface IProjectsResponse {
  projects: IProject[];
  dashboardSummary: IDashboardSummary;
}

// Updated function signature
export const getUserProjects = async (): Promise<IProjectsResponse> => {
  const response = await axiosInstance.get<IProjectsResponse>('/projects');
  return response.data;
};



interface IPriorityTask {
  task: string;
  project: string;
  howToHandle: string;
  priority: string;
}

// Task recommendation response interface
export interface ITaskRecommendationResponse {
  success: boolean;
  recommendation: {
    priorityTasks: IPriorityTask[];
    additionalAdvice: string;
  };
  userData: {
    name: string;
    projectCount: number;
    taskCount: number;
  };
  error?: string;
}

// API function to get task focus recommendations
export const getTaskFocusRecommendations = async (): Promise<ITaskRecommendationResponse> => {
  const response = await axiosInstance.post<ITaskRecommendationResponse>('/gemini');
  return response.data;
};
export default {
  getTaskFocusRecommendations,
  getUserProjects,
};