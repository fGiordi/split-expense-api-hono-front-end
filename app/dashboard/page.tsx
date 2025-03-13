// pages/dashboard.tsx
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
import { DatePicker } from "@/components/ui/datePicker";

// Spinners
const Spinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
  tags: string[];
};

// type CategorySummary = {
//   category: string;
//   total: string;
// };

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  // const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  // const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof Expense | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(new Date());

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
        const fetchedExpenses = response.data;

        // Apply sorting
        if (sortBy) {
          fetchedExpenses.sort((a: Expense, b: Expense) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            if (sortBy === "date" || sortBy === "createdAt") {
              valueA = new Date(a[sortBy] || a.createdAt).getTime();
              valueB = new Date(b[sortBy] || b.createdAt).getTime();
            } else if (sortBy === "amount") {
              valueA = a.amount;
              valueB = b.amount;
            }

            if (sortOrder === "asc") {
              return valueA > valueB ? 1 : -1;
            } else {
              return valueA < valueB ? 1 : -1;
            }
          });
        }

        setExpenses(fetchedExpenses);
        setFilteredExpenses(fetchedExpenses);
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
  }, [router, sortBy, sortOrder]);

  // Filter expenses based on search term and tag
  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTag) {
      filtered = filtered.filter((expense) =>
        expense.tags.includes(filterTag.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
  }, [searchTerm, filterTag, expenses]);

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
      const formattedDate = date
        ? date.toISOString().split("T")[0] // Convert Date to YYYY-MM-DD
        : new Date().toISOString().split("T")[0]; // Default to today if no date selected

      if (editingExpenseId) {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses/${editingExpenseId}`,
          {
            amount: parseFloat(amount),
            description,
            category: combinedCategory,
            date: formattedDate,
            tags: tags.map((tag) => tag.toLowerCase()),
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
            date: formattedDate,
            tags: tags.map((tag) => tag.toLowerCase()),
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
      setDate(undefined); // Reset to undefined for DatePicker
      setTags([]);
      setTagInput("");
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
    setDate(expense.date ? new Date(expense.date) : undefined); // Convert string to Date for DatePicker
    const [mainCat, subCat] = expense.category.split(" - ");
    setMainCategory(mainCat);
    setSubCategory(subCat || "");
    setTags(expense.tags || []);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setAmount("");
    setDescription("");
    setMainCategory("");
    setSubCategory("");
    setDate(undefined); // Reset to undefined for DatePicker
    setTags([]);
    setTagInput("");
  };

  const handleSort = (key: keyof Expense) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/login");
  };

  const totalExpenses = expenses
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
    .toFixed(2);

  // Get all unique tags for filtering
  const allTags = Array.from(
    new Set(expenses.flatMap((expense) => expense.tags || []))
  );

  // Calculate the date range for the Total Expenses Card
  const getDateRange = (expenses: Expense[]) => {
    if (!expenses.length) return "All Time";

    const dates = expenses
      .map((exp) => new Date(exp.date || exp.createdAt))
      .filter((date) => !isNaN(date.getTime()));

    if (!dates.length) return "All Time";

    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

    if (
      earliest.getMonth() === latest.getMonth() &&
      earliest.getFullYear() === latest.getFullYear()
    ) {
      return `${earliest.toLocaleString("default", {
        month: "long",
      })} ${earliest.getFullYear()}`;
    }

    return `${earliest.toLocaleString("default", {
      month: "short",
    })} ${earliest.getFullYear()} - ${latest.toLocaleString("default", {
      month: "short",
    })} ${latest.getFullYear()}`;
  };

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

        {/* Total Expenses Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-green-100">
                Total Expenses for {getDateRange(filteredExpenses)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-300">
                R{totalExpenses}
              </p>
              <p className="text-green-200/70 text-sm mt-1">
                {filteredExpenses.length}{" "}
                {filteredExpenses.length === 1 ? "expense" : "expenses"}{" "}
                recorded
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
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 border-green-500/30 text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                      required
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 space-y-2 w-full space-x-10 ">
                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-green-100/80 text-sm font-medium block"
                    >
                      Date
                    </Label>
                    <DatePicker
                      date={date}
                      onSelect={setDate}
                      className="bg-teal-500 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor="tags"
                      className="text-green-100/80 text-sm font-medium"
                    >
                      Tags (Press Enter to Add)
                    </Label>
                    <Input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                      placeholder="e.g., urgent"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-green-500/80 text-white px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-red-300 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
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
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-semibold text-green-100">
                Recent Expenses
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2 w-full sm:w-64"
                />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="bg-white/5 border-green-500/30 text-green-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2 w-full sm:w-40"
                >
                  <option value="">Filter by Tag</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 flex-col md:flex-row">
                  <Button
                    onClick={() => handleSort("date")}
                    className={`bg-green-500/80 hover:bg-green-600 text-white py-1 px-2 rounded-md text-sm ${
                      sortBy === "date" ? "font-bold" : ""
                    }`}
                  >
                    Sort by Date{" "}
                    {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button
                    onClick={() => handleSort("amount")}
                    className={`bg-green-500/80 hover:bg-green-600 text-white py-1 px-2 rounded-md text-sm ${
                      sortBy === "amount" ? "font-bold" : ""
                    }`}
                  >
                    Sort by Amount{" "}
                    {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button
                    onClick={() => handleSort("category")}
                    className={`bg-green-500/80 hover:bg-green-600 text-white py-1 px-2 rounded-md text-sm ${
                      sortBy === "category" ? "font-bold" : ""
                    }`}
                  >
                    Sort by Category{" "}
                    {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingExpenses ? (
                <Spinner />
              ) : filteredExpenses.length === 0 ? (
                <p className="text-green-200/70 text-center py-4">
                  {searchTerm || filterTag
                    ? "No matching expenses found."
                    : "No expenses yet. Add one above!"}
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
                      <TableHead className="text-green-100/80">Tags</TableHead>
                      <TableHead className="text-green-100/80 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-green-100/80 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`border-b border-green-500/10 transition-colors ${
                          editingExpenseId === expense.id
                            ? "bg-green-500/20"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <TableCell className="text-green-100">
                          {new Date(
                            expense.date || expense.createdAt
                          ).toDateString()}
                        </TableCell>
                        <TableCell className="text-green-100">
                          <span
                            className="truncate block w-[200px]"
                            title={expense.description}
                          >
                            {expense.description.length > 20
                              ? `${expense.description.substring(0, 20)}...`
                              : expense.description}
                          </span>
                        </TableCell>
                        <TableCell className="text-green-100">
                          {expense.category}
                        </TableCell>
                        <TableCell className="text-green-100">
                          <div className="flex flex-wrap gap-1">
                            {(expense.tags || []).map((tag) => (
                              <span
                                key={tag}
                                className="bg-green-500/80 text-white px-2 py-1 rounded-md text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
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
