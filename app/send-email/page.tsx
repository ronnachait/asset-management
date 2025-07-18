"use client";

const SendToEmail = () => {
  // ตัวอย่างในปุ่มที่อยู่ใน React component
  const sendEmail = async () => {
    const res = await fetch("/api/send-email", {
      method: "POST", // หรือ GET ก็ได้ ถ้า API รองรับ
    });

    const result = await res.json();

    if (res.ok) {
      alert("ส่งอีเมลเรียบร้อยแล้ว");
    } else {
      alert("ส่งอีเมลล้มเหลว: " + result.message);
    }
  };

  return (
    <div>
      <button
        onClick={sendEmail}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        ส่งอีเมล
      </button>
    </div>
  );
};
export default SendToEmail;
