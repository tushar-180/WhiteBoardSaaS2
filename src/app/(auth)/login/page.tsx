import { Suspense } from "react";
import LoginPage from "@/components/auth/login-form";

const page = () => {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-muted-foreground text-sm">
        Loading...
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
};

export default page;