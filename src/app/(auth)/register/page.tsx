import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

const Page = () => {
  redirect(ROUTES.LOGIN);
};

export default Page;