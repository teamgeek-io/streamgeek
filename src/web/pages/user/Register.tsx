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

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emailRegister = async () => {
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        // callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: (ctx) => {
          setError("");
          setSuccess("");
          // show loading
        },
        onSuccess: (ctx) => {
          window.location.href = link("/upload");
        },
        onError: (ctx) => {
          // display the error message
          setError(ctx.error.message);
        },
      }
    );
  };

  const handleRegister = () => {
    startTransition(() => void emailRegister());
  };

  return (
    <>
      <title>Register - StreamGeek</title>
      <meta name="description" content="Register to StreamGeek" />
      <div className="flex flex-col gap-4 max-w-md mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

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

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>

              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm text-center p-2 bg-green-50 rounded">
                  {success}
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/user/login" className="text-blue-600 hover:underline">
                  Sign in here
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
