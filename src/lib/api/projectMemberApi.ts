// services/projectMemberApi.ts
import axiosInstance from "../axiosInstance";
import { 
  IProjectMember, 
  ITask,
  IProject,
  IUser,
  IBatchMemberResult
} from '../types/project';

// Project Member API functions
export const getProjectMembers = async (projectId: string): Promise<IProjectMember[]> => {
  const response = await axiosInstance.get<IProjectMember[]>(`/members/project/${projectId}/members`);
  return response.data;
};

export const addMultipleProjectMembers = async (projectId: string, emails: string[]): Promise<IBatchMemberResult> => {
  const response = await axiosInstance.post<IBatchMemberResult>(`/members/project/${projectId}/members/batch`, { emails });
  return response.data;
};

export const leaveProject = async (projectId: string): Promise<{ projectId: string; left: boolean }> => {
  const response = await axiosInstance.delete<{ projectId: string; left: boolean }>(`/members/project/${projectId}/leave`);
  return response.data;
};

export const getUserTasks = async (): Promise<ITask[]> => {
  const response = await axiosInstance.get<ITask[]>('/members/tasks');
  return response.data;
};

export const transferProjectOwnership = async (projectId: string, newOwnerId: string): Promise<IProject> => {
  const response = await axiosInstance.post<IProject>(`/members/project/${projectId}/transfer-ownership`, { newOwnerId });
  return response.data;
};

export const getUserProjectTasks = async (projectId: string, targetUserId?: string): Promise<ITask[]> => {
  const url = targetUserId 
    ? `/members/project/${projectId}/user/${targetUserId}/tasks`
    : `/members/project/${projectId}/user/tasks`;
  
  const response = await axiosInstance.get<ITask[]>(url);
  return response.data;
};

export const getNonProjectMembers = async (projectId: string, searchQuery?: string): Promise<IUser[]> => {
  const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  const response = await axiosInstance.get<IUser[]>(`/members/project/${projectId}/non-members${query}`);
  return response.data;
};


export default {
  getProjectMembers,
  addMultipleProjectMembers,
  leaveProject,
  getUserTasks,
  transferProjectOwnership,
  getUserProjectTasks,
  getNonProjectMembers
};