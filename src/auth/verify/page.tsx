import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We've sent you a magic link to sign in to your account. 
            Check your email and click the link to continue.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            You can close this tab once you've clicked the link in your email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}