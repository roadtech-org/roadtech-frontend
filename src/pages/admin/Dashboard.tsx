import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { Users, Wrench, Package, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { VerificationTab } from '../../components/admin/VerificationTab';
import { UsersManagementTab } from '../../components/admin/UsersManagementTab';
import { LogsTab } from '../../components/admin/LogsTab';

type Tab = 'overview' | 'verifications' | 'users' | 'logs';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getDashboardStats,
    refetchInterval: 30000,
  });

  const { data: pendingMechanics } = useQuery({
    queryKey: ['pendingMechanics'],
    queryFn: adminApi.getPendingMechanics,
  });

  const { data: pendingProviders } = useQuery({
    queryKey: ['pendingProviders'],
    queryFn: adminApi.getPendingProviders,
  });

  const pendingCount = (pendingMechanics?.length || 0) + (pendingProviders?.length || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System management and monitoring</p>
      </div>

      {/* Tabs */}
<div className="border-b border-gray-200">
  <nav className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide">
    <button
      onClick={() => setActiveTab('overview')}
      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
        activeTab === 'overview'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      Overview
    </button>

    <button
      onClick={() => setActiveTab('verifications')}
      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
        activeTab === 'verifications'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      Verifications
      {pendingCount > 0 && (
        <Badge variant="warning" className="shrink-0">
          {pendingCount}
        </Badge>
      )}
    </button>

    <button
      onClick={() => setActiveTab('users')}
      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
        activeTab === 'users'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      Users
    </button>

    <button
      onClick={() => setActiveTab('logs')}
      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
        activeTab === 'logs'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      System Logs
    </button>
  </nav>
</div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Customers</p>
                    <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Mechanics</p>
                    <p className="text-2xl font-bold">{stats?.totalMechanics || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Parts Providers</p>
                    <p className="text-2xl font-bold">{stats?.totalProviders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending Verifications</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Active Service Requests</span>
                    <span className="font-bold">{stats?.activeRequests || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Completed Today</span>
                    <span className="font-bold">{stats?.completedToday || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Available Mechanics</span>
                    <span className="font-bold">{stats?.availableMechanics || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm text-gray-600">System Status</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Total Logs</span>
                    <span className="font-bold">{stats?.totalLogs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Error Logs (24h)</span>
                    <span className="font-bold text-red-600">{stats?.errorLogs || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Verifications Tab */}
      {activeTab === 'verifications' && <VerificationTab />}

      {/* Users Tab */}
      {activeTab === 'users' && <UsersManagementTab />}

      {/* Logs Tab */}
      {activeTab === 'logs' && <LogsTab />}
    </div>
  );
}