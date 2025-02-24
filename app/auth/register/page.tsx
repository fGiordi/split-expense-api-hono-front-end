"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log("Form submitted with:", { username, email, password });
    try {
      const response = await axios.post(
        `${process.env.BACKEND}/users`,
        { username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Register response:", response.data);
      if (response.data.token) {
        document.cookie = `token=${response.data.token}; path=/`; // Set token cookie
      }
      router.push("/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      console.error("Register error:", err);
      setError((err as any).response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-800 to-gray-900 p-4">
      <Card className="w-full max-w-md p-6 bg-white/5 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-green-100 text-center">
            Get Started
          </CardTitle>
          <p className="text-center text-green-200/70">
            Create an account to track your expenses
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-green-100/80 text-sm font-medium"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                placeholder="johndoe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-green-100/80 text-sm font-medium"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-green-100/80 text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 rounded-md"
            >
              Sign Up
            </Button>
          </form>
          <p className="mt-4 text-center text-green-200/60 text-sm">
            Already have an account?{" "}
            <a href="/auth/login" className="text-green-300 hover:underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
