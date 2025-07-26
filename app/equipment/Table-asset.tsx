"use client";

import {
  LocateFixed,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
} from "lucide-react";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/Pagination";
import GenerateQR from "@/components/GenerateQR";
import QrCodeModal from "@/components/ModalQrcode";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import QrCodeModal2 from "@/components/ModalQrcode-2";
import { Input } from "@/components/ui/input";
import AddAssetModal from "./AddAssetModal";
import { toast } from "sonner";
import EditAssetModal from "./Edit-AssetModal";
import Link from "next/link";
import DestroyDialog from "@/components/Dialog-destroy";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type items = {
  id: string;
  asset_number: string;
  asset_name: string;
  asset_nickname: string;
  asset_location: string;
  asset_image?: string;
  destroyed?: boolean;
  borrow_items?: {
    status: string;
    return_date: string | null;
  }[];
  current_status?: string;
};

type qrcode = {
  id: string;
  asset_number: string;
  asset_name: string;
};

export function TableComponent() {
  const [search, setSearch] = useState("");
  const [Asset, setAsset] = useState<items[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const filteredAsset = useMemo(() => {
    if (!search.trim()) return Asset;
    const keyword = search.toLowerCase();
    return Asset.filter((item) => {
      const assetNumber = item.asset_number?.toLowerCase?.() || "";
      const assetName = item.asset_name?.toLowerCase?.() || "";
      const assetNickname = item.asset_nickname?.toLowerCase?.() || "";
      const assetLocation = item.asset_location?.toLowerCase?.() || "";
      return (
        assetNumber.includes(keyword) ||
        assetName.includes(keyword) ||
        assetNickname.includes(keyword) ||
        assetLocation.includes(keyword)
      );
    });
  }, [Asset, search]);

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
    if (qrcode.length === 0) return toast.warning("กรุณาเลือก อุปกรณ์");
    setModalOpen2(true);
  };
  const handleCloseModal2 = () => {
    setModalOpen2(false);
    setQrcode([]);
  };

  const hanldeDetailClick = async (id: string) => {
    const res = await fetch(`/api/get-orderid?id=${id}`);
    const result = await res.json();
    if (res.ok) {
      router.push(`/borrow-items/${result}`);
    } else console.error(result.message);
  };

  const isAllChecked = paginatedData
    .filter((item) => item.destroyed !== true) // ✅ กรองออกก่อน
    .every((item) => qrcode.some((q) => q.id === item.id));

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const existing = new Set(qrcode.map((q) => q.id));
      const newItems = paginatedData.filter(
        (item) => !existing.has(item.id) && item.destroyed !== true
      );
      setQrcode([
        ...qrcode,
        ...newItems.map(({ id, asset_number, asset_name }) => ({
          id,
          asset_number,
          asset_name,
        })),
      ]);
    } else {
      setQrcode((prev) =>
        prev.filter((q) => !paginatedData.some((item) => item.id === q.id))
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            ผลลัพธ์:
          </span>{" "}
          {paginatedData.length} / {Asset.length} รายการ
          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="rowsPerPage" className="text-sm font-medium">
              จำนวนแถวต่อหน้า:
            </label>
            <Select
              value={String(itemsPerPage)} // แปลงกลับเป็น string เพื่อแสดงใน UI
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="เลือกจำนวนแถว" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center dark:text-gray-400">
          <Input
            className="w-full sm:max-w-xs"
            placeholder="🔍 ค้นหาอุปกรณ์"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <AddAssetModal onAdd={() => getItems()} />
          <Button
            onClick={handleOpenModal2}
            className="cursor-pointer hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <QrCode className="w-5 h-5" />
            <span className="text-sm font-medium">Generate QR</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm hidden md:block dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-blue-600 text-white dark:bg-gray-700">
            <tr>
              <th className="p-3">
                <Checkbox
                  checked={isAllChecked}
                  onCheckedChange={toggleSelectAll}
                  className="data-[state=checked]:bg-green-600 border border-gray-300 cursor-pointer "
                />
              </th>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Asset No.</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Nickname</th>
              <th className="p-3 text-center hidden md:table-cell">QR</th>
              <th className="p-3 text-center hidden md:table-cell">Image</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center hidden sm:table-cell">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800">
            {paginatedData.map((record, index) => {
              const selected = qrcode.some((item) => item.id === record.id);
              const status = record.current_status ?? "unknown";
              const isDestroyed = record.destroyed === true;
              const statusMap: Record<
                string,
                [string, string, React.ElementType]
              > = {
                borrowed: ["ยืมอยู่", "bg-red-100 text-red-700 ", XCircle],
                repair: ["กำลังซ่อม", "bg-yellow-100 text-yellow-800", Wrench],
                waiting_calibase: [
                  "รอ Calibase",
                  "bg-orange-100 text-orange-800",
                  Clock,
                ],
                available: ["ว่าง", "bg-green-100 text-green-700", CheckCircle],
              };
              const [text, className, Icon] = statusMap[status] ?? [
                "ไม่ทราบสถานะ",
                "bg-gray-100 text-gray-500",
                XCircle,
              ];

              return (
                <tr
                  key={record.id}
                  className={cn(
                    "hover:bg-blue-50 dark:hover:bg-gray-700",
                    selected && "bg-green-100",
                    record.destroyed === true && "bg-red-100 dark:bg-red-900"
                  )}
                >
                  <td className="p-3 text-center hidden md:table-cell">
                    <Checkbox
                      disabled={isDestroyed}
                      checked={selected}
                      onCheckedChange={(checked) => {
                        if (checked) setQrcode((prev) => [...prev, record]);
                        else
                          setQrcode((prev) =>
                            prev.filter((item) => item.id !== record.id)
                          );
                      }}
                      className="data-[state=checked]:bg-green-600 border border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td
                    className={`p-3  text-gray-900 dark:text-white ${
                      isDestroyed ? "line-through" : ""
                    }`}
                  >
                    {startIndex + index + 1}
                  </td>
                  <td
                    className={`p-3 font-medium text-gray-900 dark:text-white ${
                      isDestroyed ? "line-through" : ""
                    }`}
                  >
                    {record.asset_number}
                  </td>
                  <td
                    className={`p-3 text-gray-700 dark:text-white ${
                      isDestroyed ? "line-through" : ""
                    }`}
                  >
                    {record.asset_name}
                  </td>
                  <td
                    className={`p-3 text-gray-700 dark:text-white ${
                      isDestroyed ? "line-through" : ""
                    }`}
                  >
                    {record.asset_nickname ? record.asset_nickname : "-"}
                  </td>
                  <td className="relative group p-3 text-center dark:text-white">
                    <GenerateQR
                      itemId={record.asset_number}
                      itemwidth={75}
                      itemheight={75}
                      Onsuccess={handleQRSuccess}
                    />
                    <button
                      onClick={() =>
                        handleOpenModal(record.asset_number, record.asset_name)
                      }
                      className="dark:bg-blue-400 absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ดู QR
                    </button>
                  </td>
                  <td className="p-3 text-center hidden md:table-cell">
                    <div className="relative w-[75px] h-[75px] mx-auto">
                      {record.asset_image ? (
                        <Link
                          href={record.asset_image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={record.asset_image}
                            width={75}
                            height={75}
                            alt="asset"
                            className={cn(
                              "rounded-lg border border-gray-300 shadow-md mx-auto object-cover w-full h-full transition-transform",
                              record.destroyed === true &&
                                "opacity-60 grayscale"
                            )}
                          />
                        </Link>
                      ) : (
                        <Image
                          src="/part1.jpg"
                          width={75}
                          height={75}
                          alt="default asset"
                          className={cn(
                            "rounded-lg border border-gray-300 shadow-sm mx-auto object-cover w-full h-full",
                            record.destroyed === true && "opacity-60 grayscale"
                          )}
                        />
                      )}

                      {record.destroyed === true && (
                        <div className="absolute inset-0 bg-red-600/60 rounded-lg flex items-center justify-center text-white font-bold text-xs dark:text-gray-900 dark:bg-red-600/60">
                          ถูกทำลาย
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-gray-700 dark:text-white">
                    {record.asset_location ? (
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isDestroyed ? "line-through" : ""
                        }`}
                      >
                        <LocateFixed className="w-4 h-4" />{" "}
                        {record.asset_location}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-300">
                        ไม่พบข้อมูล
                      </span>
                    )}
                  </td>
                  {text === "ยืมอยู่" ? (
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm cursor-pointer ${
                          isDestroyed
                            ? "bg-red-600 text-white ring-2 ring-red-300 animate-pulse "
                            : className
                        }`}
                        onClick={() => hanldeDetailClick(record.id)}
                      >
                        {isDestroyed ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}

                        {isDestroyed ? "ถูกทำลาย" : text}
                      </span>
                    </td>
                  ) : (
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm ${
                          isDestroyed
                            ? "bg-red-600 text-white ring-2 ring-red-300 animate-pulse "
                            : className
                        }`}
                      >
                        {isDestroyed ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}

                        {isDestroyed ? "ถูกทำลาย" : text}
                      </span>
                    </td>
                  )}
                  <td className="p-3 text-center hidden sm:table-cell">
                    <div className="flex justify-center items-center gap-2">
                      <EditAssetModal data={record} onAdd={() => getItems()} />

                      <DestroyDialog
                        recordId={record.id}
                        onsubmit={() => getItems()}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
      {/* ✅ Card แสดงเฉพาะบนมือถือ */}
      <div className="block md:hidden space-y-4">
        {paginatedData.map((record) => {
          const selected = qrcode.some((item) => item.id === record.id);
          const status = record.current_status ?? "unknown";
          const isDestroyed = record.destroyed === true;

          const statusMap: Record<string, [string, string, React.ElementType]> =
            {
              borrowed: ["ยืมอยู่", "bg-red-100 text-red-700", XCircle],
              repair: ["กำลังซ่อม", "bg-yellow-100 text-yellow-800", Wrench],
              waiting_calibase: [
                "รอ Calibase",
                "bg-orange-100 text-orange-800",
                Clock,
              ],
              available: ["ว่าง", "bg-green-100 text-green-700", CheckCircle],
            };

          const [text, className, Icon] = statusMap[status] ?? [
            "ไม่ทราบสถานะ",
            "bg-gray-100 text-gray-500",
            XCircle,
          ];

          return (
            <div
              key={record.id}
              className={cn(
                "border border-gray-200 p-4 rounded-xl shadow-md bg-white relative space-y-3 overflow-hidden",
                isDestroyed && "bg-red-100 opacity-80"
              )}
            >
              {/* Checkbox Top Right */}
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => {
                  if (checked) setQrcode((prev) => [...prev, record]);
                  else
                    setQrcode((prev) =>
                      prev.filter((item) => item.id !== record.id)
                    );
                }}
                className="absolute top-3 right-3 data-[state=checked]:bg-green-600"
              />

              {/* Asset Name & Number */}
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {record.asset_name}
                </h2>
                <p className="text-sm text-gray-500">{record.asset_number}</p>
              </div>

              {/* Asset Image */}
              <div className="relative w-[75px] h-[75px] mx-auto">
                {record.asset_image ? (
                  <Link
                    href={record.asset_image}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={record.asset_image}
                      width={75}
                      height={75}
                      alt="asset"
                      className={cn(
                        "rounded-lg border border-gray-300 shadow-md mx-auto object-cover w-full h-full transition-transform",
                        record.destroyed === true && "opacity-60 grayscale"
                      )}
                    />
                  </Link>
                ) : (
                  <Image
                    src="/part1.jpg"
                    width={75}
                    height={75}
                    alt="default asset"
                    className={cn(
                      "rounded-lg border border-gray-300 shadow-sm mx-auto object-cover w-full h-full",
                      record.destroyed === true && "opacity-60 grayscale"
                    )}
                  />
                )}

                {record.destroyed === true && (
                  <div className="absolute inset-0 bg-red-600/60 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    ถูกทำลาย
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="text-sm text-gray-700">
                <span className="font-semibold flex items-center gap-1 uppercase">
                  <LocateFixed className="w-4 h-4 text-blue-500" />
                  {record.asset_location || "ไม่พบข้อมูล"}
                </span>
              </div>

              {/* Status */}
              <div className="text-sm">
                {text === "ยืมอยู่" ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
                      isDestroyed ? "bg-red-100 text-red-800" : className
                    }`}
                    onClick={() => hanldeDetailClick(record.id)}
                  >
                    {isDestroyed ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}

                    {isDestroyed ? "ถูกทำลาย" : text}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      isDestroyed ? "bg-red-100 text-red-800" : className
                    }`}
                  >
                    {isDestroyed ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}

                    {isDestroyed ? "ถูกทำลาย" : text}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <EditAssetModal data={record} onAdd={getItems} />
                <DestroyDialog recordId={record.id} onsubmit={getItems} />
                <Button
                  size="lg"
                  onClick={() =>
                    handleOpenModal(record.asset_number, record.asset_name)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
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

      {qrcode.length > 0 && modalOpen2 && (
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
