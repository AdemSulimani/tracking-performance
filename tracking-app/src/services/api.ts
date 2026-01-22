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
    requiresVerification?: boolean;
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
    token?: string;
    user: User;
    requiresVerification?: boolean;
}

interface RegisterResponse {
    token: string;
    user: User;
}

interface VerifyCodeResponse {
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

        // Nëse përgjigja ka requiresVerification: true OSE nuk ka token, mos ruaj token
        if (response.requiresVerification === true || !response.token) {
            // Ruaj email për verifikim (përdoret në Authentication page)
            localStorage.setItem('pendingVerificationEmail', email);
            return {
                user: response.user!,
                requiresVerification: true,
            };
        }

        // Nëse ka token dhe nuk ka requiresVerification, ruaj token dhe user
        if (response.token && response.user) {
            // Store token in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return {
                token: response.token,
                user: response.user,
            };
        }

        // Fallback: nëse nuk ka token, duhet të kërkojë verifikim
        // Ruaj email për verifikim
        localStorage.setItem('pendingVerificationEmail', email);
        return {
            user: response.user!,
            requiresVerification: true,
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

    async verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
        const response = await this.request<VerifyCodeResponse>('/auth/verify-code', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        });

        // Backend returns token and user directly in response
        if (response.token && response.user) {
            // Store token in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            // Fshi pendingVerificationEmail nga localStorage
            localStorage.removeItem('pendingVerificationEmail');
        }

        return {
            token: response.token!,
            user: response.user!,
        };
    }

    async resendCode(email: string): Promise<{ success: boolean; message: string }> {
        const response = await this.request<{ success: boolean; message: string }>('/auth/resend-code', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        return {
            success: response.success,
            message: response.message || 'Verification code sent to your email'
        };
    }

    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        const response = await this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        return {
            success: response.success,
            message: response.message || 'Password reset instructions sent to your email'
        };
    }

    async resetPassword(token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
        const response = await this.request<{ success: boolean; message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password, confirmPassword }),
        });

        return {
            success: response.success,
            message: response.message || 'Password has been reset successfully'
        };
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
export type { User, LoginResponse, RegisterResponse, VerifyCodeResponse };

