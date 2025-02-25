"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type Expense = {
  createdAt: string | number | Date;
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Utility function to get cookie by name
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = getCookie("token"); // Retrieve token from cookie
      if (!token) {
        setError("No authentication token found");
        router.push("/auth/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add token to Authorization header
            },
          }
        );
        setExpenses(response.data);
      } catch (err: any) {
        console.error("Fetch expenses error:", err);
        setError("Failed to load expenses");
        toast.error("Failed to load expenses");

        if (err.response?.status === 401) {
          router.push("/auth/login"); // Redirect if unauthorized
        }
      }
    };
    fetchExpenses();
  }, [router]);

  // Handle adding a new expense
  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const token = getCookie("token"); // Retrieve token from cookie
    if (!token) {
      setError("No authentication token found");
      router.push("/auth/login");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}expenses`,
        { amount: parseFloat(amount), description, category },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token to Authorization header
          },
        }
      );
      setExpenses([...expenses, response.data]);
      toast.success("Expenses added successfully");

      setAmount("");
      setDescription("");
      setCategory("");
    } catch (err: any) {
      console.error("Add expense error:", err);
      setError(err.response?.data?.message || "Failed to add expense");
    }
  };

  // Handle logout
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Clear token cookie
    router.push("/auth/login");
  };

  // Calculate total expenses
  const totalExpenses = expenses
    .reduce((sum, expense) => sum + expense.amount, 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-100 tracking-tight">
            Dashboard
          </h1>
          <Button
            onClick={handleLogout}
            className="bg-red-500/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md backdrop-blur-sm"
          >
            Log Out
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-100">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-300">
              R{totalExpenses}
            </p>
            <p className="text-green-200/70 text-sm mt-1">
              {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}{" "}
              recorded
            </p>
          </CardContent>
        </Card>

        {/* Add Expense Form */}
        <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-100">
              Add New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="amount"
                    className="text-green-100/80 text-sm font-medium"
                  >
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-green-100/80 text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                    placeholder="e.g., Coffee"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-green-100/80 text-sm font-medium"
                  >
                    Category
                  </Label>
                  <Input
                    id="category"
                    type="text"
                    value={category}
                    disabled={true}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                    placeholder="e.g., Food"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 rounded-md shadow-md"
              >
                Add Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card className="bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-100">
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-green-200/70 text-center py-4">
                No expenses yet. Add one above!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-green-500/20">
                    <TableHead className="text-green-100/80">Date</TableHead>
                    <TableHead className="text-green-100/80">
                      Description
                    </TableHead>
                    <TableHead className="text-green-100/80">
                      Category
                    </TableHead>
                    <TableHead className="text-green-100/80 text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense, index) => (
                    <TableRow
                      key={index}
                      className="border-b border-green-500/10 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="text-green-100">
                        {new Date(expense.createdAt).toDateString()}
                      </TableCell>
                      <TableCell className="text-green-100">
                        {expense.description}
                      </TableCell>
                      <TableCell className="text-green-100">
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-green-100 text-right">
                        R{expense.amount?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
