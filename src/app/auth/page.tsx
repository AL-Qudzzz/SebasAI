
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageTitle from '@/components/common/PageTitle';
import type { AuthError, User as FirebaseUser } from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
type FormData = z.infer<typeof formSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { signUp, login, loadingAuthState: authContextLoading } = useAuth(); // Renamed loadingAuthState to avoid conflict
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleAuthAction: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    let result: FirebaseUser | Error | undefined;

    if (activeTab === 'login') {
      result = await login(data.email, data.password);
    } else {
      result = await signUp(data.email, data.password);
    }
    
    setIsLoading(false);

    if (result instanceof Error) {
      // Check if it's an AuthError by looking for the 'code' property
      if ('code' in result && typeof (result as any).code === 'string') {
          const authError = result as AuthError;
          switch (authError.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential': // Common for incorrect login
                  setError('Invalid email or password.');
                  break;
              case 'auth/email-already-in-use':
                  setError('This email is already registered. Try logging in.');
                  break;
              case 'auth/weak-password':
                  setError('Password is too weak. Please choose a stronger password.');
                  break;
              default:
                  setError(authError.message || 'An authentication error occurred.');
          }
      } else {
          // Generic error
          setError(result.message || 'An unexpected error occurred.');
      }
    } else if (result) { // Success (FirebaseUser)
      reset(); // Clear form
      router.push('/'); // Redirect to dashboard or desired page
    } else {
      // This case should ideally not be reached if login/signUp always return User or Error
      setError('An unexpected issue occurred. Please try again.');
    }
  };

  if (authContextLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <PageTitle title={activeTab === 'login' ? "Login" : "Sign Up"} description="Access your MyBot account or create a new one." />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login'
              ? 'Log in to access your personalized wellness journey.'
              : 'Sign up to start tracking your mood and journaling.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'login' | 'signup');
            setError(null); // Clear error on tab change
            reset(); // Clear form on tab change
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSubmit(handleAuthAction)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                {error && activeTab === 'login' && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit(handleAuthAction)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                {error && activeTab === 'signup' && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
