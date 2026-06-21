import LoginForm from "@/components/All/Login/LoginForm";
import SignedUpRedir from "@/components/All/SignUp/SignedUpRedir";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const LoginPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? <SignedUpRedir user={session?.user} /> : <LoginForm />;
};

export default LoginPage;