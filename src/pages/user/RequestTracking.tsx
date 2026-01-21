import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestApi } from '../../api';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { LiveTrackingMap } from '../../components/maps/LiveTrackingMap';
import { Car, User, Phone, Clock, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { RequestStatus } from '../../types';

const statusColors: Record<RequestStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<RequestStatus, string> = {
  PENDING: 'Waiting for Mechanic',
  ACCEPTED: 'Mechanic Assigned',
  IN_PROGRESS: 'Help is on the way',
  COMPLETED: 'Service Completed',
  CANCELLED: 'Request Cancelled',
};

const statusIcons: Record<RequestStatus, React.ReactNode> = {
  PENDING: <Clock className="h-5 w-5" />,
  ACCEPTED: <User className="h-5 w-5" />,
  IN_PROGRESS: <Car className="h-5 w-5" />,
  COMPLETED: <CheckCircle className="h-5 w-5" />,
  CANCELLED: <X className="h-5 w-5" />,
};

export function RequestTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: () => serviceRequestApi.getById(Number(id)),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => serviceRequestApi.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      queryClient.invalidateQueries({ queryKey: ['activeRequest'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">The request you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = !['COMPLETED', 'CANCELLED'].includes(request.status);
  const canCancel = ['PENDING', 'ACCEPTED'].includes(request.status);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className={`border-2 ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                {statusIcons[request.status]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {statusLabels[request.status]}
                </h2>
                <p className="text-gray-600">
                  Request #{request.id} - {request.issueType.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Badge variant={statusColors[request.status]} className="text-sm px-3 py-1">
              {request.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Live Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <LiveTrackingMap
                userLocation={{
                  lat: Number(request.latitude),
                  lng: Number(request.longitude),
                }}
                mechanicLocation={
                  request.mechanic?.currentLatitude && request.mechanic?.currentLongitude
                    ? {
                        lat: Number(request.mechanic.currentLatitude),
                        lng: Number(request.mechanic.currentLongitude),
                      }
                    : undefined
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          {/* Mechanic Info */}
          {request.mechanic && (
            <Card>
              <CardHeader>
                <CardTitle>Your Mechanic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{request.mechanic.fullName}</p>
                    {request.mechanic.rating && (
                      <p className="text-sm text-gray-600">
                        Rating: {request.mechanic.rating}/5 ({request.mechanic.totalJobs} jobs)
                      </p>
                    )}
                  </div>
                </div>

                {request.mechanic.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${request.mechanic.phone}`} className="text-blue-600 hover:underline">
                      {request.mechanic.phone}
                    </a>
                  </div>
                )}

                {request.estimatedArrival && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      ETA: {new Date(request.estimatedArrival).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Car className="h-4 w-4 mr-2" />
                <span className="font-medium">{request.issueType.replace('_', ' ')}</span>
              </div>

              {request.description && (
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">
                  {request.description}
                </p>
              )}

              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {request.address || `${Number(request.latitude).toFixed(4)}, ${Number(request.longitude).toFixed(4)}`}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Created: {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardContent className="py-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => cancelMutation.mutate()}
                  isLoading={cancelMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Request
                </Button>
              </CardContent>
            </Card>
          )}

          {!isActive && (
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
