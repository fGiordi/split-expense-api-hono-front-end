// components/dashboard/CategorySummary.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Spinner } from "../components/ui/Spinner";

type CategorySummary = {
  name: string;
  value: number;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

const COLORS = ["#3df", "#2DD4BF", "#000", "#FBBF24", "#F87171"];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a3c34] border border-[#34D399] p-2 rounded text-white">
        <p>{`${payload[0].name}: R${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

type CategorySummaryProps = {
  refreshTrigger: number; // Add refreshTrigger prop
};

export default function CategorySummary({
  refreshTrigger,
}: CategorySummaryProps) {
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorySummary = async () => {
    const token = getCookie("token");
    if (!token) {
      toast.error("No authentication token found");
      setError("No authentication token found");
      return;
    }

    try {
      setIsLoadingSummary(true);
      setError(null);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}expenses/summary`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = response.data.map(
        (item: { category: string; total: number }) => ({
          name: item.category,
          value: item.total,
        })
      );
      setCategorySummary(formattedData);
    } catch (err) {
      console.error("Fetch summary error:", err);
      setError("Failed to load category summary");
      toast.error("Failed to load category summary");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchCategorySummary();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-green-500/20 shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-100">
            Category Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSummary ? (
            <Spinner />
          ) : error ? (
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <Button
                onClick={fetchCategorySummary}
                className="mt-2 bg-green-500/80 hover:bg-green-600 text-white"
              >
                Retry
              </Button>
            </div>
          ) : categorySummary.length === 0 ? (
            <p className="text-green-200/70 text-center">
              No expenses to summarize yet.
            </p>
          ) : (
            <div className="max-w-md mx-auto">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySummary}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {categorySummary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      color: "white",
                      fontSize: "14px",
                      paddingTop: "10px",
                    }}
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
