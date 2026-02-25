// hooks/useAuth.ts
import { useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  authService, 
  RegisterData, 
  LoginData, 
  VerifyEmailData, 
  ResendVerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  User 
} from '@/services/authService';

const AUTH_QUERY_KEY = 'auth';

export const useAuth = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authContext = useContext(AuthContext);
  const setUserFromContext = authContext?.setUser;

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      toast({
        title: 'Verification code sent!',
        description: 'Please check your email for the verification code.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Login mutation – turant context update taake bina refresh redirect ho
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      queryClient.setQueryData([AUTH_QUERY_KEY, 'user'], data.data.user);
      setUserFromContext?.(data.data.user);
      window.dispatchEvent(new Event('auth-login'));
      toast({
        title: 'Signed in successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  // Verify email mutation – turant context update
  const verifyEmailMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      queryClient.setQueryData([AUTH_QUERY_KEY, 'user'], data.data.user);
      setUserFromContext?.(data.data.user);
      window.dispatchEvent(new Event('auth-login'));
      toast({
        title: 'Email verified successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Verification failed',
        description: error.response?.data?.message || 'Invalid verification code',
        variant: 'destructive',
      });
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: (data) => {
      toast({
        title: 'Code resent!',
        description: 'New verification code sent to your email.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to resend code',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (data) => {
      toast({
        title: 'Reset code sent!',
        description: 'Please check your email for the password reset code.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send reset code',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      queryClient.setQueryData([AUTH_QUERY_KEY, 'user'], data.data.user);
      
      toast({
        title: 'Password reset successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Password reset failed',
        description: error.response?.data?.message || 'Invalid reset code',
        variant: 'destructive',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      queryClient.setQueryData([AUTH_QUERY_KEY, 'user'], data.data.user);
      
      toast({
        title: 'Password changed successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Password change failed',
        description: error.response?.data?.message || 'Current password is incorrect',
        variant: 'destructive',
      });
    },
  });

  // Token hai to hi user fetch karo; bina token (logout ke baad) loading kabhi na dikhao
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');
  const userQuery = useQuery({
    queryKey: [AUTH_QUERY_KEY, 'user'],
    queryFn: authService.getMe,
    enabled: hasToken,
    select: (data) => data.data?.user,
    onError: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      queryClient.removeQueries({ queryKey: [AUTH_QUERY_KEY] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-logout'));
      }
      toast({
        title: 'Logged out successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Logout failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  return {
    // Mutations
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    resendVerification: resendVerificationMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    // Queries – user pehle context se (login ke baad bina refresh), phir query se
    user: authContext?.user ?? userQuery.data,
    userQuery,
    // Logout ke baad token nahi hota – tab loading mat dikhao, taake sign-in form turant dikhe
    isLoadingUser: hasToken ? userQuery.isLoading : false,

    // Loading states
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,
    isSendingResetCode: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Errors
    registerError: registerMutation.error,
    loginError: loginMutation.error,
    verifyEmailError: verifyEmailMutation.error,
  };
};