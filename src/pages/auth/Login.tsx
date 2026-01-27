import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const hasNavigated = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Handle redirect after authentication
  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true;
      
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      
      // Determine redirect path based on role
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
        default:
          redirectPath = from || '/dashboard';
      }

      // Small delay to ensure state is fully updated before navigation
      const timeoutId = setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const onSubmit = async (data: LoginForm) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await login(data);
      // Navigation will be handled by useEffect above
    } catch (err: any) {
      let message = 'Login failed. Please try again.';

      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.status === 401) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.response?.status === 403) {
        message = 'Your account has been disabled. Please contact support.';
      } else if (err.message && !err.message.includes('status code')) {
        message = err.message;
      }

      toast.error(message, {
        duration: 3000,
        icon: '⚠️',
        position: 'top-center',
      });
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
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="RoadTech"
              className="h-30 w-auto logo-enter"
            />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your RoadTech account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
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
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              disabled={isLoading}
              autoComplete="current-password"
              {...register('password')}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}