
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
  const { signUp, login, loadingAuthState: authContextLoading } = useAuth();
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
      if ('code' in result && typeof (result as any).code === 'string') {
          const authError = result as AuthError;
          switch (authError.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  setError('Invalid email or password. Please try again.');
                  break;
              case 'auth/email-already-in-use':
                  setError('This email is already registered. Please try logging in.');
                  break;
              case 'auth/weak-password':
                  setError('Password is too weak. Please choose a stronger password (at least 6 characters).');
                  break;
              case 'auth/invalid-api-key':
              case 'auth/api-key-not-valid':
                  setError('Firebase API Key is invalid. Please check your Firebase project configuration and ensure your .env file is correct and the server has been restarted.');
                  break;
              case 'auth/app-deleted':
              case 'auth/app-not-authorized':
              case 'auth/project-not-found':
                  setError('Firebase project configuration error. Please check your Firebase setup.');
                  break;
              default:
                  setError(authError.message || `An authentication error occurred: ${authError.code}`);
          }
      } else {
          setError(result.message || 'An unexpected error occurred. Please try again.');
      }
    } else if (result) { 
      reset(); 
      router.push('/'); 
    } else {
      setError('An unexpected issue occurred during authentication. Please try again.');
    }
  };

  if (authContextLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <PageTitle 
        title={activeTab === 'login' ? "Login" : "Sign Up"} 
        description="Access your Sebas account or create a new one."
        className="text-center"
      />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center">
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
            setError(null); 
            reset(); 
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
