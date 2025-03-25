// components/dashboard/TotalExpensesCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Expense = {
  createdAt: string | number | Date;
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  tags: string[];
};

type TotalExpensesCardProps = {
  expenses: Expense[];
  filteredExpenses: Expense[];
};

export default function TotalExpensesCard({
  expenses,
  filteredExpenses,
}: TotalExpensesCardProps) {
  const totalExpenses = expenses
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
    .toFixed(2);

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
          <p className="text-3xl font-bold text-green-300">R{totalExpenses}</p>
          <p className="text-green-200/70 text-sm mt-1">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1 ? "expense" : "expenses"} recorded
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
