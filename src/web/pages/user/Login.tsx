"use client";

import { useState, useTransition } from "react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { authClient } from "../../lib/auth-client";
import { link } from "../../shared/links";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const emailLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: (ctx) => {
          setError("");
          // show loading
        },
        onSuccess: (ctx) => {
          // redirect to the dashboard or sign in page
          window.location.href = link("/upload");
        },
        onError: (ctx) => {
          // display the error message
          setError(ctx.error.message);
        },
      }
    );
  };

  const handleLogin = () => {
    startTransition(() => void emailLogin());
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Signing In..." : "Sign In"}
            </Button>

            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/user/register"
                className="text-blue-600 hover:underline"
              >
                Sign up here
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
