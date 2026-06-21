import { ArrowLeft, House } from "lucide-react";
import Link from "next/link";

const SignedUpRedir = ({ user }) => {
    const firstName = user?.name?.split(" ")[0] || "there";
    
    return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-5">

        <div className="space-y-1 text-foreground pb-20 md:pb-40">
          <h1 className="text-5xl font-black">
            Hi {firstName}!
          </h1>
          <h3 className="text-xl font-bold">
            You&apos;re already signed in!
          </h3>
        </div>
          <p className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">You&apos;re logged in as</span> 
            <span className="text-foreground font-medium">{user?.email}</span>.
          </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <House className="h-4 w-4" />
            Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignedUpRedir;