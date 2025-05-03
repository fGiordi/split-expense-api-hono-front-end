// components/dashboard/ExpensesTable.tsx
import { useState, useEffect } from "react";
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
import { Expense, Group } from "@/types";

type ExpensesTableProps = {
  expenses: Expense[];
  filteredExpenses: Expense[];
  setFilteredExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setEditingExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
  setEditingExpenseId: React.Dispatch<React.SetStateAction<string | null>>;
  editingExpenseId: string | null;
  isLoadingExpenses: boolean;
  triggerRefresh: () => void;
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
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export default function ExpensesTable({
  expenses,
  filteredExpenses,
  setFilteredExpenses,
  // setExpenses,
  setEditingExpense,
  setEditingExpenseId,
  // editingExpenseId,
  isLoadingExpenses,
  triggerRefresh,
}: ExpensesTableProps) {
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );
  // const [sortBy, setSortBy] = useState<keyof Expense | "">("");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "">("");

  useEffect(() => {
    const fetchGroups = async () => {
      const token = getCookie("token");
      if (!token) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}groups`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGroups(response.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    fetchGroups();
  }, []);

  const allTags = Array.from(
    new Set(expenses.flatMap((expense) => expense.tags || []))
  );

  // const handleSort = (key: keyof Expense) => {
  //   if (sortBy === key) {
  //     setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortBy(key);
  //     setSortOrder("asc");
  //   }

  //   const sortedExpenses = [...filteredExpenses].sort((a, b) => {
  //     let valueA: any = a[key];
  //     let valueB: any = b[key];

  //     if (key === "date" || key === "createdAt") {
  //       valueA = new Date(a[key] || a.createdAt).getTime();
  //       valueB = new Date(b[key] || b.createdAt).getTime();
  //     } else if (key === "amount") {
  //       valueA = a.amount;
  //       valueB = b.amount;
  //     }

  //     if (valueA === undefined || valueB === undefined) {
  //       return 0;
  //     }

  //     if (sortOrder === "asc") {
  //       return valueA > valueB ? 1 : -1;
  //     } else {
  //       return valueA < valueB ? 1 : -1;
  //     }
  //   });

  //   setFilteredExpenses(sortedExpenses);
  // };

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
      toast.success("Expense deleted successfully");
      triggerRefresh();
    } catch (err) {
      console.error("Delete expense error:", err);
      toast.error("Failed to delete expense");
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditingExpense(expense);
  };

  // const getGroupName = (groupId?: number) => {
  //   if (!groupId) return "";
  //   const group = groups.find((g) => g.group.id === groupId);
  //   return group ? group.group.name : "";
  // };

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
              value={selectedGroup}
              onChange={(e) => {
                const groupId = e.target.value ? Number(e.target.value) : "";
                setSelectedGroup(groupId);
                const filtered = expenses.filter((expense) =>
                  groupId ? expense.groupId === String(groupId) : true
                );
                setFilteredExpenses(filtered);
              }}
              className="bg-white/5 border-green-500/30 text-green-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2 w-full sm:w-40"
            >
              <option value="">All Groups</option>
              {groups.map((group, index) => (
                <option key={index} value={group.group.id}>
                  {group.group.name}
                </option>
              ))}
            </select>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingExpenses ? (
            <Spinner />
          ) : filteredExpenses.length === 0 ? (
            <p className="text-green-200/70 text-center py-4">
              {searchTerm || filterTag || selectedGroup
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
                  <TableHead className="text-green-100/80">Group</TableHead>
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
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-green-500/10 hover:bg-green-500/5"
                  >
                    <TableCell className="text-green-100">
                      {new Date(
                        expense.date || expense.createdAt
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-green-100">
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-green-100">
                      {expense.category}
                    </TableCell>
                    <TableCell className="text-green-100">
                      {/* {getGroupName(expense.groupId)} */}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {expense.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="bg-green-500/20 text-green-100 px-2 py-0.5 rounded-full text-xs"
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
