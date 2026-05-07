import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040706]">
      <SignUp 
        appearance={{
          variables: { colorPrimary: '#34d399' },
        }}
      />
    </div>
  );
}