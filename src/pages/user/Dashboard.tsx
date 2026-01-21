import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { serviceRequestApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { Car, Plus, History, MapPin, Clock, User } from 'lucide-react';
import type { ServiceRequest, RequestStatus } from '../../types';

const statusColors: Record<RequestStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function UserDashboard() {
  const { user } = useAuth();

  const { data: activeRequest, isLoading: isLoadingActive } = useQuery({
    queryKey: ['activeRequest'],
    queryFn: serviceRequestApi.getActiveRequest,
  });

  const { data: recentRequests, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentRequests'],
    queryFn: serviceRequestApi.getUserRequests,
  });

  const completedCount = recentRequests?.filter(r => r.status === 'COMPLETED').length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Need help on the road? We've got you covered.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/request-assistance">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Request Assistance
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{recentRequests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Request */}
      {!isLoadingActive && activeRequest && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">Active Request</CardTitle>
              <Badge variant={statusColors[activeRequest.status]}>
                {statusLabels[activeRequest.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-blue-800">
                <Car className="h-5 w-5 mr-2" />
                <span className="font-medium">{activeRequest.issueType.replace('_', ' ')}</span>
              </div>
              {activeRequest.address && (
                <div className="flex items-center text-blue-700">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{activeRequest.address}</span>
                </div>
              )}
              {activeRequest.mechanic && (
                <div className="flex items-center text-blue-700">
                  <User className="h-5 w-5 mr-2" />
                  <span>Mechanic: {activeRequest.mechanic.fullName}</span>
                </div>
              )}
              {activeRequest.estimatedArrival && (
                <div className="flex items-center text-blue-700">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    ETA: {new Date(activeRequest.estimatedArrival).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className="pt-3">
                <Link to={`/request/${activeRequest.id}`}>
                  <Button>Track Request</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Link to="/history" className="text-blue-600 hover:underline text-sm flex items-center">
              <History className="h-4 w-4 mr-1" />
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <p className="text-gray-500">Loading...</p>
          ) : recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.slice(0, 5).map((request: ServiceRequest) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.issueType.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No requests yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first assistance request when you need help
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
