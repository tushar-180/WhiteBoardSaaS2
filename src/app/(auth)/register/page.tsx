import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your Zentrox account to start collaborating.",
};

const Page = () => {
  redirect(ROUTES.LOGIN);
};

export default Page;