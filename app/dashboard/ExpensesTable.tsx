// components/dashboard/ExpensesTable.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";

type Expense = {
  createdAt: string | number | Date;
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  tags: string[];
};

type ExpensesTableProps = {
  expenses: Expense[];
  filteredExpenses: Expense[];
  setFilteredExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setEditingExpense: React.Dispatch<React.SetStateAction<Expense | null>>; // Updated prop
  editingExpenseId: string | null;
  setEditingExpenseId: React.Dispatch<React.SetStateAction<string | null>>;
  isLoadingExpenses: boolean;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

const Spinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const SmallSpinner = () => (
  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
);

export default function ExpensesTable({
  expenses,
  filteredExpenses,
  setFilteredExpenses,
  setExpenses,
  setEditingExpense, // Updated prop
  setEditingExpenseId,
  editingExpenseId,
  isLoadingExpenses,
}: ExpensesTableProps) {
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<keyof Expense | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const allTags = Array.from(
    new Set(expenses.flatMap((expense) => expense.tags || []))
  );

  const handleSort = (key: keyof Expense) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (key === "date" || key === "createdAt") {
        valueA = new Date(a[key] || a.createdAt).getTime();
        valueB = new Date(b[key] || b.createdAt).getTime();
      } else if (key === "amount") {
        valueA = a.amount;
        valueB = b.amount;
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredExpenses(sortedExpenses);
  };

  const handleDeleteExpense = async (id: string) => {
    const token = getCookie("token");
    if (!token) {
      toast.error("No authentication token found");
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
      setFilteredExpenses(
        filteredExpenses.filter((expense) => expense.id !== id)
      );
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
    setEditingExpense(expense); // Pass the expense to the parent
  };

  return (
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                const filtered = expenses.filter(
                  (expense) =>
                    expense.description
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase()) ||
                    expense.category
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase())
                );
                setFilteredExpenses(filtered);
              }}
              className="bg-white/5 border-green-500/30 text-green-100 placeholder:text-green-100/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2 w-full sm:w-64"
            />
            <select
              value={filterTag}
              onChange={(e) => {
                setFilterTag(e.target.value);
                const filtered = expenses.filter((expense) =>
                  e.target.value
                    ? expense.tags.includes(e.target.value.toLowerCase())
                    : true
                );
                setFilteredExpenses(filtered);
              }}
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
                  <TableHead className="text-green-100/80">Category</TableHead>
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
  );
}
