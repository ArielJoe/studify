import LoginForm from "@/components/ui/login-form";

const Page = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Section */}
      <div
        className="hidden lg:flex lg:flex-1 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%)", // hijau → biru
        }}
      >
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md space-y-6">
            <h2 className="text-5xl font-bold leading-tight drop-shadow-md">
              Build better habits, one day at a time
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Track your progress, stay motivated, and transform your daily
              routines into lasting positive changes.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 lg:flex-none lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
              HabitFlow
            </h1>
            <p className="text-muted-foreground mt-2">
              Your personal habit tracking companion
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
