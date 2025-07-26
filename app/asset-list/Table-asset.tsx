"use client";

import { LocateFixed, CheckCircle, XCircle, Clock, Wrench } from "lucide-react";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CustomPagination } from "@/components/Pagination";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TableComponentAsset() {
  const [search, setSearch] = useState("");
  const [Asset, setAsset] = useState<items[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const router = useRouter();
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

  const totalPages = Math.ceil(filteredAsset.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAsset.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getItems = async () => {
    const res = await fetch("/api/items-asset", { method: "GET" });
    const result = await res.json();
    if (res.ok) setAsset(result.data);
  };

  useEffect(() => {
    getItems();
  }, []);

  const hanldeDetailClick = async (id: string) => {
    const res = await fetch(`/api/get-orderid?id=${id}`);
    const result = await res.json();
    if (res.ok) {
      router.push(`/borrow-items/${result}`);
    } else console.error(result.message);
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
            className="w-full sm:max-w-md"
            placeholder="🔍 ค้นหาอุปกรณ์"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm hidden md:block dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-blue-600 text-white dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Asset No.</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Nickname</th>
              <th className="p-3 text-center hidden md:table-cell">Image</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800">
            {paginatedData.map((record, index) => {
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

                    record.destroyed === true && "bg-red-100 dark:bg-red-900"
                  )}
                >
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
            </div>
          );
        })}
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
