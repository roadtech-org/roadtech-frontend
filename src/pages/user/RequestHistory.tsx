import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { serviceRequestApi } from '../../api';
import { Card, CardContent, Badge, Button } from '../../components/common';
import { Car, MapPin, Clock, User, ChevronRight } from 'lucide-react';
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

export function RequestHistory() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['userRequests'],
    queryFn: serviceRequestApi.getUserRequests,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request History</h1>
        <p className="text-gray-600 mt-1">View all your past assistance requests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request: ServiceRequest) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg mt-1">
                      <Car className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {request.issueType.replace('_', ' ')}
                        </h3>
                        <Badge variant={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {request.address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{request.address}</span>
                          </div>
                        )}

                        {request.mechanicId && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>Mechanic assigned</span>
                          </div>
                        )}
                      </div>

                      {request.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {request.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link to={`/request/${request.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Requests Yet</h2>
            <p className="text-gray-600 mb-4">
              You haven't made any assistance requests yet.
            </p>
            <Link to="/request-assistance">
              <Button>Request Assistance</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
