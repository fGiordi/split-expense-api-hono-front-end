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
import { motion } from "framer-motion";
import { categoryOptions } from "@/types";

// Simple spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Small spinner for delete/edit buttons
const SmallSpinner = () => (
  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
);

type Expense = {
  createdAt: string | number | Date;
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};

// Extract main category names

// Utility function to get cookie by name
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [error, setError] = useState("");
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = getCookie("token");
      if (!token) {
        setError("No authentication token found");
        router.push("/auth/login");
        return;
      }

      try {
        setIsLoadingExpenses(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenses(response.data);
      } catch (err) {
        console.error("Fetch expenses error:", err);
        setError("Failed to load expenses");
        toast.error("Failed to load expenses");
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/auth/login");
        }
      } finally {
        setIsLoadingExpenses(false);
      }
    };
    fetchExpenses();
  }, [router]);

  const handleAddOrEditExpense = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    const token = getCookie("token");
    if (!token) {
      setError("No authentication token found");
      router.push("/auth/login");
      return;
    }

    const combinedCategory = subCategory
      ? `${mainCategory} - ${subCategory}`
      : mainCategory;

    try {
      setIsAddingExpense(true);
      if (editingExpenseId) {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses/${editingExpenseId}`,
          {
            amount: parseFloat(amount),
            description,
            category: combinedCategory,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenses(
          expenses.map((exp) =>
            exp.id === editingExpenseId ? response.data.expense : exp
          )
        );
        toast.success("Expense updated successfully");
        setEditingExpenseId(null);
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses`,
          {
            amount: parseFloat(amount),
            description,
            category: combinedCategory,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenses([...expenses, response.data.expense]);
        toast.success("Expense added successfully");
      }
      setAmount("");
      setDescription("");
      setMainCategory("");
      setSubCategory("");
    } catch (err: unknown) {
      console.error("Expense error:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || "Failed to process expense");
        toast.error(err.response.data?.message || "Failed to process expense");
      } else {
        setError("Failed to process expense");
        toast.error("Failed to process expense");
      }
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const token = getCookie("token");
    if (!token) {
      setError("No authentication token found");
      router.push("/auth/login");
      return;
    }

    try {
      setDeletingExpenseId(id);
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND}expenses/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(expenses.filter((expense) => expense.id !== id));
      toast.success("Expense deleted successfully");
    } catch (err) {
      console.error("Delete expense error:", err);
      toast.error("Failed to delete expense");
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    const [mainCat, subCat] = expense.category.split(" - ");
    setMainCategory(mainCat);
    setSubCategory(subCat || "");
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setAmount("");
    setDescription("");
    setMainCategory("");
    setSubCategory("");
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/login");
  };

  const totalExpenses = expenses
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-green-100 tracking-tight">
            Dashboard
          </h1>
          <Button
            onClick={handleLogout}
            className="bg-red-500/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md backdrop-blur-sm"
          >
            Log Out
          </Button>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
                {expenses.length}{" "}
                {expenses.length === 1 ? "expense" : "expenses"} recorded
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add/Edit Expense Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-green-100">
                {editingExpenseId ? "Edit Expense" : "Add New Expense"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOrEditExpense} className="space-y-6">
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
                      htmlFor="mainCategory"
                      className="text-green-100/80 text-sm font-medium"
                    >
                      Category
                    </Label>
                    <select
                      id="mainCategory"
                      value={mainCategory}
                      onChange={(e) => {
                        setMainCategory(e.target.value);
                        setSubCategory(""); // Reset subcategory when main category changes
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 border-green-500/30 text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                      required
                    >
                      <option
                        className="bg-gradient-to-r from-green-500 to-teal-500 "
                        value=""
                        disabled
                      >
                        Select a category
                      </option>
                      {categoryOptions.map((cat) => (
                        <option
                          className="bg-gradient-to-r from-green-500 to-teal-500 "
                          key={cat}
                          value={cat}
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isAddingExpense}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 rounded-md shadow-md disabled:opacity-50"
                  >
                    {isAddingExpense ? (
                      <Spinner />
                    ) : editingExpenseId ? (
                      "Update Expense"
                    ) : (
                      "Add Expense"
                    )}
                  </Button>
                  {editingExpenseId && (
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-md shadow-md"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-green-100">
                Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingExpenses ? (
                <Spinner />
              ) : expenses.length === 0 ? (
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
                      <TableHead className="text-green-100/80 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
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
                        <TableCell className="text-right space-x-2">
                          <Button
                            onClick={() => handleEditExpense(expense)}
                            disabled={deletingExpenseId === expense.id}
                            className="bg-yellow-500/80 hover:bg-yellow-600 text-white py-1 px-2 rounded-md text-sm disabled:opacity-50"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteExpense(expense.id)}
                            disabled={deletingExpenseId === expense.id}
                            className="bg-red-500/80 hover:bg-red-600 text-white py-1 px-2 rounded-md text-sm disabled:opacity-50"
                          >
                            {deletingExpenseId === expense.id ? (
                              <SmallSpinner />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
