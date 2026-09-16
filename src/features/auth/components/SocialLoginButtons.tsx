import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { usePublicFeatureFlagsQuery } from '@/features/feature-flags/hooks/use-feature-flags';

export const GoogleIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const FacebookIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </svg>
);

export const SocialLoginButtons = () => {
  const { data: flags, isLoading } = usePublicFeatureFlagsQuery();
  const [redirectingProvider, setRedirectingProvider] = useState<'google' | 'facebook' | null>(null);

  if (isLoading || !flags?.oauth_social_login) {
    return null;
  }

  const showGoogle = Boolean(flags.oauth_google);
  const showFacebook = Boolean(flags.oauth_facebook);

  if (!showGoogle && !showFacebook) {
    return null;
  }

  const handleOAuthRedirect = (provider: 'google' | 'facebook') => {
    setRedirectingProvider(provider);
    const baseURL = (apiClient.defaults.baseURL || '/api').replace(/\/+$/, '');
    window.location.href = `${baseURL}/auth/${provider}`;
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-[10px] text-muted-foreground font-medium">
            O continuar con
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {showGoogle && (
          <Button
            type="button"
            variant="outline"
            disabled={redirectingProvider !== null}
            onClick={() => handleOAuthRedirect('google')}
            className={`w-full h-10 text-xs font-medium border-border/80 hover:bg-muted/50 transition-all ${
              !showFacebook ? 'sm:col-span-2' : ''
            }`}
          >
            {redirectingProvider === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            <span>Google</span>
          </Button>
        )}

        {showFacebook && (
          <Button
            type="button"
            variant="outline"
            disabled={redirectingProvider !== null}
            onClick={() => handleOAuthRedirect('facebook')}
            className={`w-full h-10 text-xs font-medium border-border/80 hover:bg-muted/50 transition-all ${
              !showGoogle ? 'sm:col-span-2' : ''
            }`}
          >
            {redirectingProvider === 'facebook' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FacebookIcon className="mr-2 h-4 w-4" />
            )}
            <span>Facebook</span>
          </Button>
        )}
      </div>
    </div>
  );
};

