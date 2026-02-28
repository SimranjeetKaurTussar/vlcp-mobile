export type AppProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  seller: string;
  category: string;
  images: string[];
};

export const categories = [
  { id: "1", name: "Vegetables" },
  { id: "2", name: "Fruits" },
  { id: "3", name: "Milk" },
  { id: "4", name: "Ghee" },
  { id: "5", name: "Pickles" },
  { id: "6", name: "Handmade" },
];

export let products: AppProduct[] = [];

export function setProducts(nextProducts: AppProduct[]) {
  products = nextProducts;
}

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
