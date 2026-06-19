import { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new Zentrox password.",
};

const Page = () => {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-muted-foreground text-sm">
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default Page;
