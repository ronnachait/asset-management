// components/email-template.tsx
type EmailTemplateProps = {
  firstName: string;
  borrowerName: string;
  borrowDate: string;
  dueDate: string;
  items: {
    assetName: string;
    assetCode: string;
  }[];
};

export const EmailTemplate = ({
  firstName,
  borrowerName,
  borrowDate,
  dueDate,
  items,
}: EmailTemplateProps) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#333",
      }}
    >
      <h2>เรียนคุณ {firstName}</h2>
      <p>
        มีรายการ <strong>การยืมอุปกรณ์</strong> เกิดขึ้นในระบบ AMIS
        โดยมีรายละเอียดดังนี้:
      </p>

      <table
        style={{
          marginTop: "16px",
          borderCollapse: "collapse",
          width: "100%",
          border: "1px solid #ccc",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ลำดับ</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              ชื่ออุปกรณ์
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>รหัส</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                {idx + 1}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {item.assetName}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {item.assetCode}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "16px" }}>
        <strong>ผู้ยืม:</strong> {borrowerName}
        <br />
        <strong>วันที่ยืม:</strong> {borrowDate}
        <br />
        <strong>กำหนดคืน:</strong> {dueDate}
      </p>

      <p style={{ marginTop: "16px" }}>
        หากคุณไม่ได้เป็นผู้ดำเนินการ กรุณาแจ้งผู้ดูแลระบบทันที
      </p>

      <p style={{ marginTop: "24px", fontSize: "13px", color: "#888" }}>
        ขอบคุณ
        <br />
        ระบบ AMIS
      </p>
    </div>
  );
};
