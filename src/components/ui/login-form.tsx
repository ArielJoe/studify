"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/ui/google-icon";

const LoginForm = () => {
  const handleGoogleLogin = () => {
    // Google login logic will be implemented with Lovable Cloud
    console.log("Google login clicked");
  };

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-elegant border-0 bg-card/90 backdrop-blur-sm">
        <CardContent className="space-y-6 p-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground ">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-lg">
              Sign in to continue building your habits
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <GoogleIcon className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Secure sign-in
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                By signing in, you agree to our{" "}
                <a
                  href="#"
                  className="font-medium hover:underline text-sky-400"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium hover:underline text-sky-400"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
