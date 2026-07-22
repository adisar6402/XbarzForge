import { UserProfile } from "@clerk/react";
import { Link } from "wouter";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  return (
    <div className="flex flex-col flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
              Account Settings_
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Manage your XbarzForge account
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" className="font-mono">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <Link href="/dashboard">
          <Button variant="ghost" className="font-mono">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex justify-center w-full">
          <UserProfile routing="hash" />
        </div>

      </div>
    </div>
  );
}