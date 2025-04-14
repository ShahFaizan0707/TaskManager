// services/authApi.ts
import axiosInstance from "../axiosInstance";
import { 
  ILoginCredentials, 
  IRegisterData, 
  IAuthResponse, 
  IUser,
  IProfileUpdateData,
  IAddressData,
  IAddress
} from '../types/auth';

// Auth API functions
export const register = async (userData: IRegisterData): Promise<IAuthResponse> => {
  const response = await axiosInstance.post<IAuthResponse>('/users/register', userData);
  return response.data;
};

export const login = async (credentials: ILoginCredentials): Promise<IAuthResponse> => {
  const response = await axiosInstance.post<IAuthResponse>('/users/login', credentials);
  return response.data;
};

export const getUserProfile = async (): Promise<IUser> => {
  const response = await axiosInstance.get<IUser>('/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData: IProfileUpdateData): Promise<IUser> => {
  const response = await axiosInstance.put<IUser>('/users/profile', userData);
  return response.data;
};

export const updateUserAddress = async (addressData: IAddressData): Promise<IAddress> => {
  const response = await axiosInstance.post<IAddress>('/users/address', addressData);
  return response.data;
};

// Helper function to handle authentication
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Check if user is already authenticated
export const checkAuthStatus = (): boolean => {
  return !!localStorage.getItem('token');
};

export default {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  updateUserAddress,
  setAuthToken,
  checkAuthStatus
};