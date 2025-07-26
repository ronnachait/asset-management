export async function sendEmailAPI({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, html }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "ส่งอีเมลไม่สำเร็จ");
  }

  return data;
}
