import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthService } from '../services/auth.service';
import type { PasswordResetFormData, PasswordResetConfirmFormData } from '../types/auth.types';

const { Title, Text } = Typography;

// Validation schemas
const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
});

const passwordResetConfirmSchema = z.object({
  token: z.string()
    .min(1, 'Token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<'request' | 'confirm'>('request');

  const requestForm = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const confirmForm = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const handleRequestReset = async (data: PasswordResetFormData) => {
    try {
      setIsLoading(true);
      
      await AuthService.requestPasswordReset(data);
      
      setIsRequestSent(true);
      message.success('Password reset email sent successfully!');
      
      // Move to confirmation step
      setTimeout(() => {
        setCurrentStep('confirm');
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset request error:', error);
      
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (data: PasswordResetConfirmFormData) => {
    try {
      setIsLoading(true);
      
      await AuthService.resetPassword(data);
      
      setIsResetComplete(true);
      message.success('Password reset successfully!');
      
      // Redirect to login after delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      
      if (error.response?.status === 400) {
        confirmForm.setError('token', {
          type: 'manual',
          message: 'Invalid or expired token',
        });
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success states
  if (isRequestSent && currentStep === 'request') {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <Title level={2} className="text-blue-600 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Check Your Email
            </Title>
            <Text className="text-gray-600 mb-6 text-lg">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </Text>
            <div className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isResetComplete) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-100/20 to-emerald-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Title level={2} className="text-green-600 mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Password Reset Complete!
            </Title>
            <Text className="text-gray-600 mb-6 text-lg">
              Your password has been reset successfully. You can now log in with your new password.
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
    <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentStep === 'request' ? 'Reset Password' : 'Enter New Password'}
          </Title>
          <Text className="text-gray-600 text-lg">
            {currentStep === 'request' 
              ? 'Enter your email to receive a reset link' 
              : 'Enter your new password'
            }
          </Text>
        </div>

        {/* Password Reset Card */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          {currentStep === 'request' ? (
            // Request Password Reset Form
            <Form layout="vertical" onFinish={requestForm.handleSubmit(handleRequestReset)} className="space-y-6">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Email Address</span>}
                validateStatus={requestForm.formState.errors.email ? 'error' : ''}
                help={requestForm.formState.errors.email?.message}
                className="mb-0"
              >
                <Input
                  {...requestForm.register('email')}
                  size="large"
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  type="email"
                  autoFocus
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={!requestForm.formState.isValid}
                  className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
                >
                  {isLoading ? t('common.loading') : 'Send Reset Link'}
                </Button>
              </Form.Item>
            </Form>
          ) : (
            // Confirm Password Reset Form
            <Form layout="vertical" onFinish={confirmForm.handleSubmit(handleConfirmReset)} className="space-y-6">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Reset Token</span>}
                validateStatus={confirmForm.formState.errors.token ? 'error' : ''}
                help={confirmForm.formState.errors.token?.message}
                className="mb-0"
              >
                <Input
                  {...confirmForm.register('token')}
                  size="large"
                  placeholder="Enter the token from your email"
                  autoFocus
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">New Password</span>}
                validateStatus={confirmForm.formState.errors.newPassword ? 'error' : ''}
                help={confirmForm.formState.errors.newPassword?.message}
                className="mb-0"
              >
                <Input.Password
                  {...confirmForm.register('newPassword')}
                  size="large"
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Confirm New Password</span>}
                validateStatus={confirmForm.formState.errors.confirmPassword ? 'error' : ''}
                help={confirmForm.formState.errors.confirmPassword?.message}
                className="mb-0"
              >
                <Input.Password
                  {...confirmForm.register('confirmPassword')}
                  size="large"
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={!confirmForm.formState.isValid}
                  className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
                >
                  {isLoading ? t('common.loading') : 'Reset Password'}
                </Button>
              </Form.Item>
            </Form>
          )}

          <Divider className="my-6 border-gray-200" />

          {/* Footer Links */}
          <div className="text-center space-y-3">
            {onSwitchToLogin && (
              <Button 
                type="link" 
                onClick={onSwitchToLogin} 
                className="p-0 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Back to Login
              </Button>
            )}
            
            {currentStep === 'confirm' && (
              <Button 
                type="link" 
                onClick={() => setCurrentStep('request')} 
                className="p-0 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Request New Reset Link
              </Button>
            )}
          </div>
        </Card>

        {/* Footer Text */}
        <div className="text-center text-gray-500 text-sm">
          <p>Secure password reset with email verification</p>
        </div>
      </div>
    </div>
  );
};
