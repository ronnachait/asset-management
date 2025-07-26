// hooks/useNotify.ts
type Status = "approve" | "reject";

type NotifyPayload = {
  status: Status;
  reason: string;
  borrower: string;
  updated_at: string;
};

export function useNotify() {
  const notify = async (req: NotifyPayload) => {
    await fetch("/api/notifys/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  };

  return { notify };
}
