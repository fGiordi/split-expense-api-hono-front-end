export enum Category {
  Food = "Food",
  Transportation = "Transportation",
  Utilities = "Utilities",
  Entertainment = "Entertainment",
  Shopping = "Shopping",
  Health = "Health",
  Travel = "Travel",
  Education = "Education",
  Miscellaneous = "Miscellaneous",
  Housing = "Housing",
  Insurance = "Insurance",
  PersonalCare = "PersonalCare",
  Subscriptions = "Subscriptions",
  GiftsAndDonations = "GiftsAndDonations",
  WorkRelated = "WorkRelated",
}

export const categoryOptions = Object.values(Category) as Category[];
// create type for groups

export interface Group {
  group: {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    // members: GroupMember[];
  };
  memberCount: number;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  groupId: string;
  paidBy: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  category: string;
  total: number;
}
