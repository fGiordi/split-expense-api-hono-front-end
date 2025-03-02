"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Simple spinner component (consistent with login and dashboard)
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for registration
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

    console.log("Form submitted with:", { username, email, password });
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/users`,
        { username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.token) {
        document.cookie = `token=${response.data.token}; path=/; max-age=604800`; // Expires in 7 days
        toast.success("Registered successfully");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Registration failed");
      setError("Registration failed");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="p-6 bg-white/5 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
          <CardHeader className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle className="text-3xl font-bold text-green-100 text-center">
                Get Started
              </CardTitle>
              <p className="text-center text-green-200/70">
                Create an account to track your expenses
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-2"
              >
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
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
              </motion.div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 rounded-md disabled:opacity-50"
                >
                  {isLoading ? <Spinner /> : "Sign Up"}
                </Button>
              </motion.div>
            </form>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-4 text-center text-green-200/60 text-sm"
            >
              Already have an account?{" "}
              <a href="/auth/login" className="text-green-300 hover:underline">
                Log in
              </a>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
