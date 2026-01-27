import { Car, MapPin, Clock, User } from 'lucide-react';
import { Button, Badge } from '../common';
import type { ServiceRequest, RequestStatus } from '../../types';

const statusColors: Record<RequestStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

interface RequestCardProps {
  request: ServiceRequest;
  variant: 'pending' | 'active';
  onAccept?: () => void;
  isAccepting?: boolean;
}

export function RequestCard({ request, variant, onAccept, isAccepting }: RequestCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-gray-600" />
            {/* <img src="/logo.png" alt="RoadTech Logo" className="h-12 w-auto" /> */}
            <span className="font-semibold text-gray-900">
              {request.issueType.replace('_', ' ')}
            </span>
            <Badge variant={statusColors[request.status]}>
              {request.status}
            </Badge>
          </div>

          {request.user && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              <span>{request.user.fullName}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {request.address || `${Number(request.latitude).toFixed(4)}, ${Number(request.longitude).toFixed(4)}`}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {new Date(request.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {request.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {request.description}
            </p>
          )}
        </div>

        {variant === 'pending' && onAccept && (
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAccept();
            }}
            isLoading={isAccepting}
          >
            Accept
          </Button>
        )}

        {variant === 'active' && (
          <Button size="sm" variant="outline">
            View
          </Button>
        )}
      </div>
    </div>
  );
}
