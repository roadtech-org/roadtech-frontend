import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Select,
} from '../common';
import {
  FileText,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const levelOptions = [
  { value: '', label: 'All Levels' },
  { value: 'INFO', label: 'Info' },
  { value: 'WARN', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
];

const levelColors: Record<
  string,
  'default' | 'info' | 'warning' | 'danger'
> = {
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'danger',
};

const levelIcons: Record<string, React.ReactNode> = {
  INFO: <Info className="h-4 w-4" />,
  WARN: <AlertTriangle className="h-4 w-4" />,
  ERROR: <XCircle className="h-4 w-4" />,
};

export function LogsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [levelFilter, setLevelFilter] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['adminLogs', levelFilter, page],
    queryFn: () =>
      adminApi.getSystemLogs(levelFilter, undefined, undefined, page, 20),
    refetchInterval: 10000,
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
      toast.success('Log deleted');
    },
    onError: () => toast.error('Failed to delete log'),
  });

  const clearMutation = useMutation({
    mutationFn: (days: number) => adminApi.clearOldLogs(days),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success(`Cleared ${data.deleted} old log entries`);
      setShowClearModal(false);
    },
    onError: () => toast.error('Failed to clear logs'),
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="w-full sm:max-w-xs">
              <Select
                label="Filter by Level"
                options={levelOptions}
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div className="flex gap-2 self-end sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                title="Refresh Logs"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowClearModal(true)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Old Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            System Logs ({logsData?.totalElements || 0})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : logsData?.content?.length ? (
            <div className="space-y-3">
              {logsData.content.map((log: any) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    log.level === 'ERROR'
                      ? 'bg-red-50 border-red-200'
                      : log.level === 'WARN'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Left */}
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {levelIcons[log.level]}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant={levelColors[log.level]}>
                            {log.level}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 wrap-break-word">
                          {log.details}
                        </p>

                        {log.user && (
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            User: {log.user.fullName} ({log.user.email})
                          </p>
                        )}

                        {log.ipAddress && (
                          <p className="text-xs text-gray-500">
                            IP: {log.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(log.id)}
                      className="text-gray-400 hover:text-red-600 self-end sm:self-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {logsData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Page {page + 1} of {logsData.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(logsData.totalPages - 1, p + 1)
                        )
                      }
                      disabled={page >= logsData.totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No logs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear Logs Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Clear Old Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This will permanently delete all log entries older than the
                selected number of days.
              </p>

              {[7, 30, 90].map((d) => (
                <Button
                  key={d}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => clearMutation.mutate(d)}
                  isLoading={clearMutation.isPending}
                >
                  Clear logs older than {d} days
                </Button>
              ))}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowClearModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
