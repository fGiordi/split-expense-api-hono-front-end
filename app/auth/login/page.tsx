"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Prevent default form submission
    setError("");
    // Clear previous errors

    console.log("Form submitted with:", { email, password }); // Debug log
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}users/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Login response:", response.data.token); // Debug log
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-800 to-gray-900">
      <Card className="w-full max-w-md p-6 bg-white/5 backdrop-blur-xl border border-green-500/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-100 text-center">
            Welcome Back
          </CardTitle>
          <p className="text-center text-green-200/70 mt-2 mt-[200px]">
            Log in to track your expenses
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-100/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-green-500 focus:border-green-500"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-100/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold"
            >
              Log In
            </Button>
          </form>
          <p className="mt-4 text-center text-green-200/60">
            New here?{" "}
            <a href="/auth/register" className="text-green-300 hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
