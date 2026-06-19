import { Metadata } from "next";
import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Zentrox password.",
};

const Page = () => {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-muted-foreground text-sm">
        Loading...
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
};

export default Page;
