// src/components/parts/PartsController.tsx
// This file was referenced but missing - create as needed or remove reference

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partsProviderApi } from '../../api/partsProvider';
import { Card, CardHeader, CardTitle, CardContent } from '../common';
import { Package, MapPin, IndianRupee } from 'lucide-react';
import type { Part } from '../../types';

interface PartsControllerProps {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export function PartsController({ latitude, longitude, radiusKm = 10 }: PartsControllerProps) {
  const [selectedCategory] = useState<string | null>(null);

  const { data: parts, isLoading } = useQuery({
    queryKey: ['nearbyParts', latitude, longitude, radiusKm, selectedCategory],
    queryFn: () => partsProviderApi.searchNearbyParts(
      selectedCategory,
      null,
      latitude,
      longitude,
      radiusKm
    ),
    enabled: !!(latitude && longitude),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Nearby Parts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading parts...</p>
          ) : parts && parts.length > 0 ? (
            <div className="space-y-3">
              {parts.map((part: Part) => (
                <div key={part.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{part.name}</h3>
                      <p className="text-sm text-gray-600">{part.brand}</p>
                      {part.shopName && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {part.shopName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {part.price}
                      </p>
                      <p className="text-xs text-gray-500">Stock: {part.stock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No parts found nearby</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}