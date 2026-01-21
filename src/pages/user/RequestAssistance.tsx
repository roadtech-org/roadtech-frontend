import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { serviceRequestApi } from '../../api';
import { Button, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { AlertCircle, Car } from 'lucide-react';
import type { IssueType } from '../../types';

const issueTypes = [
  { value: 'FLAT_TIRE', label: 'Flat Tire' },
  { value: 'ENGINE_FAILURE', label: 'Engine Failure' },
  { value: 'BATTERY_DEAD', label: 'Dead Battery' },
  { value: 'OUT_OF_FUEL', label: 'Out of Fuel' },
  { value: 'LOCKED_OUT', label: 'Locked Out' },
  { value: 'ACCIDENT', label: 'Accident' },
  { value: 'OTHER', label: 'Other Issue' },
];

const requestSchema = z.object({
  issueType: z.enum(['FLAT_TIRE', 'ENGINE_FAILURE', 'BATTERY_DEAD', 'OUT_OF_FUEL', 'LOCKED_OUT', 'ACCIDENT', 'OTHER'] as const),
  description: z.string().max(1000).optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

export function RequestAssistance() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      issueType: 'FLAT_TIRE',
    },
  });

  const createMutation = useMutation({
    mutationFn: serviceRequestApi.create,
    onSuccess: (data) => {
      navigate(`/request/${data.id}`);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create request. Please try again.');
    },
  });

  const onSubmit = (data: RequestForm) => {
    if (!location) {
      setError('Please select your location on the map');
      return;
    }

    setError(null);
    createMutation.mutate({
      issueType: data.issueType as IssueType,
      description: data.description,
      latitude: location.lat,
      longitude: location.lng,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Request Assistance</CardTitle>
              <CardDescription>
                Tell us about your issue and we'll find a mechanic near you
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Select
              label="What's the problem?"
              options={issueTypes}
              error={errors.issueType?.message}
              {...register('issueType')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                className="flex min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your situation in more detail..."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <LocationPicker
              onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
            >
              Request Help
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
