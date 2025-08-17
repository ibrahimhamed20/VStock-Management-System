import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  message, 
  Space, 
  Tag, 
  Row, 
  Col,
  Statistic,
  Avatar,
  Alert,
  Skeleton,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  KeyOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  LockOutlined,
  CrownOutlined,
  StarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { AuthService } from '@auth/services/auth.service';
import type { User } from '@auth/types/auth.types';

const { Title, Text, Paragraph } = Typography;

export const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getCurrentUserProfile();
      setProfile(response);
      // Pre-fill form with current values
      profileForm.setFieldsValue({
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        email: response.email || '',
        username: response.username || '',
      });
    } catch (error) {
      message.error('Failed to fetch profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      setSaving(true);
      const updatedProfile = await AuthService.updateCurrentUserProfile(values);
      setProfile(updatedProfile);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Reset form to current values
    profileForm.setFieldsValue({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      username: profile?.username || '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'blocked': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <SafetyCertificateOutlined />;
      case 'inactive': return <ClockCircleOutlined />;
      case 'blocked': return <LockOutlined />;
      default: return <UserOutlined />;
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('admin') || role.includes('super')) return <CrownOutlined />;
    if (role.includes('manager')) return <StarOutlined />;
    if (role.includes('user')) return <UserOutlined />;
    return <TeamOutlined />;
  };

  const getRoleColor = (role: string) => {
    if (role.includes('admin') || role.includes('super')) return 'gold';
    if (role.includes('manager')) return 'purple';
    if (role.includes('user')) return 'blue';
    return 'default';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto p-8 relative z-10">
          <div className="text-center mb-8">
            <Skeleton.Input active size="large" className="w-64 h-12 mb-4" />
            <Skeleton.Input active size="default" className="w-96" />
          </div>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Col>
            <Col span={16}>
              <Skeleton active paragraph={{ rows: 12 }} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto p-8 relative z-10">
          <Alert
            message="Profile Not Found"
            description="Unable to load your profile information. Please try refreshing the page."
            type="error"
            showIcon
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/40 to-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto p-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <UserOutlined className="text-3xl text-white" />
          </div>
          <Title level={1} className="text-gray-900 mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </Title>
          <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your personal information, account settings, and view your system permissions
          </Paragraph>
        </div>

        {/* Enhanced Profile Overview Card */}
        <Card className="mb-8 shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <Row gutter={32} align="middle" className="p-6">
            <Col span={6} className="text-center">
              <Badge 
                count={profile?.status === 'active' ? '🟢' : profile?.status === 'inactive' ? '🟡' : '🔴'} 
                offset={[-10, 10]}
              >
                <Avatar 
                  size={140} 
                  icon={<UserOutlined />}
                  className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl border-4 border-white"
                />
              </Badge>
              <div className="mt-6">
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  disabled={editing}
                  size="large"
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Edit Profile
                </Button>
              </div>
            </Col>
            <Col span={18}>
              <div className="space-y-6">
                <div>
                  <Title level={2} className="mb-2 text-gray-900">
                    {profile.firstName && profile.lastName 
                      ? `${profile.firstName} ${profile.lastName}` 
                      : profile.username || 'Unknown User'
                    }
                  </Title>
                  <div className="flex items-center space-x-3">
                    <Text className="text-gray-500 text-lg font-mono">@{profile.username || 'username'}</Text>
                    <Tag 
                      color={getStatusColor(profile.status || 'unknown')} 
                      icon={getStatusIcon(profile.status || 'unknown')}
                      className="rounded-full px-4 py-1 text-sm font-medium border-0"
                    >
                      {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Unknown'}
                    </Tag>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MailOutlined className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <Text className="text-gray-500 text-sm">Email</Text>
                      <div className="font-medium">{profile.email || 'No email provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CalendarOutlined className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <Text className="text-gray-500 text-sm">Member Since</Text>
                      <div className="font-medium">
                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ClockCircleOutlined className="text-purple-600 text-lg" />
                  </div>
                  <div>
                    <Text className="text-gray-500 text-sm">Last Login</Text>
                    <div className="font-medium">
                      {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Enhanced Statistics Row */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-xl border-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <Statistic 
                title={<span className="text-blue-100">Roles Assigned</span>}
                value={profile?.roles?.length || 0} 
                prefix={<TeamOutlined className="text-blue-200 text-2xl" />}
                className="text-center relative z-10"
                valueStyle={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-xl border-0 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <Statistic 
                title={<span className="text-purple-100">Permissions</span>}
                value={profile?.permissions?.length || 0} 
                prefix={<KeyOutlined className="text-purple-200 text-2xl" />}
                className="text-center relative z-10"
                valueStyle={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-xl border-0 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <Statistic 
                title={<span className="text-emerald-100">Account Status</span>}
                value={profile?.status || 'Unknown'} 
                prefix={<SafetyCertificateOutlined className="text-emerald-200 text-2xl" />}
                className="text-center relative z-10"
                valueStyle={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Enhanced Profile Form */}
        <Card className="mb-8 shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <Title level={3} className="mb-2 text-gray-900">Personal Information</Title>
                <Text className="text-gray-500">Update your personal details and contact information</Text>
              </div>
              {editing && (
                <Space size="middle">
                  <Button 
                    icon={<CloseOutlined />}
                    onClick={handleCancelEdit}
                    size="large"
                    className="rounded-2xl border-gray-300 hover:border-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={() => profileForm.submit()}
                    loading={saving}
                    size="large"
                    className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Save Changes
                  </Button>
                </Space>
              )}
            </div>

            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleSaveProfile}
              disabled={!editing}
              className="max-w-4xl"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label={<span className="text-gray-700 font-semibold">First Name</span>}
                  >
                    <Input 
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Enter first name"
                      className="rounded-2xl border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-lg transition-all duration-200"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    label={<span className="text-gray-700 font-semibold">Last Name</span>}
                  >
                    <Input 
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Enter last name"
                      className="rounded-2xl border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-lg transition-all duration-200"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label={<span className="text-gray-700 font-semibold">Username</span>}
                    rules={[{ required: true, message: 'Username is required' }]}
                  >
                    <Input 
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Enter username"
                      className="rounded-2xl border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-lg transition-all duration-200"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label={<span className="text-gray-700 font-semibold">Email</span>}
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      size="large"
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="Enter email"
                      className="rounded-2xl border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-lg transition-all duration-200"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Card>

        {/* Enhanced Roles and Permissions */}
        <Row gutter={24} className="mb-8">
          <Col span={12}>
            <Card className="shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-sm overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <Title level={4} className="mb-6 flex items-center text-gray-900">
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mr-3">
                    <TeamOutlined className="text-blue-600 text-xl" />
                  </div>
                  Assigned Roles
                </Title>
                <div className="space-y-3">
                  {profile.roles && profile.roles.length > 0 ? (
                    profile.roles.map((role) => (
                      <Tag 
                        key={role} 
                        color={getRoleColor(role)}
                        icon={getRoleIcon(role)}
                        className="rounded-2xl px-4 py-2 text-base font-medium border-0 shadow-md"
                      >
                        {role}
                      </Tag>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TeamOutlined className="text-gray-300 text-4xl mb-3" />
                      <Text className="text-gray-500 block">No roles assigned</Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card className="shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-sm overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="p-6">
                <Title level={4} className="mb-6 flex items-center text-gray-900">
                  <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center mr-3">
                    <KeyOutlined className="text-purple-600 text-xl" />
                  </div>
                  System Permissions
                </Title>
                <div className="space-y-3">
                  {profile.permissions && profile.permissions.length > 0 ? (
                    <>
                      {profile.permissions.slice(0, 6).map((permission) => (
                        <Tag 
                          key={permission} 
                          color="purple"
                          icon={<KeyOutlined />}
                          className="rounded-2xl px-3 py-2 text-sm font-medium border-0 shadow-md"
                        >
                          {permission}
                        </Tag>
                      ))}
                      {profile.permissions.length > 6 && (
                        <Tag color="default" className="rounded-2xl px-4 py-2 text-sm shadow-md">
                          +{profile.permissions.length - 6} more permissions
                        </Tag>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <KeyOutlined className="text-gray-300 text-4xl mb-3" />
                      <Text className="text-gray-500 block">No permissions assigned</Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Account Information */}
        <Card className="shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
          <div className="p-6">
            <Title level={4} className="mb-6 flex items-center text-gray-900">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center mr-3">
                <GlobalOutlined className="text-emerald-600 text-xl" />
              </div>
              Account Information
            </Title>
            <Row gutter={32}>
              <Col span={8}>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarOutlined className="text-white text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="text-gray-600 font-medium">Account Created</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClockCircleOutlined className="text-white text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="text-gray-600 font-medium">Last Login</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrophyOutlined className="text-white text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="text-gray-600 font-medium">Last Updated</div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
};
