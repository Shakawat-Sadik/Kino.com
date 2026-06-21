import SignedUpRedir from "@/components/All/SignUp/SignedUpRedir";
import SignUpForm from "@/components/All/SignUp/SignUpForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SignUpPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? <SignedUpRedir user={session?.user} /> : <SignUpForm />;
};

export default SignUpPage;
