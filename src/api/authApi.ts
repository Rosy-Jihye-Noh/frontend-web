import axios from './axiosInstance';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  id: number;
}


export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  console.log(data);
  const response = await axios.post<LoginResponse>('/auth/login', data);
  return response.data
}