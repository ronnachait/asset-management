import BorrowDetailClient from "./BorrowDetailClient";

export default async function BorrowDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;


  return (
    <div>
      <BorrowDetailClient OrderId={id}/>
    </div>
  );
}
