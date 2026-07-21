import { UserProfile } from "@clerk/react";

export default function Profile() {
  return (
    <div className="flex flex-col flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
          Account Settings_
        </h1>
        <div className="flex justify-center w-full">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  );
}
