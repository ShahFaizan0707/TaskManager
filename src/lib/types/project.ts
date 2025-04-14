// types/project.ts

// Project interfaces
export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: IUser;
  members: IProjectMember[];
  messages?: IProjectMessage[];
  tasks?: ITask[];
  _count?: {
    tasks: number;
  };
}

export interface IProjectData {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface IProjectUpdateData {
  name?: string;
  description?: string;
}

// Project Member interfaces
export interface IProjectMember {
  id: number;
  projectId: string;
  userId: string;
  createdAt: string;
  user: IUser;
}

export interface IBatchMemberResult {
  added: IProjectMember[];
  notFound: string[];
  alreadyMembers: string[];
}

// Project Message interfaces
export interface IProjectMessage {
  id: number;
  content: string;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
}

// Task interfaces
export interface ITask {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    creatorId: number;
    id: number;
    name: string;
    members: IProjectMember[];
  };
  assignments: ITaskAssignment[];
  messages?: ITaskMessage[];
}

export interface ITaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  projectId: string;
  assigneeIds?: string[];
}

export interface ITaskUpdateData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignedUserIds?: string[];
}

export interface ITaskAssignment {
  id: number;
  taskId: number;
  userId: number;
  createdAt: string;
  user: IUser;
}

export interface ITaskMessage {
  id: number;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
}

// User interface (shared with auth types)
export interface IUser {
  id: number;
  name: string;
  email: string;
}

// WebSocket message interfaces

export interface IUserPresence {
  userId: number;
  projectId: string;
  timestamp: string;
}

export interface IUserTyping {
  userId: number;
  context: 'project' | 'task';
  contextId: string;
  timestamp: string;
}

// Enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface IWebSocketMessage {
  type: string;
  data: any;
}

export interface IConnectionData {
  userId: number;
  projectId: string | null;
  timestamp: string;
}

export interface IUserPresence {
  userId: number;
  projectId: string;
  timestamp: string;
}

export interface IUserTyping {
  userId: number;
  context: 'project' | 'task';
  contextId: string;
  timestamp: string;
}

// WebSocket message types
export enum WebSocketMessageType {
  // Connection messages
  CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
  PING = 'PING',
  PONG = 'PONG',
  
  // Project presence
  JOIN_PROJECT = 'JOIN_PROJECT',
  LEAVE_PROJECT = 'LEAVE_PROJECT',
  USER_JOINED_PROJECT = 'USER_JOINED_PROJECT',
  USER_LEFT_PROJECT = 'USER_LEFT_PROJECT',
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE',
  
  // User activity
  USER_TYPING = 'USER_TYPING',
  
  // Task events
  TASK_STATUS_CHANGE = 'TASK_STATUS_CHANGE',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_DELETED = 'TASK_DELETED',

  NEW_TASK_MESSAGE = 'NEW_TASK_MESSAGE'
}