// services/projectApi.ts
import axiosInstance from "../axiosInstance";
import { 
  IProject, 
  IProjectData, 
  IProjectUpdateData, 
  IProjectMember,
  IProjectMessage
} from '../types/project';

// Project API functions
export const createProject = async (projectData: IProjectData): Promise<IProject> => {
  const response = await axiosInstance.post<IProject>('/projects', projectData);
  return response.data;
};

export const getProjectById = async (projectId: string): Promise<IProject> => {
  const response = await axiosInstance.get<IProject>(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId: string, projectData: IProjectUpdateData): Promise<IProject> => {
  const response = await axiosInstance.put<IProject>(`/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId: string): Promise<{ id: string; deleted: boolean }> => {
  const response = await axiosInstance.delete<{ id: string; deleted: boolean }>(`/projects/${projectId}`);
  return response.data;
};

export const addProjectMember = async (projectId: string, email: string): Promise<IProjectMember> => {
  const response = await axiosInstance.post<IProjectMember>(`/projects/${projectId}/members`, { email });
  return response.data;
};

export const removeProjectMember = async (projectId: string, memberId: string): Promise<{ projectId: string; memberId: string; removed: boolean }> => {
  const response = await axiosInstance.delete<{ projectId: string; memberId: string; removed: boolean }>(`/projects/${projectId}/members/${memberId}`);
  return response.data;
};

export const addProjectMessage = async (projectId: string, content: string): Promise<IProjectMessage> => {
  const response = await axiosInstance.post<IProjectMessage>(`/projects/${projectId}/messages`, { content });
  return response.data;
};

export default {
  createProject,
  getProjectById,
  // getUserProjects,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  addProjectMessage
};