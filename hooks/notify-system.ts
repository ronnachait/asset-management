// hooks/useNotify.ts
export type Order = {
  borrower: string;
  email: string;
  phone: string;
  team: string;
  borrowed_at: string;
  returned_at: string;
  items_count: number;
  status: string;
  note: string;
  updated_at: string;
};

export function useNotify() {
  const notify = async (order: Order) => {
    await fetch("/api/notifys/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
  };

  return { notify };
}
