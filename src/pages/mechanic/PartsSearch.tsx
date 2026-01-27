import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partsApi } from '../../api/parts';
import {
  Card,
  CardContent,
  Input,
  Button,
  Badge,
} from '../../components/common';
import {
  Search,
  MapPin,
  Phone,
  Package,
  Store,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Location = {
  latitude: number;
  longitude: number;
};

export function PartsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'parts' | 'vendors'>('parts');
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  /* ===================== LOCATION ===================== */
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => toast.error('Please enable location access')
    );
  }, []);

  /* ===================== GOOGLE MAPS ===================== */
  const openGoogleMaps = (
    latitude: number,
    longitude: number,
    label?: string
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(
      label ?? ''
    )}`;
    window.open(url, '_blank');
  };

  /* ===================== PARTS QUERY ===================== */
  const {
    data: parts = [],
    isLoading: partsLoading,
    isError: partsError,
    refetch: refetchParts,
  } = useQuery({
    queryKey: [
      'searchParts',
      searchQuery,
      category,
      userLocation?.latitude,
      userLocation?.longitude,
    ],
    enabled: !!userLocation && activeTab === 'parts',
    queryFn: () =>
      partsApi.searchParts({
        search: searchQuery || undefined,
        category: category || undefined,
        latitude: userLocation!.latitude,
        longitude: userLocation!.longitude,
        radiusKm: 50,
      }),
  });

  /* ===================== VENDORS QUERY ===================== */
  const {
    data: vendors = [],
    isLoading: vendorsLoading,
    refetch: refetchVendors,
  } = useQuery({
    queryKey: [
      'vendors',
      userLocation?.latitude,
      userLocation?.longitude,
    ],
    enabled: !!userLocation && activeTab === 'vendors',
    queryFn: () =>
      partsApi.getNearbyProviders({
        latitude: userLocation!.latitude,
        longitude: userLocation!.longitude,
        radiusKm: 50,
      }),
  });

  const handleSearch = () => {
    activeTab === 'parts' ? refetchParts() : refetchVendors();
  };

  const categories = [
    'All',
    'ENGINE_PARTS',
    'BRAKE_PARTS',
    'FILTERS',
    'BATTERIES',
    'ELECTRICAL',
    'FLUIDS',
    'TIRES',
    'OTHER',
  ];

  /* ===================== LOCATION REQUIRED ===================== */
  if (!userLocation) {
    return (
      <Card className="p-10 text-center">
        <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
        Enable location to search parts & vendors
      </Card>
    );
  }

  /* ===================== UI ===================== */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parts Search</h1>

      {/* ===================== TABS ===================== */}
      <div className="flex gap-6 border-b pb-2">
        <button
          onClick={() => setActiveTab('parts')}
          className={`flex items-center gap-1 ${
            activeTab === 'parts'
              ? 'font-semibold border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
        >
          <Package size={16} />
          Parts
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-1 ${
            activeTab === 'vendors'
              ? 'font-semibold border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
        >
          <Store size={16} />
          Vendors
        </button>
      </div>

      {/* ===================== SEARCH ===================== */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search parts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All' ? '' : c}>
                {c}
              </option>
            ))}
          </select>

          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </CardContent>
      </Card>

      {/* ===================== PARTS TAB ===================== */}
      {activeTab === 'parts' && (
        <>
          {partsLoading && <p>Searching parts...</p>}
          {partsError && (
            <p className="text-red-600">Failed to load parts</p>
          )}

          {!partsLoading && parts.length === 0 && (
            <Card className="p-10 text-center">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              No parts found
            </Card>
          )}

          <div className="space-y-4">
            {parts.map((part) => (
              <Card key={part.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {part.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {part.brand}
                      </p>
                      <p className="text-sm mt-1">
                        Shop: {part.shopName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        ₹{part.price}
                      </p>
                      <Badge
                        variant={
                          part.stock > 0 ? 'success' : 'danger'
                        }
                      >
                        {part.stock > 0
                          ? `${part.stock} in stock`
                          : 'Out of stock'}
                      </Badge>
                    </div>
                  </div>

                  {part.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {part.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ===================== VENDORS TAB ===================== */}
      {activeTab === 'vendors' && (
        <>
          {vendorsLoading && <p>Loading vendors...</p>}

          {!vendorsLoading && vendors.length === 0 && (
            <Card className="p-10 text-center">
              <Store className="mx-auto mb-4 text-gray-400" size={48} />
              No vendors found nearby
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <Card key={v.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {v.shopName}
                      </h3>

                      <p className="text-sm text-gray-600 flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                        {v.address}
                      </p>

                      {v.phone && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1" />
                          <a
                            href={`tel:${v.phone}`}
                            className="hover:text-blue-600"
                          >
                            {v.phone}
                          </a>
                        </p>
                      )}
                    </div>

                    {v.isOpen && (
                      <Badge variant="success">Open</Badge>
                    )}
                  </div>

                  {/* 🔥 NAVIGATION BUTTON */}
                  <Button
                    className="w-full flex items-center justify-center"
                    onClick={() =>
                      openGoogleMaps(
                        Number(v.latitude),
                        Number(v.longitude),
                        v.shopName
                      )
                    }
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
