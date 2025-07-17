import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰이 있으면 Authorization 헤더에 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
        // localStorage에서 토큰을 가져옴
        const token = localStorage.getItem('jwt_token');

        // 토큰이 존재하면 Authorization 헤더를 추가
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

// 응답 인터셉터 추가 (토큰 만료 등의 에러 처리)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 401 Unauthorized 에러 시 로그아웃 처리
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;