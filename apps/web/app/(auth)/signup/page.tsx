'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authApi, setAuthCookie } from '@/lib/api';

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    goal: '',
    experience: '',
  });

  const isPasswordValid = passwordRequirements.every((req) => req.test(formData.password));
  const isEmailValid = emailRegex.test(formData.email);

  const validateStep1 = () => {
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      setError('First name must be at least 2 characters');
      return false;
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters');
      return false;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (!formData.goal || !formData.experience) {
      setError('Please select your goal and experience level');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });

      // Store the token in cookie
      setAuthCookie(response.accessToken);

      // Store onboarding data in localStorage for the onboarding page
      localStorage.setItem('onboarding-data', JSON.stringify({
        goal: formData.goal,
        experience: formData.experience,
      }));

      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          {step === 1 ? 'Create your account' : 'Tell us about yourself'}
        </CardTitle>
        <CardDescription className="text-white/60">
          {step === 1
            ? 'Start your fitness transformation today'
            : 'This helps us personalize your experience'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress indicator */}
        <div className="mb-6 flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-forma-teal' : 'bg-white/20'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-forma-teal' : 'bg-white/20'}`} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white/80">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Ahmed"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      setError(null);
                    }}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white/80">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Mohamed"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      setError(null);
                    }}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError(null);
                  }}
                  className={`border-white/20 bg-white/10 text-white placeholder:text-white/40 ${
                    formData.email && !isEmailValid ? 'border-red-500' : ''
                  }`}
                  required
                />
                {formData.email && !isEmailValid && (
                  <p className="text-xs text-red-400">Please enter a valid email address</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setError(null);
                    }}
                    className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password requirements */}
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                          req.test(formData.password)
                            ? 'bg-forma-teal text-forma-navy'
                            : 'bg-white/20'
                        }`}
                      >
                        {req.test(formData.password) && <Check className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-xs ${
                          req.test(formData.password) ? 'text-forma-teal' : 'text-white/40'
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-white/80">
                  What is your main fitness goal?
                </Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => {
                    setFormData({ ...formData, goal: value });
                    setError(null);
                  }}
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose-weight">Lose Weight</SelectItem>
                    <SelectItem value="build-muscle">Build Muscle</SelectItem>
                    <SelectItem value="get-stronger">Get Stronger</SelectItem>
                    <SelectItem value="improve-health">Improve Overall Health</SelectItem>
                    <SelectItem value="increase-endurance">Increase Endurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-white/80">
                  What is your fitness experience level?
                </Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => {
                    setFormData({ ...formData, experience: value });
                    setError(null);
                  }}
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - New to fitness</SelectItem>
                    <SelectItem value="intermediate">Intermediate - 1-2 years</SelectItem>
                    <SelectItem value="advanced">Advanced - 3+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            variant="forma"
            disabled={isLoading || (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !isPasswordValid))}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Create account'
            )}
          </Button>

          {step === 2 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-white/60 hover:text-white"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
          )}
        </form>

        {step === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/40">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" disabled>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" disabled>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Apple
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-white/60">
              Already have an account?{' '}
              <Link href="/login" className="text-forma-teal hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
