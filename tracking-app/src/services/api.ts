const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    console.error('VITE_API_URL is not defined in environment variables');
    throw new Error('VITE_API_URL is required. Please set it in your .env file');
}

// API Response types
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    token?: string;
    user?: User;
    errors?: string[];
}

interface User {
    id: string;
    companyType: string;
    name: string;
    lastname: string;
    email: string;
    createdAt?: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

interface RegisterResponse {
    token: string;
    user: User;
}

// API Client
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        
        // Get token from localStorage if available
        const token = localStorage.getItem('token');
        
        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Backend returns error messages in data.message
                const errorMessage = data.message || data.errors?.join(', ') || 'An error occurred';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    // Auth endpoints
    async register(data: {
        companyType: string;
        name: string;
        lastname: string;
        email: string;
        password: string;
        confirmPassword: string;
    }): Promise<RegisterResponse> {
        const response = await this.request<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        // Backend returns token and user directly in response
        if (response.token && response.user) {
            // Store token in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return {
            token: response.token!,
            user: response.user!,
        };
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await this.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        // Backend returns token and user directly in response
        if (response.token && response.user) {
            // Store token in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return {
            token: response.token!,
            user: response.user!,
        };
    }

    async checkEmail(email: string): Promise<{ available: boolean }> {
        const encodedEmail = encodeURIComponent(email);
        const response = await this.request<{ available: boolean }>(
            `/auth/check-email/${encodedEmail}`,
            {
                method: 'GET',
            }
        );
        // Backend returns available directly in response
        return { available: (response as any).available ?? false };
    }

    async checkUsername(username: string): Promise<{ available: boolean }> {
        const encodedUsername = encodeURIComponent(username);
        const response = await this.request<{ available: boolean }>(
            `/auth/check-username/${encodedUsername}`,
            {
                method: 'GET',
            }
        );
        // Backend returns available directly in response
        return { available: (response as any).available ?? false };
    }

    // Logout
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Get current user from localStorage
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    // Get token from localStorage
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { User, LoginResponse, RegisterResponse };

