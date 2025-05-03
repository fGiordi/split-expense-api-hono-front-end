// pages/dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import ExpenseForm from "./ExpenseForm";
import ExpensesTable from "./ExpensesTable";
import Header from "./Header";
import TotalExpensesCard from "./TotalExpensesCard";
// import CategorySummary from "./CategorySummary";
import Groups from "./Groups";
import { Expense } from "@/types";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger for re-fetching
  const router = useRouter();

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = getCookie("token");
      if (!token) {
        toast.error("No authentication token found");
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
        setExpenses(fetchedExpenses);
        setFilteredExpenses(fetchedExpenses);
      } catch (err) {
        console.error("Fetch expenses error:", err);
        toast.error("Failed to load expenses");
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/auth/login");
        }
      } finally {
        setIsLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [router, refreshTrigger]); // Add refreshTrigger to dependencies

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <Header />
        <TotalExpensesCard
          expenses={expenses}
          filteredExpenses={filteredExpenses}
        />
        {/* <CategorySummary refreshTrigger={refreshTrigger} /> */}
        <Groups />
        <ExpenseForm
          expenses={expenses}
          setExpenses={setExpenses}
          editingExpenseId={editingExpenseId}
          setEditingExpenseId={setEditingExpenseId}
          editingExpense={editingExpense}
          triggerRefresh={triggerRefresh} // Pass the refresh function
        />
        <ExpensesTable
          expenses={expenses}
          filteredExpenses={filteredExpenses}
          setFilteredExpenses={setFilteredExpenses}
          setExpenses={setExpenses}
          setEditingExpenseId={setEditingExpenseId}
          editingExpenseId={editingExpenseId}
          setEditingExpense={setEditingExpense}
          isLoadingExpenses={isLoadingExpenses}
          triggerRefresh={triggerRefresh} // Pass the refresh function
        />
      </div>
    </div>
  );
}
