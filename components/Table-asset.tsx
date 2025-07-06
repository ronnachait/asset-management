"use client";

import {
  LocateFixed,
  QrCode,
  SquarePen,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
} from "lucide-react";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { CustomPagination } from "./Pagination";
import GenerateQR from "./GenerateQR";
import QrCodeModal from "./ModalQrcode";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";
import QrCodeModal2 from "./ModalQrcode-2";
import { Input } from "./ui/input";
import AddAssetModal from "./AddAssetModal";

type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_location: string;
  asset_image?: string;
  borrow_items?: {
    status: string;
    return_date: string | null;
  }[];
  current_status?: string; // ใช้สำหรับแสดงสถานะปัจจุบัน
};

type qrcode = {
  id: string;
  asset_number: string;
  asset_name: string;
};

export function TableComponent() {
  const [search, setSearch] = useState("");
  const [Asset, setAsset] = useState<items[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAsset = useMemo(() => {
    if (!search.trim()) return Asset;
    const keyword = search.toLowerCase();

    return Asset.filter((item) => {
      const assetNumber = item.asset_number?.toLowerCase?.() || "";
      const assetName = item.asset_name?.toLowerCase?.() || "";
      const assetLocation = item.asset_location?.toLowerCase?.() || "";

      return (
        assetNumber.includes(keyword) ||
        assetName.includes(keyword) ||
        assetLocation.includes(keyword)
      );
    });
  }, [Asset, search]);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredAsset.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAsset.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const [qrDataUrls, setQrDataUrls] = useState<{ [key: string]: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(
    null
  );
  const [qrcode, setQrcode] = useState<qrcode[]>([]);

  const getItems = async () => {
    const res = await fetch("/api/items-asset", { method: "GET" });
    const result = await res.json();
    if (res.ok) setAsset(result.data);
    else console.log(result.message);
  };

  useEffect(() => {
    getItems();
  }, []);

  const handleQRSuccess = useCallback((id: string, dataUrl: string) => {
    setQrDataUrls((prev) =>
      prev[id] === dataUrl ? prev : { ...prev, [id]: dataUrl }
    );
  }, []);

  const handleOpenModal = (asset_number: string, asset_name: string) => {
    setSelectedAsset(asset_number);
    setSelectedAssetName(asset_name);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAsset(null);
    setSelectedAssetName(null);
  };
  const handleOpenModal2 = () => {
    setModalOpen2(true);
  };

  const handleCloseModal2 = () => {
    setModalOpen2(false);
    setQrcode([]);
  };

  const isAllChecked = paginatedData.every((item) =>
    qrcode.some((q) => q.id === item.id)
  );

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setQrcode((prev) => {
        const existing = new Set(prev.map((q) => q.id));
        const newItems = paginatedData.filter((item) => !existing.has(item.id));
        return [
          ...prev,
          ...newItems.map(({ id, asset_number, asset_name }) => ({
            id,
            asset_number,
            asset_name,
          })),
        ];
      });
    } else {
      setQrcode((prev) =>
        prev.filter((q) => !paginatedData.some((item) => item.id === q.id))
      );
    }
  };

  useEffect(() => {
    console.log(qrcode);
  }, [qrcode]);

  return (
    <div className="max-w-7xl w-full mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 pb-4 gap-4">
        {/* แสดงจำนวนผลลัพธ์ */}
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">ผลลัพธ์:</span>{" "}
          {paginatedData.length} / {Asset.length} รายการ
        </div>

        {/* ช่องค้นหา + ปุ่มต่าง ๆ */}
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            className="max-w-xs w-full md:w-auto"
            placeholder="🔍 ค้นหาอุปกรณ์"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <AddAssetModal
            onAdd={(asset) => {
              console.log("เพิ่มอุปกรณ์ใหม่:", asset);
            }}
          />
          <Button
            onClick={handleOpenModal2}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <QrCode /> Generate QR Code
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full overflow-x-auto rounded-md shadow border border-gray-300 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">
                  <Checkbox
                    checked={isAllChecked}
                    onCheckedChange={toggleSelectAll}
                    className="data-[state=checked]:bg-green-600 border border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left uppercase font-semibold">
                  #
                </th>
                <th className="px-4 py-3 text-left uppercase font-semibold">
                  asset no.
                </th>
                <th className="px-4 py-3 text-left uppercase font-semibold">
                  asset name
                </th>
                <th className="px-4 py-3 text-center uppercase font-semibold">
                  QR Code
                </th>
                <th className="px-4 py-3 text-center uppercase font-semibold">
                  image
                </th>
                <th className="px-4 py-3 text-left uppercase font-semibold">
                  location
                </th>
                <th className="px-4 py-3 text-center uppercase font-semibold">
                  status
                </th>
                <th className="px-4 py-3 text-center uppercase font-semibold">
                  action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((record, index) => (
                <tr
                  key={record.id}
                  className={cn(
                    "hover:bg-blue-50 transition-colors",
                    qrcode.some((item) => item.id === record.id) &&
                      "bg-green-100"
                  )}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={qrcode.some((q) => q.id === record.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQrcode((prev) => [...prev, record]);
                        } else {
                          setQrcode((prev) =>
                            prev.filter((item) => item.id !== record.id)
                          );
                        }
                      }}
                      className="data-[state=checked]:bg-green-600 border border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {record.asset_number}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {record.asset_name}
                  </td>
                  <td className="relative group">
                    <GenerateQR
                      itemId={record.asset_number}
                      itemwidth={75}
                      itemheight={75}
                      Onsuccess={(itemId, dataUrl) =>
                        handleQRSuccess(itemId, dataUrl)
                      }
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(record.asset_number, record.asset_name);
                      }}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      ดู QR
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Image
                      src="/part1.jpg"
                      width={75}
                      height={75}
                      alt="image part"
                      className="rounded border"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-left">
                    {record.asset_location ? (
                      <span className="font-bold flex items-center gap-1">
                        <LocateFixed className="w-4 h-4" />
                        <span>{record.asset_location}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">ไม่พบข้อมูล</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const statusConfig = {
                        borrowed: {
                          text: "ยืมอยู่",
                          className: "bg-red-100 text-red-700",
                          Icon: XCircle,
                        },
                        repair: {
                          text: "กำลังซ่อม",
                          className: "bg-yellow-100 text-yellow-800",
                          Icon: Wrench,
                        },
                        waiting_calibase: {
                          text: "รอ Calibase",
                          className: "bg-orange-100 text-orange-800",
                          Icon: Clock,
                        },
                        available: {
                          text: "ว่าง",
                          className: "bg-green-100 text-green-700",
                          Icon: CheckCircle,
                        },
                      };
                      const status = record.current_status;
                      const config =
                        status && statusConfig[status as keyof typeof statusConfig]
                          ? statusConfig[status as keyof typeof statusConfig]
                          : null;

                      if (!config) {
                        return (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-500 text-xs font-semibold">
                            ไม่ทราบสถานะ
                          </span>
                        );
                      }

                      const Icon = config.Icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${config.className}`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.text}
                        </span>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        className="bg-amber-400 hover:bg-amber-600 cursor-pointer"
                        onClick={() => alert("Click")}
                      >
                        {" "}
                        <SquarePen /> Edit{" "}
                      </Button>
                      <Button className="bg-red-400 hover:bg-red-600 cursor-pointer">
                        {" "}
                        <Trash2 /> Delete{" "}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {selectedAsset && modalOpen && (
        <QrCodeModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          assetNumber={selectedAsset}
          assetName={selectedAssetName ?? ""}
          qrDataUrl={qrDataUrls[selectedAsset]}
        />
      )}

      {qrcode && modalOpen2 && (
        <QrCodeModal2
          isOpen={modalOpen2}
          onClose={handleCloseModal2}
          qrItems={qrcode.map((item) => ({
            qrDataUrl: qrDataUrls[item.asset_number] || "",
            assetNumber: item.asset_number,
            assetName: item.asset_name,
          }))}
        />
      )}
    </div>
  );
}
