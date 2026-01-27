import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { partsProviderApi } from '../../api/partsProvider';
import { Button, Input, Select } from '../common';
import { X } from 'lucide-react';
import type { Part } from '../../types';

const partSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum([
    'TIRES',
    'BATTERIES',
    'ENGINE_PARTS',
    'BRAKE_PARTS',
    'FILTERS',
    'FLUIDS',
    'ELECTRICAL',
    'OTHER',
  ]),
  brand: z.string().min(2, 'Brand is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type PartForm = z.infer<typeof partSchema>;

const categoryOptions = [
  { value: 'TIRES', label: 'Tires' },
  { value: 'BATTERIES', label: 'Batteries' },
  { value: 'ENGINE_PARTS', label: 'Engine Parts' },
  { value: 'BRAKE_PARTS', label: 'Brake Parts' },
  { value: 'FILTERS', label: 'Filters' },
  { value: 'FLUIDS', label: 'Fluids' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'OTHER', label: 'Other' },
];

interface EditPartModalProps {
  part: Part;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPartModal({ part, onClose, onSuccess }: EditPartModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartForm>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: part.name,
      category: part.category,
      brand: part.brand,
      price: part.price,
      stock: part.stock,
      description: part.description || '',
      imageUrl: part.imageUrl || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PartForm) => partsProviderApi.updatePart(part.id, data),
    onSuccess: () => {
      toast.success('Part updated successfully! ✅');
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update part';
      toast.error(message);
    },
  });

  const onSubmit = (data: PartForm) => {
    updateMutation.mutate({
      ...data,
      imageUrl: data.imageUrl || undefined,
      description: data.description || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Part</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Part Name"
              placeholder="e.g., Michelin Tire 205/55R16"
              error={errors.name?.message}
              {...register('name')}
            />

            <Select
              label="Category"
              options={categoryOptions}
              error={errors.category?.message}
              {...register('category')}
            />

            <Input
              label="Brand"
              placeholder="e.g., Michelin, Bosch"
              error={errors.brand?.message}
              {...register('brand')}
            />

            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />

            <Input
              label="Stock Quantity"
              type="number"
              placeholder="0"
              error={errors.stock?.message}
              {...register('stock', { valueAsNumber: true })}
            />

            <Input
              label="Image URL (optional)"
              type="url"
              placeholder="https://example.com/image.jpg"
              error={errors.imageUrl?.message}
              {...register('imageUrl')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              className="flex min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the part details, specifications, etc."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Update Part
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}