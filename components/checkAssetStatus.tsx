export async function checkAssetStatus(asset_id: string) {
  try {
    const res = await fetch(`/api/borrow/check?asset_id=${asset_id}`);
    const result = await res.json();

    if (res.ok) {
      return {
        status: result.status, // "available" หรือ "borrowed"
        borrow_date: result.borrow_date,
        return_due_date: result.return_due_date,
        message: result.message,
      };
    } else {
      return {
        status: "error",
        message: result.message || "ไม่สามารถตรวจสอบสถานะได้",
      };
    }
  } catch (err) {
    console.error("เช็คสถานะอุปกรณ์ไม่สำเร็จ:", err);
    return {
      status: "error",
      message: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้",
    };
  }
}

export async function checkAssetStatusByNumber(asset_number: string) {
  try {
    const res = await fetch(`/api/borrow/check?asset_number=${asset_number}`);
    const result = await res.json();

    if (res.ok) {
      return {
        status: result.status, // "available" หรือ "borrowed"
        borrow_date: result.borrow_date,
        return_due_date: result.return_due_date,
        message: result.message,
      };
    } else {
      return {
        status: "error",
        message: result.message || "ไม่สามารถตรวจสอบสถานะได้",
      };
    }
  } catch (err) {
    console.error("เช็คสถานะอุปกรณ์ไม่สำเร็จ:", err);
    return {
      status: "error",
      message: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้",
    };
  }
}