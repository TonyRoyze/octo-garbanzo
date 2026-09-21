import { useState, type SubmitEvent } from "react";
import { LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authApi,
  signOut,
  type AuthSession,
  type BrowserLocation,
} from "./auth";

function getBrowserLocation(): Promise<BrowserLocation | null> {
  if (!("geolocation" in navigator)) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
  });
}

export function AuthForm({
  admin = false,
  onSuccess,
}: {
  admin?: boolean;
  onSuccess: (session: AuthSession) => void;
}) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const browserLocation = registering ? await getBrowserLocation() : null;
      const session = registering
        ? await authApi.register(name, email, password, browserLocation)
        : await authApi.login(email, password);
      if (admin && session.user.role !== "ADMIN") {
        signOut();
        throw new Error("This account does not have admin access");
      }
      onSuccess(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      {registering && (
        <label className="flex flex-col gap-2 text-sm">
          Name
          <Input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </label>
      )}
      <label className="flex flex-col gap-2 text-sm">
        Email
        <Input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        Password
        <Input
          required
          // minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={registering ? "new-password" : "current-password"}
        />
      </label>
      {registering && (
        <p className="text-xs text-muted-foreground">
          Your browser may ask to share your location. If you decline, your
          account will still be created without it.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {admin ? (
          <LockKeyhole data-icon="inline-start" />
        ) : (
          <UserRound data-icon="inline-start" />
        )}
        {busy ? "Please wait…" : registering ? "Create account" : "Sign in"}
      </Button>
      {!admin && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setRegistering(!registering);
            setError("");
          }}
        >
          {registering
            ? "Already have an account? Sign in"
            : "New customer? Create an account"}
        </Button>
      )}
    </form>
  );
}
