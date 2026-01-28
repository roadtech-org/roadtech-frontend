import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanicApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '../../components/common';
import { RequestCard } from '../../components/mechanic/RequestCard';
import {
  Power,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Navigation,
  Loader2,
  Package,
} from 'lucide-react';
import type { ServiceRequest } from '../../types';

export function MechanicDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  /* -------------------- QUERIES -------------------- */

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['mechanicProfile'],
    queryFn: mechanicApi.getProfile,
  });

  const { data: pendingRequests, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: mechanicApi.getPendingRequests,
    refetchInterval: 10000,
    enabled: profile?.isAvailable && profile?.isVerified,
  });

  const { data: activeRequests, isLoading: isLoadingActive } = useQuery({
    queryKey: ['activeRequests'],
    queryFn: mechanicApi.getActiveRequests,
    refetchInterval: 5000,
    enabled: profile?.isVerified,
  });

  /* -------------------- MUTATIONS -------------------- */

  const toggleMutation = useMutation({
    mutationFn: (isAvailable: boolean) =>
      mechanicApi.toggleAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
  });

  const locationMutation = useMutation({
    mutationFn: mechanicApi.updateLocation,
    onSuccess: () => {
      setLocationError(null);
      queryClient.invalidateQueries({ queryKey: ['mechanicProfile'] });
    },
    onError: (error: Error) => setLocationError(error.message),
  });

  const acceptMutation = useMutation({
    mutationFn: mechanicApi.acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['activeRequests'] });
    },
  });

  const liveLocationMutation = useMutation({
    mutationFn: mechanicApi.updateLocation,
  });

  /* -------------------- HANDLERS -------------------- */

  const handleToggleAvailability = () => {
    if (!profile?.isVerified) return;

    const newStatus = !profile?.isAvailable;

    if (newStatus) {
      if (!navigator.geolocation) {
        setLocationError('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toggleMutation.mutate(true);
        },
        (error) => setLocationError(error.message),
        { enableHighAccuracy: true }
      );
    } else {
      toggleMutation.mutate(false);
    }
  };

  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation || !profile?.isVerified) return;

    setIsLiveTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLiveLocation(loc);
        liveLocationMutation.mutate(loc);
      },
      (error) => {
        setLocationError(error.message);
        setIsLiveTracking(false);
      },
      { enableHighAccuracy: true }
    );
  }, [profile?.isVerified, liveLocationMutation]);

  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!profile?.isAvailable && isLiveTracking) {
      stopLiveTracking();
    }
  }, [profile?.isAvailable, isLiveTracking, stopLiveTracking]);

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Mechanic Dashboard</p>

          {!profile?.isVerified && (
            <Badge variant="warning" className="mt-2">
              ⏳ Verification Pending
            </Badge>
          )}
        </div>

        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link to="/mechanic/parts-search">
            <Button variant="outline" disabled={!profile?.isVerified}>
              <Package className="h-5 w-5 mr-2" />
              Search Parts
            </Button>
          </Link>

          <Button
            size="lg"
            onClick={handleToggleAvailability}
            disabled={!profile?.isVerified}
            isLoading={toggleMutation.isPending || locationMutation.isPending}
            className={
              profile?.isAvailable ? 'bg-green-600 hover:bg-green-700' : ''
            }
          >
            <Power className="h-5 w-5 mr-2" />
            {profile?.isAvailable ? 'Online' : 'Go Online'}
          </Button>
        </div>
      </div>

      {/* VERIFICATION NOTICE */}
      {!profile?.isVerified && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 flex gap-2">
          <AlertCircle />
          <div>
            <p className="font-medium">Account under verification</p>
            <p className="text-sm">
              You can view the dashboard, but accepting jobs and going online
              will be enabled after admin approval.
            </p>
          </div>
        </div>
      )}

      {locationError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md flex gap-2">
          <AlertCircle />
          <span>{locationError}</span>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Status" value={profile?.isAvailable ? 'Online' : 'Offline'} icon={<Power />} />
        <Stat label="Active Jobs" value={activeRequests?.length || 0} icon={<Briefcase />} />
        <Stat label="Total Jobs" value={profile?.totalJobs || 0} icon={<CheckCircle />} />
        <Stat
          label="Rating"
          value={profile?.rating ? Number(profile.rating).toFixed(1) : 'N/A'}
          icon={<Clock />}
        />
      </div>

      {/* LIVE TRACKING */}
      {profile?.isAvailable && profile?.isVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="mr-2" /> Live Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
              className={
                isLiveTracking
                  ? 'border-red-300 text-red-600'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {isLiveTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>

            {isLiveTracking && liveLocation && (
              <p className="text-sm text-green-700 mt-3">
                Live: {liveLocation.latitude.toFixed(5)},{' '}
                {liveLocation.longitude.toFixed(5)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* JOBS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVE */}
        <JobCard
          title="Active Jobs"
          icon={<Briefcase />}
          loading={isLoadingActive}
          disabled={!profile?.isVerified}
          emptyText="No active jobs"
        >
          {activeRequests?.map((r: ServiceRequest) => (
            <Link key={r.id} to={`/mechanic/job/${r.id}`}>
              <RequestCard request={r} variant="active" />
            </Link>
          ))}
        </JobCard>

        {/* AVAILABLE */}
        <JobCard
          title="Available Requests"
          icon={<AlertCircle />}
          loading={isLoadingPending}
          disabled={!profile?.isVerified || !profile?.isAvailable}
          emptyText="No pending requests"
        >
          {pendingRequests?.map((r: ServiceRequest) => (
            <RequestCard
              key={r.id}
              request={r}
              variant="pending"
              onAccept={() => acceptMutation.mutate(r.id)}
              isAccepting={acceptMutation.isPending}
            />
          ))}
        </JobCard>
      </div>
    </div>
  );
}

/* -------------------- SMALL COMPONENTS -------------------- */

function Stat({ label, value, icon }: any) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({
  title,
  icon,
  loading,
  disabled,
  emptyText,
  children,
}: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon} <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <p className="text-center text-gray-500 py-8">
            Account verification pending
          </p>
        ) : loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : children?.length ? (
          <div className="space-y-3">{children}</div>
        ) : (
          <p className="text-center text-gray-500 py-8">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
