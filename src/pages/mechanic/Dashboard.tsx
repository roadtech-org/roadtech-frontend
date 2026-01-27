import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanicApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/common';
import { RequestCard } from '../../components/mechanic/RequestCard';
import { Power, MapPin, Clock, CheckCircle, AlertCircle, Briefcase, Navigation, Loader2, Package } from 'lucide-react';
import type { ServiceRequest } from '../../types';

export function MechanicDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Get mechanic profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['mechanicProfile'],
    queryFn: mechanicApi.getProfile,
  });

  // Get pending requests (available to accept)
  const { data: pendingRequests, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: mechanicApi.getPendingRequests,
    refetchInterval: 10000, // Poll every 10 seconds
    enabled: profile?.isAvailable ?? false,
  });

  // Get active/assigned requests
  const { data: activeRequests, isLoading: isLoadingActive } = useQuery({
    queryKey: ['activeRequests'],
    queryFn: mechanicApi.getActiveRequests,
    refetchInterval: 5000,
  });

  // Toggle availability
  const toggleMutation = useMutation({
    mutationFn: (isAvailable: boolean) => mechanicApi.toggleAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
  });

  // Update location
  const locationMutation = useMutation({
    mutationFn: mechanicApi.updateLocation,
    onSuccess: () => {
      setLocationError(null);
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
    onError: (error: Error) => {
      setLocationError(error.message);
    },
  });

  const handleToggleAvailability = () => {
    const newStatus = !profile?.isAvailable;

    if (newStatus) {
      // Going online - get and send location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            locationMutation.mutate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            toggleMutation.mutate(true);
          },
          (error) => {
            setLocationError(error.message);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setLocationError('Geolocation is not supported');
      }
    } else {
      toggleMutation.mutate(false);
    }
  };

  // Accept request
  const acceptMutation = useMutation({
    mutationFn: mechanicApi.acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['activeRequests'] });
    },
  });

  // Live location tracking mutation
  const liveLocationMutation = useMutation({
    mutationFn: mechanicApi.updateLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
  });

  // Start live tracking
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLiveTracking(true);
    setLocationError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLiveLocation(newLocation);
        // Update backend with new location
        liveLocationMutation.mutate(newLocation);
      },
      (error) => {
        setLocationError(`Live tracking error: ${error.message}`);
        setIsLiveTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  }, [liveLocationMutation]);

  // Stop live tracking
  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  }, []);

  // Cleanup on unmount or when going offline
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Stop tracking when mechanic goes offline
  useEffect(() => {
    if (!profile?.isAvailable && isLiveTracking) {
      stopLiveTracking();
    }
  }, [profile?.isAvailable, isLiveTracking, stopLiveTracking]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">Mechanic Dashboard</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link to="/mechanic/parts-search">
            <Button variant="outline" className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Search Parts
            </Button>
          </Link>
          <Button
            size="lg"
            variant={profile?.isAvailable ? 'primary' : 'outline'}
            onClick={handleToggleAvailability}
            isLoading={toggleMutation.isPending || locationMutation.isPending}
            className={profile?.isAvailable ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Power className="h-5 w-5 mr-2" />
            {profile?.isAvailable ? 'Online' : 'Go Online'}
          </Button>
        </div>
      </div>

      {locationError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{locationError}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${profile?.isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Power className={`h-6 w-6 ${profile?.isAvailable ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-bold ${profile?.isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                  {profile?.isAvailable ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{activeRequests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{profile?.totalJobs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold">
                  {profile?.rating ? Number(profile.rating).toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Status */}
      {profile?.currentLatitude && profile?.currentLongitude && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              <span>
                Current Location: {Number(profile.currentLatitude).toFixed(4)}, {Number(profile.currentLongitude).toFixed(4)}
              </span>
              {profile.locationUpdatedAt && (
                <span className="ml-2 text-sm text-gray-400">
                  (Updated: {new Date(profile.locationUpdatedAt).toLocaleTimeString()})
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Location Tracking */}
      {profile?.isAvailable && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Navigation className="h-5 w-5 mr-2 text-green-600" />
              Live Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isLiveTracking ? (
                    <>
                      <span className="relative flex h-3 w-3 mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-green-600 font-medium">Tracking Active</span>
                    </>
                  ) : (
                    <>
                      <span className="h-3 w-3 rounded-full bg-gray-300 mr-3"></span>
                      <span className="text-gray-500">Tracking Inactive</span>
                    </>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isLiveTracking ? 'outline' : 'primary'}
                  onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
                  className={isLiveTracking ? 'border-red-300 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700'}
                >
                  {isLiveTracking ? 'Stop Tracking' : 'Start Live Tracking'}
                </Button>
              </div>

              {isLiveTracking && liveLocation && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center text-green-800">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Live: {liveLocation.latitude.toFixed(6)}, {liveLocation.longitude.toFixed(6)}
                    </span>
                    {liveLocationMutation.isPending && (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-1 ml-6">
                    Location updates automatically as you move
                  </p>
                </div>
              )}

              {!isLiveTracking && (
                <p className="text-sm text-gray-500">
                  Enable live tracking to share your real-time location with customers waiting for service.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActive ? (
              <p className="text-gray-500">Loading...</p>
            ) : activeRequests && activeRequests.length > 0 ? (
              <div className="space-y-3">
                {activeRequests.map((request: ServiceRequest) => (
                  <Link key={request.id} to={`/mechanic/job/${request.id}`}>
                    <RequestCard request={request} variant="active" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active jobs</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Available Requests
              {pendingRequests && pendingRequests.length > 0 && (
                <Badge variant="warning" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!profile?.isAvailable ? (
              <div className="text-center py-8">
                <Power className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Go online to see available requests</p>
              </div>
            ) : isLoadingPending ? (
              <p className="text-gray-500">Loading...</p>
            ) : pendingRequests && pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map((request: ServiceRequest) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    variant="pending"
                    onAccept={() => acceptMutation.mutate(request.id)}
                    isAccepting={acceptMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending requests nearby</p>
                <p className="text-sm text-gray-400 mt-1">
                  New requests will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}