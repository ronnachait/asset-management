import QRCode from "qrcode";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function GenerateQR({
  itemId,
  itemwidth = 150,
  itemheight = 150,
  Onsuccess,
}: {
  itemId: string;
  itemwidth?: number;
  itemheight?: number;
  Onsuccess: (id: string, qrDataUrl: string) => void;
}) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/borrow/item/${itemId}`;
    QRCode.toDataURL(url).then((dataUrl) => {
      setQrUrl(dataUrl);
      if (Onsuccess) Onsuccess(itemId, dataUrl);
    });
  }, [itemId, Onsuccess]);

  return qrUrl ? (
    <Image src={qrUrl} width={itemwidth} height={itemheight} alt="QR Code" />
  ) : (
    <p>Loading...</p>
  );
}
