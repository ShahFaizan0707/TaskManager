// types/auth.ts

// User related interfaces
export interface IUser {
    id: string;
    email: string;
    name: string | null;
    address?: IAddress;
    orders?: IOrder[];
  }
  
  export interface IAddress {
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    locality: string;
    userId: string;
  }
  
  export interface IOrder {
    id: string;
    createdAt: Date;
    status: string;
    total: number;
    items: IOrderItem[];
  }
  
  export interface IOrderItem {
    id: string;
    quantity: number;
    price: number;
    product: IProduct;
  }
  
  export interface IProduct {
    id: string;
    name: string;
    price: number;
    description: string;
    images?: string[];
    rating: number;
    category?: string;
    featured?: boolean;
    discount?: number; 
  }

  // Auth related interfaces
  export interface ILoginCredentials {
    email: string;
    password: string;
  }
  
  export interface IRegisterData {
    email: string;
    password: string;
    name?: string;
    address?: Omit<IAddress, 'id' | 'userId'>;
  }
  
  export interface IAuthResponse {
    user: IUser;
    token: string;
  }
  
  export interface IProfileUpdateData {
    name?: string;
    email?: string;
    password?: string;
  }
  
  export interface IAddressData {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    locality: string;
  }
  
  // Auth context interfaces
  export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface IAuthContextType extends IAuthState {
    login: (credentials: ILoginCredentials) => Promise<void>;
    register: (data: IRegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (data: IProfileUpdateData) => Promise<void>;
    updateAddress: (data: IAddressData) => Promise<void>;
    clearError: () => void;
  }