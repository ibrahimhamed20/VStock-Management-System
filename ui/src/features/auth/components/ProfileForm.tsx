import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col, Tag } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  IdcardOutlined,
  LockOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore, useAuthUser } from '../stores/auth.store';
import { AuthService } from '../services/auth.service';
import type { ProfileFormData, PasswordChangeFormData } from '../types/auth.types';

const { Title, Text } = Typography;

// Validation schemas
const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ProfileForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const { updateProfile } = useAuthStore();
  const user = useAuthUser();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver<ProfileFormData, any, ProfileFormData>(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver<PasswordChangeFormData, any, PasswordChangeFormData>(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.updateProfile(data);
      
      // Update local state
      updateProfile(response.data);
      
      message.success('Profile updated successfully!');
      
      // Reset password form
      passwordForm.reset();
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      if (error.response?.status === 409) {
        message.error('Email already exists. Please choose a different email.');
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    try {
      setIsPasswordLoading(true);
      
      await AuthService.changePassword(data);
      
      message.success('Password changed successfully!');
      
      // Reset password form
      passwordForm.reset();
      
    } catch (error: any) {
      console.error('Password change error:', error);
      
      if (error.response?.status === 400) {
        passwordForm.setError('currentPassword', {
          type: 'manual',
          message: 'Current password is incorrect',
        });
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to change password. Please try again.');
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 sm:px-6 lg:px-8 relative overflow-hidden">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Title level={2} className="text-blue-600 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Profile...
            </Title>
            <Text className="text-gray-600 text-lg">
              Please wait while we load your profile information.
            </Text>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage your account information and security
          </Text>
        </div>

        {/* User Info Header */}
        <Card className="mb-8 shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Row gutter={24} align="middle">
            <Col>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserOutlined className="text-2xl text-white" />
              </div>
            </Col>
            <Col flex="1">
              <Title level={3} className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username
                }
              </Title>
              <Text className="text-gray-600 text-lg font-medium">
                @{user.username}
              </Text>
              <div className="mt-3">
                {user.roles.map((role) => (
                  <Tag key={`${user.id}-${role}`} color="blue" className="mr-2 rounded-lg px-3 py-1">
                    {role}
                  </Tag>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-500 flex items-center">
                <CalendarOutlined className="mr-2" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </Col>
            <Col>
              <Tag 
                color={user.status === 'active' ? 'green' : user.status === 'blocked' ? 'red' : 'orange'}
                icon={<SafetyCertificateOutlined />}
                className="rounded-lg px-4 py-2 text-sm font-medium"
              >
                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || ''}
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border-0">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'password'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <Card 
            title={
              <div className="flex items-center">
                <IdcardOutlined className="text-blue-500 mr-2" />
                <span className="text-lg font-semibold">Profile Information</span>
              </div>
            }
            className="mb-8 shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm"
          >
            <Form layout="vertical" onFinish={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">First Name</span>}
                    validateStatus={profileForm.formState.errors.firstName ? 'error' : ''}
                    help={profileForm.formState.errors.firstName?.message}
                    className="mb-0"
                  >
                    <Controller
                      name="firstName"
                      control={profileForm.control}
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
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Last Name</span>}
                    validateStatus={profileForm.formState.errors.lastName ? 'error' : ''}
                    help={profileForm.formState.errors.lastName?.message}
                    className="mb-0"
                  >
                    <Controller
                      name="lastName"
                      control={profileForm.control}
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
                </Col>
              </Row>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Email Address</span>}
                validateStatus={profileForm.formState.errors.email ? 'error' : ''}
                help={profileForm.formState.errors.email?.message}
                className="mb-0"
              >
                <Controller
                  name="email"
                  control={profileForm.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      type="email"
                      className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading}
                  disabled={!profileForm.formState.isValid}
                  className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base px-8"
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <Card 
            title={
              <div className="flex items-center">
                <LockOutlined className="text-blue-500 mr-2" />
                <span className="text-lg font-semibold">Change Password</span>
              </div>
            }
            className="mb-8 shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm"
          >
            <Form layout="vertical" onFinish={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Current Password</span>}
                validateStatus={passwordForm.formState.errors.currentPassword ? 'error' : ''}
                help={passwordForm.formState.errors.currentPassword?.message}
                className="mb-0"
              >
                <Controller
                  name="currentPassword"
                  control={passwordForm.control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      size="large"
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                    />
                  )}
                />
              </Form.Item>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">New Password</span>}
                    validateStatus={passwordForm.formState.errors.newPassword ? 'error' : ''}
                    help={passwordForm.formState.errors.newPassword?.message}
                    className="mb-0"
                  >
                    <Controller
                      name="newPassword"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <Input.Password
                          {...field}
                          size="large"
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Enter your new password"
                          autoComplete="new-password"
                          className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Confirm New Password</span>}
                    validateStatus={passwordForm.formState.errors.confirmPassword ? 'error' : ''}
                    help={passwordForm.formState.errors.confirmPassword?.message}
                    className="mb-0"
                  >
                    <Controller
                      name="confirmPassword"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <Input.Password
                          {...field}
                          size="large"
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Confirm your new password"
                          autoComplete="new-password"
                          className="h-12 rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="mb-0 pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isPasswordLoading}
                  disabled={!passwordForm.formState.isValid}
                  className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base px-8"
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Account Security Info */}
        <Card 
          title={
            <div className="flex items-center">
              <SafetyCertificateOutlined className="text-blue-500 mr-2" />
              <span className="text-lg font-semibold">Account Security</span>
            </div>
          }
          className="mb-8 shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm"
        >
          <Row gutter={24}>
            <Col span={8}>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {user.status === 'active' ? '✓' : '⚠'}
                </div>
                <Text strong className="text-gray-800">Account Status</Text>
                <div className="text-sm text-gray-600 mt-1">
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || ''}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {user.roles.length}
                </div>
                <Text strong className="text-gray-800">Roles</Text>
                <div className="text-sm text-gray-600 mt-1">
                  {user.roles.join(', ')}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {user.permissions.length}
                </div>
                <Text strong className="text-gray-800">Permissions</Text>
                <div className="text-sm text-gray-600 mt-1">
                  {user.permissions.slice(0, 3).join(', ')}
                  {user.permissions.length > 3 && '...'}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};
