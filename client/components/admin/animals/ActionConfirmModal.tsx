"use client";

interface ActionConfirmModalProps {
  isOpen: boolean;
  type: "update" | "delete";
  title: string;
  animalName: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionConfirmModal({
  isOpen,
  type,
  title,
  animalName,
  message,
  onConfirm,
  onCancel,
}: ActionConfirmModalProps) {
  if (!isOpen) return null;

  const isDelete = type === "delete";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
        
        {/* แถบ Header ด้านบนตามแบบในภาพ */}
        <div
          className={`px-6 py-4 flex items-center gap-3 text-white ${
            isDelete ? "bg-red-500" : "bg-primary"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <i className={`fa-solid ${isDelete ? "fa-triangle-exclamation" : "fa-circle-check"} text-base`}></i>
          </div>
          <h3 className="font-mali font-semibold text-lg">{title}</h3>
        </div>

        {/* เนื้อหาข้อความ */}
        <div className="p-6">
          <p className="text-xs text-gray-400 font-semibold mb-1">เป้าหมายที่ดำเนินการ:</p>
          <p className="text-base font-semibold text-textMain mb-3 flex items-center gap-2">
            <i className="fa-solid fa-paw text-primary text-xs"></i>
            {animalName || "ไม่ระบุชื่อ"}
          </p>

          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            {message}
          </p>

          {/* ปุ่มกดยกเลิกและยืนยันด้านล่างขวา */}
          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-xs font-mali font-medium text-gray-500 hover:text-gray-800 transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-6 py-2 rounded-xl text-xs font-mali font-semibold text-white shadow-sm transition ${
                isDelete
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-primary hover:bg-primaryHover"
              }`}
            >
              {isDelete ? "ยืนยันการลบ" : "ยืนยันการบันทึก"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}