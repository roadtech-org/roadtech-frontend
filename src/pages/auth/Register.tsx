import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common';
import { LocationPicker } from '../../components/maps/LocationPicker';
import type { UserRole } from '../../types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
  role: z.enum(['USER', 'MECHANIC', 'PARTS_PROVIDER'] as const),
  shopName: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'PARTS_PROVIDER') {
    return data.shopName && data.shopName.length >= 2;
  }
  return true;
}, {
  message: 'Shop name is required for parts providers',
  path: ['shopName'],
}).refine((data) => {
  if (data.role === 'PARTS_PROVIDER') {
    return data.address && data.address.length >= 5;
  }
  return true;
}, {
  message: 'Address is required for parts providers',
  path: ['address'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'USER', label: 'I need roadside assistance (User)' },
  { value: 'MECHANIC', label: 'I provide roadside assistance (Mechanic)' },
  { value: 'PARTS_PROVIDER', label: 'I sell auto parts (Parts Provider)' },
];

const specializationOptions = [
  { value: 'FLAT_TIRE', label: 'Flat Tire' },
  { value: 'ENGINE_FAILURE', label: 'Engine Failure' },
  { value: 'BATTERY_DEAD', label: 'Dead Battery' },
  { value: 'OUT_OF_FUEL', label: 'Fuel Delivery' },
  { value: 'LOCKED_OUT', label: 'Lockout Service' },
  { value: 'ACCIDENT', label: 'Accident Recovery' },
  { value: 'OTHER', label: 'General Repairs' },
];

export function Register() {
  const { register: registerUser, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const hasNavigated = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const selectedRole = watch('role');

  // Handle redirect after authentication
  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true;
      
      let redirectPath = '/dashboard';
      switch (user.role) {
        case 'ADMIN':
          redirectPath = '/admin';
          break;
        case 'MECHANIC':
          redirectPath = '/mechanic';
          break;
        case 'PARTS_PROVIDER':
          redirectPath = '/parts-provider';
          break;
      }

      // Small delay to ensure state is fully updated before navigation
      const timeoutId = setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, navigate]);

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const onSubmit = async (data: RegisterForm) => {
    // Validate location for parts provider
    if (data.role === 'PARTS_PROVIDER' && !location) {
      toast.error('Please select your shop location on the map', {
        duration: 4000,
        icon: '📍',
        position: 'top-center',
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role as UserRole,
        specializations: data.role === 'MECHANIC' ? selectedSpecs : undefined,
        shopName: data.role === 'PARTS_PROVIDER' ? data.shopName : undefined,
        address: data.role === 'PARTS_PROVIDER' ? data.address : undefined,
        latitude: data.role === 'PARTS_PROVIDER' && location ? location.lat : undefined,
        longitude: data.role === 'PARTS_PROVIDER' && location ? location.lng : undefined,
      });

      // Navigation will be handled by useEffect above
    } catch (err: any) {
      let message = 'Registration failed. Please try again.';

      // Extract error message from response
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.response?.status === 400) {
        // Check if it's a validation error or duplicate email
        if (err.response.data?.errors) {
          const errors = err.response.data.errors;
          message = Object.values(errors)[0] as string;
        } else {
          message = 'Email already registered or invalid data provided.';
        }
      } else if (err.response?.status === 409) {
        message = 'An account with this email already exists.';
      } else if (err.message && !err.message.includes('status code')) {
        message = err.message;
      }

      toast.error(message, {
        duration: 3000,
        icon: '❌',
        position: 'top-center',
      });

      console.error('Registration error:', err);
      console.log('Error response:', err.response);
      console.log('Error response data:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form if already authenticated (prevents flash)
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="RoadTech"
              className="h-30 w-auto logo-enter"
            />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join RoadTech today</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.fullName?.message}
                disabled={isLoading}
                autoComplete="name"
                {...register('fullName')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                disabled={isLoading}
                autoComplete="email"
                {...register('email')}
              />

              <Input
                label="Phone Number"
                placeholder="+1234567890"
                error={errors.phone?.message}
                disabled={isLoading}
                autoComplete="tel"
                {...register('phone')}
              />

              <Select
                label="I want to..."
                options={roleOptions}
                error={errors.role?.message}
                disabled={isLoading}
                {...register('role')}
              />
            </div>

            {/* Parts Provider specific fields */}
            {selectedRole === 'PARTS_PROVIDER' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Shop Name"
                    placeholder="AutoParts Central"
                    error={errors.shopName?.message}
                    disabled={isLoading}
                    {...register('shopName')}
                  />
                  <Input
                    label="Shop Address"
                    placeholder="123 Main St, City"
                    error={errors.address?.message}
                    disabled={isLoading}
                    {...register('address')}
                  />
                </div>
                <LocationPicker
                  onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                />
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                disabled={isLoading}
                autoComplete="new-password"
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                disabled={isLoading}
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </div>

            {selectedRole === 'MECHANIC' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((spec) => (
                    <button
                      key={spec.value}
                      type="button"
                      onClick={() => toggleSpecialization(spec.value)}
                      disabled={isLoading}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedSpecs.includes(spec.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}