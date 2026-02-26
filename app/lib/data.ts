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
  },
  {
    id: "p2",
    name: "Organic Wheat Flour (5 kg)",
    price: 320,
    unit: "bag",
    seller: "Kisan Group",
    category: "Handmade",
  },
  {
    id: "p3",
    name: "Fresh Tomatoes (1 kg)",
    price: 45,
    unit: "kg",
    seller: "Farm Fresh",
    category: "Vegetables",
  },
  {
    id: "p4",
    name: "Homemade Mango Pickle (500g)",
    price: 180,
    unit: "jar",
    seller: "Home Kitchen",
    category: "Pickles",
  },
];

export const sellerProfiles: Record<string, { village: string; phone: string }> = {
  "Village Dairy": { village: "Rampur", phone: "919812340001" },
  "Kisan Group": { village: "Shivpura", phone: "919812340002" },
  "Farm Fresh": { village: "Devgaon", phone: "919812340003" },
  "Home Kitchen": { village: "Lakshmipur", phone: "919812340004" },
};
