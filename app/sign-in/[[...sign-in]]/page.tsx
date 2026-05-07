import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040706]">
      <SignIn 
        appearance={{
          variables: { colorPrimary: '#34d399' },
        }}
      />
    </div>
  );
}