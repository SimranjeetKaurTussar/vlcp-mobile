export const categories = [
  { id: "1", name: "Vegetables" },
  { id: "2", name: "Fruits" },
  { id: "3", name: "Milk" },
  { id: "4", name: "Ghee" },
  { id: "5", name: "Pickles" },
  { id: "6", name: "Handmade" },
];

export const products = [
  {
    id: "p1",
    name: "Desi Ghee (1 L)",
    price: 899,
    unit: "bottle",
    seller: "Village Dairy",
    category: "Ghee",
    images: [
      "https://images.unsplash.com/photo-1626203314748-8c5a6efb61b8?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=60",
    ],
  },
  {
    id: "p2",
    name: "Organic Wheat Flour (5 kg)",
    price: 320,
    unit: "bag",
    seller: "Kisan Group",
    category: "Handmade",
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=60",
    ],
  },
  {
    id: "p3",
    name: "Fresh Tomatoes (1 kg)",
    price: 45,
    unit: "kg",
    seller: "Farm Fresh",
    category: "Vegetables",
    images: [
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=60",
    ],
  },
  {
    id: "p4",
    name: "Homemade Mango Pickle (500g)",
    price: 180,
    unit: "jar",
    seller: "Home Kitchen",
    category: "Pickles",
    images: [
      "https://images.unsplash.com/photo-1604908812726-889d300e3b0d?auto=format&fit=crop&w=1200&q=60",
    ],
  },
];

export const productImagePlaceholder =
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=60";

export const sellerProfiles: Record<
  string,
  { village: string; phone: string; deliversTo: string[] }
> = {
  "Village Dairy": {
    village: "Rampur",
    phone: "919812340001",
    deliversTo: ["Rampur", "Devgaon"],
  },
  "Kisan Group": {
    village: "Shivpura",
    phone: "919812340002",
    deliversTo: ["Shivpura", "Lakshmipur"],
  },
  "Farm Fresh": {
    village: "Devgaon",
    phone: "919812340003",
    deliversTo: ["Devgaon", "Rampur"],
  },
  "Home Kitchen": {
    village: "Lakshmipur",
    phone: "919812340004",
    deliversTo: ["Lakshmipur"],
  },
};
