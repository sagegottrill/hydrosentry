import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HydroSentryLogo } from '@/components/HydroSentryLogo';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('guest-operator@hydrosentry.org');
  const [password, setPassword] = useState('demo-guestok'); // 12 chars → twelve masked dots in UI
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] items-center justify-center overflow-x-hidden bg-secondary/30 p-4 md:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <Card className="w-full max-w-md relative z-10 shadow-xl border-border/50">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <HydroSentryLogo size="large" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              HydroSentry Command Interface
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Decentralized Edge Operations
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Dispatcher ID / Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="guest-operator@hydrosentry.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 min-h-11 pl-10 text-base sm:h-10 sm:min-h-0 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Secure Passphrase
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 min-h-11 pl-10 text-base sm:h-10 sm:min-h-0 sm:text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-6 min-h-12 w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Initializing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Initialize Offline Session
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              🟢 Public Demo Active: Read-only guest credentials auto-loaded for community testing.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 max-w-md px-4 text-center text-xs text-muted-foreground space-y-1">
        <p>Command console — offline-capable sync for field operations.</p>
        <p>
          © 2026 Orivon Edge. MIT Open-Source License · HydroSentry v1.2.4-MVP.
        </p>
      </div>
    </div>
  );
}
