import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Alert } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  IdcardOutlined 
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../services/auth.service';
import type { RegisterFormData } from '../types/auth.types';

const { Title, Text } = Typography;

// Enhanced validation schema
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError: setFormError,
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.register(data);
      
      // Show success message
      message.success(response.message || 'Registration successful!');
      
      // Reset form
      reset();
      
      // Show success state
      setIsSuccess(true);
      
      // Call success callback after delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 409) {
        if (error.response.data.message?.includes('username')) {
          setFormError('username', {
            type: 'manual',
            message: 'Username already exists',
          });
        } else if (error.response.data.message?.includes('email')) {
          setFormError('email', {
            type: 'manual',
            message: 'Email already exists',
          });
        } else {
          setFormError('root', {
            type: 'manual',
            message: error.response.data.message || 'Registration failed',
          });
        }
      } else if (error.response?.data?.message) {
        setFormError('root', {
          type: 'manual',
          message: error.response.data.message,
        });
      } else {
        setFormError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Title level={2} className="text-green-600 mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Registration Successful!
            </Title>
            <Text className="text-gray-600 mb-6 text-lg">
              Your account has been created successfully. You can now log in.
            </Text>
            {onSwitchToLogin && (
              <Button 
                type="primary" 
                onClick={onSwitchToLogin} 
                size="large"
                className="h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
              >
                Go to Login
              </Button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </Title>
          <Text className="text-gray-600 text-lg">
            Join us and start managing your store
          </Text>
        </div>

        {/* Registration Card */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Username</span>}
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
                    placeholder="Choose a username"
                    autoComplete="username"
                    autoFocus
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Email</span>}
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
              className="mb-0"
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Enter your email"
                    autoComplete="email"
                    type="email"
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* First Name */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">First Name (Optional)</span>}
              validateStatus={errors.firstName ? 'error' : ''}
              help={errors.firstName?.message}
              className="mb-0"
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    placeholder="Enter your first name"
                    autoComplete="given-name"
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* Last Name */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Last Name (Optional)</span>}
              validateStatus={errors.lastName ? 'error' : ''}
              help={errors.lastName?.message}
              className="mb-0"
            >
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    placeholder="Enter your last name"
                    autoComplete="family-name"
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* Password */}
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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                  />
                )}
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Confirm Password</span>}
              validateStatus={errors.confirmPassword ? 'error' : ''}
              help={errors.confirmPassword?.message}
              className="mb-0"
            >
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
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
                {isLoading ? t('common.loading') : t('auth.register')}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6 border-gray-200" />

          {/* Footer Links */}
          <div className="text-center">
            {onSwitchToLogin && (
              <div className="text-gray-600">
                Already have an account?{' '}
                <Button 
                  type="link" 
                  onClick={onSwitchToLogin} 
                  className="p-0 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  {t('auth.login')}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Footer Text */}
        <div className="text-center text-gray-500 text-sm">
          <p>Secure registration with advanced validation</p>
        </div>
      </div>
    </div>
  );
};
