// components/dashboard/ExpenseForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { categoryOptions, Expense, Group } from "@/types";
import { DatePicker } from "@/components/ui/datePicker";

type ExpenseFormProps = {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  editingExpenseId: string | null;
  setEditingExpenseId: React.Dispatch<React.SetStateAction<string | null>>;
  editingExpense: Expense | null;
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

export default function ExpenseForm({
  expenses,
  setExpenses,
  editingExpenseId,
  setEditingExpenseId,
  editingExpense,
  triggerRefresh,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    undefined
  );

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

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description);
      setDate(editingExpense.date ? new Date(editingExpense.date) : undefined);
      const [mainCat, subCat] = editingExpense.category.split(" - ");
      setMainCategory(mainCat);
      setSubCategory(subCat || "");
      setTags(editingExpense.tags || []);
      setSelectedGroupId(Number(editingExpense.groupId));
    } else {
      setAmount("");
      setDescription("");
      setMainCategory("");
      setSubCategory("");
      setDate(new Date());
      setTags([]);
      setTagInput("");
      setSelectedGroupId(undefined);
    }
  }, [editingExpense]);

  const handleAddOrEditExpense = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    const token = getCookie("token");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    const combinedCategory = subCategory
      ? `${mainCategory} - ${subCategory}`
      : mainCategory;

    try {
      setIsAddingExpense(true);
      const formattedDate = date
        ? date.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const expenseData = {
        amount: parseFloat(amount),
        description,
        category: combinedCategory,
        date: formattedDate,
        tags: tags.map((tag) => tag.toLowerCase()),
        groupId: selectedGroupId,
      };

      if (editingExpenseId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses/${editingExpenseId}`,
          expenseData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Expense updated successfully");
        setEditingExpenseId(null);
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND}expenses`,
          expenseData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Expense added successfully");
      }
      setAmount("");
      setDescription("");
      setMainCategory("");
      setSubCategory("");
      setDate(undefined);
      setTags([]);
      setTagInput("");
      setSelectedGroupId(undefined);
      triggerRefresh();
    } catch (err) {
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

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
  };

  return (
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
                  onChange={(e) => setMainCategory(e.target.value)}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 border-green-500/30 text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categoryOptions.map((cat, index) => (
                    <option key={index} value={cat}>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="group"
                  className="text-green-100/80 text-sm font-medium"
                >
                  Group (Optional)
                </Label>
                <select
                  id="group"
                  value={selectedGroupId || ""}
                  onChange={(e) =>
                    setSelectedGroupId(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full bg-white/5 border-green-500/30 text-green-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                >
                  <option value="">No Group</option>
                  {groups.map((item, index) => (
                    <option key={item.group.id} value={item.group.id}>
                      {item.group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
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
  );
}
