import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common';
import { Car, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
  role: z.enum(['USER', 'MECHANIC'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'USER', label: 'I need roadside assistance (User)' },
  { value: 'MECHANIC', label: 'I provide roadside assistance (Mechanic)' },
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
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

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

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setIsLoading(true);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role as UserRole,
        specializations: data.role === 'MECHANIC' ? selectedSpecs : undefined,
      });

      const redirectPath = data.role === 'MECHANIC' ? '/mechanic' : '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join RoadTech today</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              placeholder="+1234567890"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Select
              label="I want to..."
              options={roleOptions}
              error={errors.role?.message}
              {...register('role')}
            />

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
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedSpecs.includes(spec.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
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
