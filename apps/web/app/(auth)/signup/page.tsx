'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Mail,
  Lock,
  User,
  Target,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { authApi, setAuthCookie, setRefreshCookie } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Logo } from '@/components/ui/logo';

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const goals = [
  { value: 'lose-weight', label: 'Lose Weight', icon: '🔥' },
  { value: 'build-muscle', label: 'Build Muscle', icon: '💪' },
  { value: 'get-stronger', label: 'Get Stronger', icon: '🏋️' },
  { value: 'improve-health', label: 'Improve Health', icon: '❤️' },
  { value: 'increase-endurance', label: 'Endurance', icon: '🏃' },
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', description: "I'm new to fitness" },
  { value: 'intermediate', label: 'Intermediate', description: '1-2 years experience' },
  { value: 'advanced', label: 'Advanced', description: '3+ years experience' },
];

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
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

      // Store tokens in cookies
      setAuthCookie(response.accessToken);
      if (response.refreshToken) {
        setRefreshCookie(response.refreshToken);
      }

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
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <Logo size="xl" />
        </Link>
        <p className="text-muted-foreground mt-2">Your fitness transformation starts here</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all",
          step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {step > 1 ? <Check className="h-4 w-4" /> : '1'}
        </div>
        <div className={cn("w-12 h-0.5", step > 1 ? "bg-primary" : "bg-muted")} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all",
          step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>

      {/* Card */}
      <div className="glass rounded-2xl p-6 border border-border/50">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">
            {step === 1 ? 'Create your account' : 'Tell us about yourself'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 1
              ? 'Start your fitness transformation today'
              : 'This helps us personalize your experience'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm">{t.auth.firstName}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Ahmed"
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({ ...formData, firstName: e.target.value });
                          setError(null);
                        }}
                        className="pl-10 bg-muted/50 border-border/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">{t.auth.lastName}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Mohamed"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        setError(null);
                      }}
                      className="bg-muted/50 border-border/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">{t.auth.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setError(null);
                      }}
                      className={cn(
                        "pl-10 bg-muted/50 border-border/50",
                        formData.email && !isEmailValid && "border-destructive"
                      )}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">{t.auth.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setError(null);
                      }}
                      className="pl-10 pr-10 bg-muted/50 border-border/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={cn(
                          "flex items-center justify-center w-4 h-4 rounded-full transition-all",
                          req.test(formData.password)
                            ? "bg-green-500"
                            : "bg-muted border border-border"
                        )}>
                          {req.test(formData.password) && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <span className={cn(
                          "text-xs",
                          req.test(formData.password) ? "text-green-500" : "text-muted-foreground"
                        )}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Goal Selection */}
                <div className="space-y-3">
                  <Label className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    What's your main goal?
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {goals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, goal: goal.value });
                          setError(null);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left text-sm",
                          formData.goal === goal.value
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-muted/20 hover:border-primary/50"
                        )}
                      >
                        <span>{goal.icon}</span>
                        <span className="font-medium">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Selection */}
                <div className="space-y-3">
                  <Label className="text-sm flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    Experience level
                  </Label>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, experience: level.value });
                          setError(null);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                          formData.experience === level.value
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-muted/20 hover:border-primary/50"
                        )}
                      >
                        <div>
                          <p className="font-medium">{level.label}</p>
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        </div>
                        {formData.experience === level.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading || (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !isPasswordValid))}
          >
            {isLoading ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : step === 1 ? (
              <>
                {t.common.continue}
                <ChevronRight className="ms-2 h-4 w-4" />
              </>
            ) : (
              <>
                <Sparkles className="me-2 h-4 w-4" />
                {t.auth.createAccount}
              </>
            )}
          </Button>

          {step === 2 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep(1)}
            >
              <ChevronLeft className="me-2 h-4 w-4" />
              {t.common.back}
            </Button>
          )}
        </form>

        {step === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">{t.auth.orContinueWith}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-border/50 bg-muted/20" disabled>
                <svg className="me-2 h-4 w-4" viewBox="0 0 24 24">
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
                {t.auth.google}
              </Button>
              <Button variant="outline" className="border-border/50 bg-muted/20" disabled>
                <svg className="me-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                {t.auth.apple}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.auth.haveAccount}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t.auth.login}
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
      </p>
    </div>
  );
}
