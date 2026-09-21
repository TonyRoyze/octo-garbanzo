import { Store } from "lucide-react";
import { AuthForm } from "../../AuthForm";
import type { AuthSession } from "../../auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminLoginProps = {
  onSuccess: (session: AuthSession) => void;
  onStore: () => void;
};

export function AdminLogin({ onSuccess, onStore }: AdminLoginProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in with your administrator account to manage the store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm admin onSuccess={onSuccess} />
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onStore}>
            <Store data-icon="inline-start" />
            Visit storefront
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
