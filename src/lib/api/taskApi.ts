// services/taskApi.ts
import axiosInstance from "../axiosInstance";
import { 
  ITask, 
  ITaskData, 
  ITaskUpdateData,
  ITaskMessage,
  TaskStatus
} from '../types/project';

// Task API functions
export const createTask = async (taskData: ITaskData): Promise<ITask> => {
  const response = await axiosInstance.post<ITask>('/tasks', taskData);
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<ITask> => {
  const response = await axiosInstance.get<ITask>(`/tasks/${taskId}`);
  return response.data;
};

export const getProjectTasks = async (projectId: string): Promise<ITask[]> => {
  const response = await axiosInstance.get<ITask[]>(`/tasks/project/${projectId}`);
  return response.data;
};

export const updateTask = async (taskId: string, taskData: ITaskUpdateData): Promise<ITask> => {
  const response = await axiosInstance.put<ITask>(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<{ id: string; deleted: boolean }> => {
  const response = await axiosInstance.delete<{ id: string; deleted: boolean }>(`/tasks/${taskId}`);
  return response.data;
};

export const addTaskMessage = async (taskId: string, content: string): Promise<ITaskMessage> => {
  const response = await axiosInstance.post<ITaskMessage>(`/tasks/${taskId}/messages`, { content });
  return response.data;
};

export const assignTask = async (taskId: string, userIds: number[]): Promise<ITask> => {
  const response = await axiosInstance.post<ITask>(`/tasks/${taskId}/assign`, { userIds });
  return response.data;
};
export const unassignUser = async (taskId: string, userId: number): Promise<ITask> => {
  const response = await axiosInstance.delete<ITask>(`/tasks/${taskId}/unassign/${userId}`);
  return response.data;
};


export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<ITask> => {
  const response = await axiosInstance.patch<ITask>(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export default {
  createTask,
  getTaskById,
  getProjectTasks,
  updateTask,
  deleteTask,
  addTaskMessage,
  assignTask,
  unassignUser,
  updateTaskStatus
};