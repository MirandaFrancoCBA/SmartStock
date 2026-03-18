export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    access: string; 
    refresh: string; 
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    groups: string[]; 
  }