import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { AuthService } from "@/services/auth";
import { configDotenv } from "dotenv";

configDotenv();

export default async function ProfilePage() {
  const session = await AuthService.getSession();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/profile");
  }

  return (
    <ProfileClient session={session} />
  );
}
