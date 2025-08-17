import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth.store';
import { AuthService } from '../services/auth.service';
import type { LoginFormData } from '../types/auth.types';

const { Title, Text } = Typography;

// Enhanced validation schema
const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9@._-]+$/, 'Username can only contain letters, numbers, @, ., _, and -'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToPasswordReset?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToPasswordReset,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { setAuth, setError, error } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError: setFormError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.login(data);
      
      // Store auth data
      setAuth(response);
      
      // Reset form
      reset();
      
      // Show success message
      message.success(t('auth.loginSuccess'));
      
      // Call success callback
      onSuccess?.();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Increment login attempts
      setLoginAttempts(prev => prev + 1);
      
      if (error.response?.status === 401) {
        setFormError('root', {
          type: 'manual',
          message: t('auth.invalidCredentials'),
        });
      } else if (error.response?.status === 403) {
        setFormError('root', {
          type: 'manual',
          message: 'Your account is blocked. Please contact an administrator.',
        });
      } else if (error.response?.status === 423) {
        setFormError('root', {
          type: 'manual',
          message: 'Your account is not active. Please contact an administrator.',
        });
      } else if (error.response?.data?.message) {
        setFormError('root', {
          type: 'manual',
          message: error.response.data.message,
        });
      } else {
        setFormError('root', {
          type: 'manual',
          message: 'Login failed. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show warning after multiple failed attempts
  const showSecurityWarning = loginAttempts >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </Title>
          <Text className="text-gray-600 text-lg">
            Sign in to your account to continue
          </Text>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          {/* Security Warning */}
          {showSecurityWarning && (
            <Alert
              message="Security Notice"
              description="Multiple failed login attempts detected. Please verify your credentials."
              type="warning"
              showIcon
              className="mb-6 rounded-xl border-orange-200 bg-orange-50"
            />
          )}

          {/* Global Error */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              className="mb-6 rounded-xl border-red-200 bg-red-50"
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Username or Email</span>}
              validateStatus={errors.username ? 'error' : ''}
              help={errors.username?.message}
              className="mb-0"
            >
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    autoFocus
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Password</span>}
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
              className="mb-0"
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* Form-level errors */}
            {errors.root && (
              <Form.Item className="mb-0">
                <Alert
                  message={errors.root.message}
                  type="error"
                  showIcon
                  className="rounded-xl border-red-200 bg-red-50"
                />
              </Form.Item>
            )}

            {/* Submit Button */}
            <Form.Item className="mb-0 pt-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                disabled={!isValid}
                className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
              >
                {isLoading ? t('common.loading') : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6 border-gray-200" />

          {/* Footer Links */}
          <div className="text-center space-y-3">
            {onSwitchToPasswordReset && (
              <Button 
                type="link" 
                onClick={onSwitchToPasswordReset} 
                className="p-0 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                {t('auth.forgotPassword')}
              </Button>
            )}
            
            {onSwitchToRegister && (
              <div className="text-gray-600">
                Don't have an account?{' '}
                <Button 
                  type="link" 
                  onClick={onSwitchToRegister} 
                  className="p-0 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  {t('auth.register')}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Footer Text */}
        <div className="text-center text-gray-500 text-sm">
          <p>Secure login powered by advanced authentication</p>
        </div>
      </div>
    </div>
  );
};
