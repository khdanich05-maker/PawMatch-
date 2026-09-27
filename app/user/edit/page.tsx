
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusToast, { type ToastType, } from "@/components/ui/StatusToast";
import { THAI_PROVINCES } from "@/constants/provinces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

import type {
  User,
  UpdateProfilePayload,
  AddressDetails,
} from "@/types/user";

type ToastState = {
  type: ToastType;
  message: string;
  title?: string;
} | null;

const DEFAULT_ADDRESS_DETAILS: AddressDetails = {
  house_no: "",
  village: "",
  moo: "",
  soi: "",
  road: "",
  province: "",
  district: "",
  subdistrict: "",
  zipcode: "",
};

function normalizeAddressDetails(
  value?: AddressDetails | null
): AddressDetails {
  return {
    house_no: value?.house_no ?? "",
    village: value?.village ?? "",
    moo: value?.moo ?? "",
    soi: value?.soi ?? "",
    road: value?.road ?? "",
    province: value?.province ?? "",
    district: value?.district ?? "",
    subdistrict: value?.subdistrict ?? "",
    zipcode: value?.zipcode ?? "",
  };
}

function buildAddress(
  address: AddressDetails
): string {
  const parts: string[] = [];

  if (address.house_no.trim()) {
    parts.push(address.house_no.trim());
  }

  if (address.village.trim()) {
    parts.push(address.village.trim());
  }

  if (address.moo.trim()) {
    parts.push(`หมู่ ${address.moo.trim()}`);
  }

  if (address.soi.trim()) {
    parts.push(`ซอย${address.soi.trim()}`);
  }

  if (address.road.trim()) {
    parts.push(`ถนน${address.road.trim()}`);
  }

  const isBangkok =
    address.province === "กรุงเทพมหานคร";

  if (address.subdistrict.trim()) {
    parts.push(
      isBangkok
        ? `แขวง${address.subdistrict.trim()}`
        : `ตำบล${address.subdistrict.trim()}`
    );
  }

  if (address.district.trim()) {
    parts.push(
      isBangkok
        ? `เขต${address.district.trim()}`
        : `อำเภอ${address.district.trim()}`
    );
  }

  if (address.province.trim()) {
    parts.push(address.province.trim());
  }

  if (address.zipcode.trim()) {
    parts.push(address.zipcode.trim());
  }

  return parts.join(" ");
}

export default function EditProfilePage() {
  const router = useRouter();

  // --------------------------------------------------
  // Page state
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] =
    useState<ToastState>(null);

  // --------------------------------------------------
  // Profile state
  // --------------------------------------------------

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [salary, setSalary] =
    useState<number | "">("");

  const [accommodationType, setAccommodationType] =
    useState("");

  const [petPermission, setPetPermission] =
    useState(true);

  const [animalCount, setAnimalCount] =
    useState(0);

  const [residenceNote, setResidenceNote] =
    useState("");

  // --------------------------------------------------
  // Address state
  // --------------------------------------------------

  const [addressDetails, setAddressDetails] =
    useState<AddressDetails>(
      DEFAULT_ADDRESS_DETAILS
    );

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function showToast(
    type: ToastType,
    message: string,
    title?: string
  ) {
    setToast({
      type,
      message,
      title,
    });
  }

  function updateAddress(
    field: keyof AddressDetails,
    value: string
  ) {
    setAddressDetails((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyUserToForm(user: User) {
    setFullName(user.full_name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");

    setDateOfBirth(
      user.date_of_birth
        ? user.date_of_birth.slice(0, 10)
        : ""
    );

    setSalary(
      user.salary === null ||
        user.salary === undefined
        ? ""
        : user.salary
    );

    setAccommodationType(
      user.accommodation_type ?? ""
    );

    setPetPermission(
      user.pet_permission ?? true
    );

    setAnimalCount(
      user.animal_count ?? 0
    );

    setResidenceNote(
      user.residence_note ?? ""
    );

    setAddressDetails(
      normalizeAddressDetails(
        user.address_details
      )
    );
  }

  // --------------------------------------------------
  // Load current profile
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/user/profile",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          if (response.status === 401) {
            router.replace(
              "/login?next=/user/edit"
            );
            return;
          }

          showToast(
            "error",
            data.message ||
            "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
            "โหลดข้อมูลไม่สำเร็จ"
          );

          return;
        }

        if (!data.user) {
          showToast(
            "error",
            "ไม่พบข้อมูลผู้ใช้งาน",
            "ไม่พบข้อมูล"
          );

          return;
        }

        applyUserToForm(
          data.user as User
        );
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        if (!active) return;

        showToast(
          "error",
          "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          "โหลดข้อมูลไม่สำเร็จ"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    if (!fullName.trim()) {
      showToast(
        "error",
        "กรุณากรอกชื่อ-นามสกุล",
        "ข้อมูลไม่ครบถ้วน"
      );
      return;
    }

    if (!accommodationType) {
      showToast(
        "error",
        "กรุณาเลือกลักษณะที่พักอาศัย",
        "ข้อมูลไม่ครบถ้วน"
      );
      return;
    }

    if (!addressDetails.house_no.trim()) {
      showToast(
        "error",
        "กรุณากรอกบ้านเลขที่",
        "ข้อมูลที่อยู่ไม่ครบ"
      );
      return;
    }

    if (!addressDetails.province.trim()) {
      showToast(
        "error",
        "กรุณาเลือกจังหวัด",
        "ข้อมูลที่อยู่ไม่ครบ"
      );
      return;
    }

    if (!addressDetails.district.trim()) {
      showToast(
        "error",
        "กรุณากรอกอำเภอ / เขต",
        "ข้อมูลที่อยู่ไม่ครบ"
      );
      return;
    }

    if (!addressDetails.subdistrict.trim()) {
      showToast(
        "error",
        "กรุณากรอกตำบล / แขวง",
        "ข้อมูลที่อยู่ไม่ครบ"
      );
      return;
    }

    setSaving(true);

    const normalizedAddress =
      normalizeAddressDetails(
        addressDetails
      );

    const payload: UpdateProfilePayload = {
      full_name: fullName.trim(),

      date_of_birth: dateOfBirth,

      salary:
        salary === ""
          ? null
          : Number(salary),

      accommodation_type:
        accommodationType.trim(),

      pet_permission:
        petPermission,

      address:
        buildAddress(
          normalizedAddress
        ),

      province:
        normalizedAddress.province,

      address_details:
        normalizedAddress,

      animal_count:
        Number(animalCount) || 0,

      residence_note:
        residenceNote.trim(),
    };

    try {
      const response = await fetch(
        "/api/user/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "ไม่สามารถบันทึกข้อมูลได้"
        );
      }

      if (data.user) {
        applyUserToForm(
          data.user as User
        );
      }

      showToast(
        "success",
        "ข้อมูลส่วนตัวของคุณถูกบันทึกเรียบร้อยแล้ว",
        "บันทึกข้อมูลสำเร็จ"
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        "บันทึกข้อมูลไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FCFAF8] px-4 py-12 font-prompt sm:px-6 sm:py-20">
        <section
          aria-labelledby="profile-loading-title"
          className="mx-auto max-w-lg rounded-[28px] border border-[#F1D8CD] bg-white px-6 py-10 text-center shadow-sm sm:p-10"
        >
          <span
            aria-hidden="true"
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF0EB] text-2xl"
          >
            👤
          </span>

          <h1
            id="profile-loading-title"
            className="mt-5 font-mali text-2xl font-semibold leading-relaxed text-stone-700"
          >
            แก้ไขข้อมูลส่วนตัว
          </h1>

          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-sm leading-7 text-stone-600"
          >
            กำลังเตรียมข้อมูลโปรไฟล์…
          </p>
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FCFAF8] px-4 py-6 font-prompt sm:px-6 sm:py-10">
      {toast && (
        <StatusToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <nav
          aria-label="กลับไปหน้าโปรไฟล์"
          className="mb-6 sm:mb-8"
        >
          <Link
            href="/user/profile"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E8D9D1] bg-white px-4 py-2 text-sm font-medium text-[#88432F] transition-colors hover:border-[#D6B5A6] hover:bg-[#FFF0EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A65343] focus-visible:ring-offset-4"
          >
            <span aria-hidden="true">
              ←
            </span>

            กลับไปหน้าโปรไฟล์
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-6 flex items-start gap-4 sm:mb-8 sm:gap-5">
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#F1D8CD] bg-[#FFF0EB] text-2xl sm:h-14 sm:w-14"
          >
            👤
          </span>

          <div className="min-w-0">
            <h1 className="font-mali text-2xl font-semibold leading-relaxed text-stone-700 sm:text-3xl">
              แก้ไขข้อมูลส่วนตัว
            </h1>

            <p className="mt-1 text-sm leading-7 text-stone-500">
              กรุณาตรวจสอบและแก้ไขข้อมูลของคุณให้เป็นปัจจุบัน
            </p>
          </div>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[#F1D8CD] bg-white p-5 shadow-sm sm:p-8"
        >
          {/* ========================================
                        Section 1
                    ======================================== */}

          <section
            aria-labelledby="personal-info-title"
            className="space-y-5"
          >
            <div>
              <h2
                id="personal-info-title"
                className="font-mali text-xl font-semibold text-stone-700"
              >
                ข้อมูลส่วนตัว
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                ข้อมูลพื้นฐานสำหรับใช้ในระบบ
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Full name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  ชื่อ-นามสกุล
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  required
                  placeholder="กรอกชื่อ-นามสกุล"
                  className="w-full rounded-xl border border-[#E8D9D1] bg-[#FCFAF8] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-[#A65343] focus:bg-white focus:ring-2 focus:ring-[#A65343]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  อีเมล
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-400"
                />

                <p className="mt-1.5 text-xs text-stone-400">
                  อีเมลผูกกับบัญชี ไม่สามารถแก้ไขจากหน้านี้
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  เบอร์โทรศัพท์
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-400"
                />

                <p className="mt-1.5 text-xs text-stone-400">
                  เบอร์โทรศัพท์ยังไม่เปิดให้แก้ไขจากหน้านี้
                </p>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date_of_birth"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  วันเกิด
                </label>

                <input
                  id="date_of_birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#E8D9D1] bg-[#FCFAF8] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-[#A65343] focus:bg-white focus:ring-2 focus:ring-[#A65343]/10"
                />
              </div>

              {/* Salary */}
              <div>
                <label
                  htmlFor="salary"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  รายได้เฉลี่ยต่อเดือน
                </label>

                <div className="relative">
                  <input
                    id="salary"
                    type="number"
                    min="0"
                    step="500"
                    value={salary}
                    onChange={(event) =>
                      setSalary(
                        event.target.value ===
                          ""
                          ? ""
                          : Number(
                            event
                              .target
                              .value
                          )
                      )
                    }
                    placeholder="เช่น 30000"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-[#FCFAF8] px-4 py-3 pr-16 text-sm text-stone-700 outline-none transition focus:border-[#A65343] focus:bg-white focus:ring-2 focus:ring-[#A65343]/10"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                    บาท
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 border-t border-[#F1D8D1]" />

          {/* ========================================
                        Section 2
                    ======================================== */}

          <section
            aria-labelledby="residence-title"
            className="space-y-5"
          >
            <div>
              <h2
                id="residence-title"
                className="font-mali text-xl font-semibold text-stone-700"
              >
                ข้อมูลที่พักอาศัย
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                ข้อมูลนี้ใช้ประกอบการพิจารณาความเหมาะสมในการรับเลี้ยงสัตว์
              </p>
            </div>

            {/* Accommodation */}
            <div>
              <label
                htmlFor="accommodation_type"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                ลักษณะที่พักอาศัย
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="accommodation_type"
                value={accommodationType}
                onChange={(event) =>
                  setAccommodationType(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-[#E8D9D1] bg-[#FCFAF8] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-[#A65343] focus:bg-white focus:ring-2 focus:ring-[#A65343]/10"
              >
                <option value="">
                  -- เลือกลักษณะที่พัก --
                </option>

                <option value="บ้านเดี่ยว (มีรั้วรอบขอบชิด)">
                  บ้านเดี่ยว (มีรั้วรอบขอบชิด)
                </option>

                <option value="ทาวน์โฮม / ทาวน์เฮาส์">
                  ทาวน์โฮม / ทาวน์เฮาส์
                </option>

                <option value="คอนโดมิเนียม (Pet-Friendly)">
                  คอนโดมิเนียม (Pet-Friendly)
                </option>

                <option value="อพาร์ตเมนต์ / หอพัก">
                  อพาร์ตเมนต์ / หอพัก
                </option>
              </select>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-[#E8D9D1] bg-[#FCFAF8] p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="font-mali text-base font-semibold text-stone-700">
                  <FontAwesomeIcon
                    icon={faHouse} aria-hidden="true" className="h-4 w-4 text-[#A65343]" /> ที่อยู่
                </h3>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  กรุณาระบุที่อยู่สำหรับใช้ประกอบข้อมูลโปรไฟล์
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* House no */}
                <div>
                  <label
                    htmlFor="house_no"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    บ้านเลขที่
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="house_no"
                    type="text"
                    value={
                      addressDetails.house_no
                    }
                    onChange={(event) =>
                      updateAddress(
                        "house_no",
                        event.target.value
                      )
                    }
                    required
                    placeholder="เช่น 88/12"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Village */}
                <div>
                  <label
                    htmlFor="village"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    หมู่บ้าน / อาคาร / คอนโด
                  </label>

                  <input
                    id="village"
                    type="text"
                    value={
                      addressDetails.village
                    }
                    onChange={(event) =>
                      updateAddress(
                        "village",
                        event.target.value
                      )
                    }
                    placeholder="เช่น หมู่บ้านแสนสุข"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Moo */}
                <div>
                  <label
                    htmlFor="moo"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    หมู่ที่
                  </label>

                  <input
                    id="moo"
                    type="text"
                    value={
                      addressDetails.moo
                    }
                    onChange={(event) =>
                      updateAddress(
                        "moo",
                        event.target.value
                      )
                    }
                    placeholder="เช่น 4"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Soi */}
                <div>
                  <label
                    htmlFor="soi"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    ซอย
                  </label>

                  <input
                    id="soi"
                    type="text"
                    value={
                      addressDetails.soi
                    }
                    onChange={(event) =>
                      updateAddress(
                        "soi",
                        event.target.value
                      )
                    }
                    placeholder="เช่น พหลโยธิน 32"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Road */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="road"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    ถนน
                  </label>

                  <input
                    id="road"
                    type="text"
                    value={
                      addressDetails.road
                    }
                    onChange={(event) =>
                      updateAddress(
                        "road",
                        event.target.value
                      )
                    }
                    placeholder="เช่น พหลโยธิน"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Province */}
                <div>
                  <label
                    htmlFor="province"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    จังหวัด
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="province"
                    value={
                      addressDetails.province
                    }
                    onChange={(event) =>
                      updateAddress(
                        "province",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  >
                    <option value="">
                      -- เลือกจังหวัด --
                    </option>

                    {THAI_PROVINCES.map(
                      (province) => (
                        <option
                          key={province}
                          value={province}
                        >
                          {province}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label
                    htmlFor="district"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    อำเภอ / เขต
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="district"
                    type="text"
                    value={
                      addressDetails.district
                    }
                    onChange={(event) =>
                      updateAddress(
                        "district",
                        event.target.value
                      )
                    }
                    required
                    placeholder="เช่น จตุจักร"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Subdistrict */}
                <div>
                  <label
                    htmlFor="subdistrict"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    ตำบล / แขวง
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="subdistrict"
                    type="text"
                    value={
                      addressDetails.subdistrict
                    }
                    onChange={(event) =>
                      updateAddress(
                        "subdistrict",
                        event.target.value
                      )
                    }
                    required
                    placeholder="เช่น เสนานิคม"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>

                {/* Zipcode */}
                <div>
                  <label
                    htmlFor="zipcode"
                    className="mb-1.5 block text-sm text-stone-600"
                  >
                    รหัสไปรษณีย์
                  </label>

                  <input
                    id="zipcode"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={
                      addressDetails.zipcode
                    }
                    onChange={(event) =>
                      updateAddress(
                        "zipcode",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="เช่น 10900"
                    className="w-full rounded-xl border border-[#E8D9D1] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65343]"
                  />
                </div>
              </div>
            </div>

            {/* Pet permission */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E8D9D1] bg-[#FFF8F5] p-4">
              <input
                type="checkbox"
                checked={petPermission}
                onChange={(event) =>
                  setPetPermission(
                    event.target.checked
                  )
                }
                className="mt-0.5 h-4 w-4 accent-[#A65343]"
              />

              <span>
                <span className="block text-sm font-medium text-stone-700">
                  ที่พักอาศัยอนุญาตให้เลี้ยงสัตว์
                </span>

                <span className="mt-1 block text-xs leading-5 text-stone-500">
                  ใช้ข้อมูลนี้ประกอบการพิจารณาความพร้อมในการรับเลี้ยง
                </span>
              </span>
            </label>
          </section>

          {/* Divider */}
          <div className="my-8 border-t border-[#F1D8D1]" />

          {/* ========================================
                        Section 3
                    ======================================== */}

          <section
            aria-labelledby="pets-title"
            className="space-y-5"
          >
            <div>
              <h2
                id="pets-title"
                className="font-mali text-xl font-semibold text-stone-700"
              >
                สัตว์เลี้ยงและสมาชิกในบ้าน
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-500">
                ข้อมูลประกอบเกี่ยวกับสัตว์เลี้ยงที่มีอยู่ในปัจจุบัน
              </p>
            </div>

            <div>
              <label
                htmlFor="animal_count"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                จำนวนสัตว์เลี้ยงที่มีอยู่
              </label>

              <div className="relative sm:max-w-xs">
                <input
                  id="animal_count"
                  type="number"
                  min="0"
                  value={animalCount}
                  onChange={(event) =>
                    setAnimalCount(
                      Math.max(
                        0,
                        Number(
                          event.target
                            .value
                        ) || 0
                      )
                    )
                  }
                  className="w-full rounded-xl border border-[#E8D9D1] bg-[#FCFAF8] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#A65343] focus:bg-white focus:ring-2 focus:ring-[#A65343]/10"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                  ตัว
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="residence_note"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                รายละเอียดสมาชิกในบ้าน / สัตว์เลี้ยงเดิม
              </label>

              <textarea
                id="residence_note"
                rows={4}
                value={residenceNote}
                onChange={(event) =>
                  setResidenceNote(
                    event.target.value
                  )
                }
                placeholder="เช่น อาศัยอยู่คนเดียว / มีแมว 1 ตัว / มีเด็กเล็กในบ้าน"
                className="w-full resize-y rounded-xl border border-[#E8D9D1] bg-[#FCFAF8] px-4 py-3 text-sm leading-6 text-stone-700 outline-none transition focus:border-[#A65343] focus:bg-white focus:ring-2 focus:ring-[#A65343]/10"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#F1D8D1] pt-6 sm:flex-row sm:justify-end">

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#A65343] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#88432F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A65343] focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "กำลังบันทึก..."
                : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
