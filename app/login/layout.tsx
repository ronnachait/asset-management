import { Toaster } from "sonner";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <Toaster richColors position="top-right" />
      {children}
    </section>
  );
}
