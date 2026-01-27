import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestApi, mechanicApi } from '../../api';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { LiveTrackingMap } from '../../components/maps/LiveTrackingMap';
import { Car, User, Phone, Clock, MapPin, Play, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import type { RequestStatus } from '../../types';

const statusColors: Record<RequestStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => serviceRequestApi.getById(Number(id)),
    refetchInterval: 5000,
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: ['mechanicProfile'],
    queryFn: mechanicApi.getProfile,
  });

  // Start service mutation
  const startMutation = useMutation({
    mutationFn: () => mechanicApi.startService(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['activeRequests'] });
    },
  });

  // Complete service mutation
  const completeMutation = useMutation({
    mutationFn: () => mechanicApi.completeService(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['activeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
  });

  // Update location mutation
  const locationMutation = useMutation({
    mutationFn: mechanicApi.updateLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
  });

  const updateMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const openNavigation = () => {
    if (request) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`;
      window.open(url, '_blank');
    }
  };

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/mechanic')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = ['ACCEPTED', 'IN_PROGRESS'].includes(request.status);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className={`border-2 ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                <Car className="h-6 w-6" />
                {/* <img src="/logo.png" alt="RoadTech Logo" className="h-10 w-auto" /> */}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {request.issueType.replace('_', ' ')}
                </h2>
                <p className="text-gray-600">Job #{request.id}</p>
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
            <div className="flex items-center justify-between">
              <CardTitle>Location</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={updateMyLocation}
                  isLoading={locationMutation.isPending}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Update Location
                </Button>
                <Button size="sm" onClick={openNavigation}>
                  <Navigation className="h-4 w-4 mr-1" />
                  Navigate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <LiveTrackingMap
                userLocation={{
                  lat: Number(request.latitude),
                  lng: Number(request.longitude),
                }}
                mechanicLocation={
                  profile?.currentLatitude && profile?.currentLongitude
                    ? {
                        lat: Number(profile.currentLatitude),
                        lng: Number(profile.currentLongitude),
                      }
                    : undefined
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          {request.user && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{request.user.fullName}</p>
                    <p className="text-sm text-gray-600">{request.user.email}</p>
                  </div>
                </div>

                {request.user.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${request.user.phone}`} className="text-blue-600 hover:underline">
                      {request.user.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
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

              {request.acceptedAt && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Accepted: {new Date(request.acceptedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {isActive && (
            <Card>
              <CardContent className="py-4 space-y-3">
                {request.status === 'ACCEPTED' && (
                  <Button
                    className="w-full"
                    onClick={() => startMutation.mutate()}
                    isLoading={startMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Service
                  </Button>
                )}

                {request.status === 'IN_PROGRESS' && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => completeMutation.mutate()}
                    isLoading={completeMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Service
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {!isActive && (
            <Button className="w-full" onClick={() => navigate('/mechanic')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
