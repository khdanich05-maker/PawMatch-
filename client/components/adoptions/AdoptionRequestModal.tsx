"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Animal } from "@/types/animal";

type Props = { animal: Animal; onClose: () => void };
const initialForm = {
  fullName: "", nickname: "", dateOfBirth: "", phone: "",
  accommodation: "", familyMembers: "", animalCount: "",
  careTime: "", budget: "", reason: "",
};
type Field = keyof typeof initialForm;
const titles = ["แนะนำตัวกันหน่อย 👋", "บ้านของน้อง 🏡", "ความพร้อมในการดูแล 💛"];

export default function AdoptionRequestModal({ animal, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  function update(field: Field, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setMessage("");
  }

  function requestClose() {
    const hasChanges = Object.values(form).some((value) => value !== "");
    if (!hasChanges || window.confirm("ปิดแบบฟอร์มไหม? ข้อมูลที่กรอกไว้ยังไม่ได้บันทึก")) onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 2) { setStep(step + 1); return; }
    setMessage("กรอกข้อมูลครบแล้วค่ะ 🧡 นี่เป็นการทดลอง ยังไม่ได้ส่งคำขอหรืออัปเดตโปรไฟล์");
  }

  function input(field: Field, label: string, options: {
    type?: string; placeholder?: string; required?: boolean; suffix?: string;
  } = {}) {
    const { type = "text", placeholder, required = false, suffix } = options;
    return (
      <div className="form-group">
        <label htmlFor={`adoption-${field}`}>{label} {required
          ? <span className="req-mark">*</span>
          : <span className="opt-mark">(ไม่บังคับ)</span>}
        </label>
        <div className="input-wrapper">
          <input id={`adoption-${field}`} name={field} type={type}
            className={`form-control${suffix ? " has-suffix" : ""}${field === "budget" ? " budget" : ""}`}
            value={form[field]} onChange={(event) => update(field, event.target.value)}
            placeholder={placeholder} required={required}
            min={type === "number" ? 0 : undefined}
            step={type === "number" ? 1 : undefined}
            max={type === "date" ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}` : undefined}
            inputMode={type === "tel" ? "tel" : type === "number" ? "numeric" : undefined}
            pattern={type === "tel" ? "[0-9]{9,10}" : undefined}
            maxLength={type === "tel" ? 10 : type === "text" ? 150 : undefined}
            autoComplete={field === "fullName" ? "name" : field === "phone" ? "tel" : field === "dateOfBirth" ? "bday" : undefined}
          />
          {suffix && <span className="input-suffix">{suffix}</span>}
        </div>
      </div>
    );
  }

  return (
    <dialog ref={dialogRef} className="pm-adoption" aria-labelledby="adoption-title"
      aria-describedby="adoption-step"
      onCancel={(event) => { event.preventDefault(); requestClose(); }}>
      <button type="button" className="close-btn" aria-label="ปิดแบบฟอร์ม" onClick={requestClose}>×</button>
      <div className="modal-content" ref={contentRef}>
        <header className="modal-header">
          <h2 id="adoption-title" ref={headingRef} tabIndex={-1} className="modal-title">ส่งคำขอรับน้องไปดูแล 🏡</h2>
        </header>
        <p className="progress-text" id="adoption-step" aria-live="polite">ขั้นตอนที่ {step + 1} จาก 3 : {titles[step]}</p>
        <div className="progress-container" aria-hidden="true">
          {titles.map((title, index) => <Fragment key={title}>
            {index > 0 && <span className="progress-line" />}
            <span className={`progress-dot${index === step ? " active" : ""}`} />
          </Fragment>)}
        </div>
        <div className="animal-highlight">
          {animal.image_url && !imageFailed
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="animal-img" src={animal.image_url} alt={animal.name} onError={() => setImageFailed(true)} />
            : <span className="animal-img" role="img" aria-label={animal.species}>🐾</span>}
          <div className="animal-details">
            <h3>{animal.name}</h3>
            <p><span>{animal.species === "แมว" ? "🐈" : "🐕"} {animal.species}</span><span>•</span><span>{animal.gender === "ตัวเมีย" ? "♀️" : "♂️"} {animal.gender}</span></p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-step active" key={step}>
            {step === 0 && <>
              {input("fullName", "ชื่อ-นามสกุล", { required: true, placeholder: "ชื่อและนามสกุลของคุณ" })}
              {input("nickname", "ชื่อเล่น", { placeholder: "เช่น แอน" })}
              {input("dateOfBirth", "วันเกิด", { type: "date", required: true })}
              {input("phone", "เบอร์โทรศัพท์", { type: "tel", required: true, placeholder: "เช่น 0812345678" })}
            </>}
            {step === 1 && <>
              <div className="form-group full-width">
                <label htmlFor="adoption-accommodation">ที่พักของคุณเป็นแบบไหน? <span className="req-mark">*</span></label>
                <select id="adoption-accommodation" className="form-control" required value={form.accommodation} onChange={(event) => update("accommodation", event.target.value)}>
                  <option value="" disabled>เลือกประเภทที่พักและกรรมสิทธิ์...</option>
                  <option value="house_owned">บ้านเดี่ยว (ของตัวเอง / ครอบครัว)</option>
                  <option value="house_rented">บ้านเดี่ยว (บ้านเช่า / เจ้าของอนุญาตแล้ว)</option>
                  <option value="townhome_owned">ทาวน์โฮม / ตึกแถว (ของตัวเอง / ครอบครัว)</option>
                  <option value="townhome_rented">ทาวน์โฮม / ตึกแถว (บ้านเช่า / เจ้าของอนุญาตแล้ว)</option>
                  <option value="condo">คอนโด / หอพัก (อนุญาตให้เลี้ยงสัตว์)</option>
                </select>
              </div>
              {input("familyMembers", "สมาชิกในครอบครัว", { type: "number", placeholder: "เช่น 3", suffix: "คน" })}
              {input("animalCount", "ตอนนี้มีสัตว์เลี้ยงที่บ้านกี่ตัว?", { type: "number", placeholder: "ถ้าไม่มีให้ใส่ 0", suffix: "ตัว", required: true })}
            </>}
            {step === 2 && <>
              <div className="form-group">
                <label htmlFor="adoption-careTime">เวลาดูแลน้องต่อวัน <span className="req-mark">*</span></label>
                <select id="adoption-careTime" className="form-control" required value={form.careTime} onChange={(event) => update("careTime", event.target.value)}>
                  <option value="" disabled>เลือกเวลาโดยประมาณ...</option>
                  <option value="under_2">น้อยกว่า 2 ชั่วโมง</option>
                  <option value="2_4">2–4 ชั่วโมง</option>
                  <option value="4_6">4–6 ชั่วโมง</option>
                  <option value="over_6">มากกว่า 6 ชั่วโมง</option>
                </select>
              </div>
              {input("budget", "ตั้งงบดูแลน้องไว้ที่เท่าไหร่?", { type: "number", required: true, placeholder: "เผื่อค่าอาหาร/วัคซีน", suffix: "บาท/เดือน" })}
              <div className="form-group full-width">
                <label htmlFor="adoption-reason">ทำไมถึงอยากรับน้องตัวนี้ไปดูแลเอ่ย? 💖 <span className="opt-mark">(ไม่บังคับ)</span></label>
                <textarea id="adoption-reason" className="form-control" placeholder="เล่าให้เราฟังหน่อยน้า..." maxLength={1000} value={form.reason} onChange={(event) => update("reason", event.target.value)} />
              </div>
            </>}
            {message && <p className="test-result" role="status">{message}</p>}
            <div className="button-group">
              {step > 0 && <button type="button" className="btn btn-back" onClick={() => { setStep(step - 1); setMessage(""); }}>← ย้อนกลับ</button>}
              <button type="submit" className="btn btn-next">{step < 2 ? "ถัดไป ➜" : "ทดลองส่งคำขอรับเลี้ยง 🐾"}</button>
            </div>
            {step === 2 && <p className="helper-text-bottom">💡 ขณะนี้เป็นแบบฟอร์มทดลอง ยังไม่บันทึกคำขอหรืออัปเดตโปรไฟล์</p>}
          </div>
        </form>
      </div>
      <style jsx global>{`        .pm-adoption {
            background-color: var(--bg-cream);
            width: 100%;
            max-width: 700px; 
            border-radius: 28px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
            max-height: 90vh;
            overflow: hidden; 
            display: flex;
            flex-direction: column;
        }

        .pm-adoption .modal-content {
            padding: 40px;
            overflow-y: auto;
            box-sizing: border-box;
        }

        .pm-adoption .modal-content::-webkit-scrollbar { width: 8px; }
        .pm-adoption .modal-content::-webkit-scrollbar-thumb { background: #E7E5E4; border-radius: 10px; }

        .pm-adoption .close-btn {
            position: absolute;
            top: 25px; right: 25px;
            background: #FDF0EB;
            border: none;
            width: 36px; height: 36px;
            border-radius: 50%;
            font-size: 20px;
            color: var(--text-dark);
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10; 
        }
        .pm-adoption .close-btn:hover { background: var(--primary-orange); color: white; }

        .pm-adoption .modal-header { text-align: center; margin-bottom: 20px; }
        .pm-adoption .modal-title { font-family: 'Mali', cursive; font-weight: 600; font-size: 26px; color: var(--text-dark); margin: 0; }

        /* Progress Bar */
        .pm-adoption .progress-container { display: flex; justify-content: center; align-items: center; margin-bottom: 30px; gap: 10px; }
        .pm-adoption .progress-dot { width: 12px; height: 12px; background-color: var(--input-border); border-radius: 50%; transition: 0.3s; }
        .pm-adoption .progress-dot.active { background-color: var(--primary-orange); transform: scale(1.3); }
        .pm-adoption .progress-line { width: 40px; height: 3px; background-color: var(--input-border); }
        .pm-adoption .progress-text { text-align: center; font-family: 'Prompt', sans-serif; font-size: 14px; color: var(--primary-orange); margin-bottom: 20px; font-weight: 400; }

        /* Animal Highlight */
        .pm-adoption .animal-highlight { background: linear-gradient(135deg, #FFFFFF 0%, #FDF0EB 100%); border: 1px solid rgba(226, 149, 120, 0.25); border-radius: 16px; padding: 15px 20px; display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
        .pm-adoption .animal-img { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid white; }
        .pm-adoption .animal-details h3 { font-family: 'Itim', cursive; font-size: 20px; margin: 0 0 5px 0; color: var(--text-dark); }
        .pm-adoption .animal-details p { font-family: 'Prompt', sans-serif; font-size: 13px; color: var(--text-gray); margin: 0; display: flex; gap: 8px; }

        /* Form Logic & Styles */
        .pm-adoption .form-step { display: none; animation: pmAdoptionFadeIn 0.4s; }
        .pm-adoption .form-step.active { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 20px; }
        @keyframes pmAdoptionFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .pm-adoption .full-width { grid-column: span 2; }
        .pm-adoption .form-group label { display: block; font-family: 'Mali', cursive; font-weight: 600; font-size: 14px; color: var(--text-dark); margin-bottom: 8px; }
        
        /* ป้ายแจ้งเตือน Required / Optional */
        .pm-adoption .req-mark { color: var(--danger); } 
        .pm-adoption .opt-mark { color: #A0A0A0; font-weight: normal; font-family: 'Prompt', sans-serif; font-size: 12px; } 

        .pm-adoption .form-control { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--input-border); font-family: 'Prompt', sans-serif; font-size: 14px; box-sizing: border-box; transition: 0.2s; }
        textarea.form-control { resize: vertical; min-height: 80px; }
        .pm-adoption .form-control:focus { outline: none; border-color: var(--primary-orange); box-shadow: 0 0 0 4px var(--input-focus); }
        .pm-adoption .input-wrapper { position: relative; }
        .pm-adoption .input-suffix { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-family: 'Prompt', sans-serif; color: var(--text-gray); pointer-events: none; }

        /* Buttons */
        .pm-adoption .button-group { display: flex; gap: 15px; margin-top: 30px; grid-column: span 2; }
        .pm-adoption .btn { padding: 16px; border-radius: 50px; font-family: 'Mali', cursive; font-weight: 600; font-size: 18px; cursor: pointer; transition: 0.3s; text-align: center; border: none; }
        .pm-adoption .btn-next { flex: 1; background-color: var(--primary-orange); color: white; box-shadow: 0 8px 20px rgba(226, 149, 120, 0.4); }
        .pm-adoption .btn-next:hover { background-color: var(--primary-hover); transform: translateY(-2px); }
        .pm-adoption .btn-back { flex: 0.5; background-color: #FDF0EB; color: var(--text-dark); }
        .pm-adoption .btn-back:hover { background-color: #E7E5E4; }
        .pm-adoption .helper-text-bottom { grid-column: span 2; font-family: 'Prompt', sans-serif; font-size: 13px; color: #999999; text-align: center; margin-top: 10px; margin-bottom: 0; }

        @media (max-width: 600px) {
            .pm-adoption .form-step.active { grid-template-columns: 1fr; }
            .pm-adoption .button-group { grid-column: span 1; flex-direction: column-reverse; }
            .pm-adoption .helper-text-bottom { grid-column: span 1; }
        }
    
.pm-adoption { --primary-orange:#E29578; --primary-hover:#C07055; --bg-cream:#FCFAF8; --text-dark:#44403C; --text-gray:#78716C; --input-border:#E7E5E4; --input-focus:rgba(226,149,120,.15); --danger:#FF6B6B; border:0; padding:0; margin:auto; width:calc(100% - 32px); max-height:90dvh; color:var(--text-dark); }
.pm-adoption:not([open]) { display:none; }
.pm-adoption::backdrop { background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.pm-adoption *, .pm-adoption *::before, .pm-adoption *::after { box-sizing:border-box; }
.pm-adoption .modal-content { width:100%; }
.pm-adoption .modal-title { line-height:1.5; padding:0 22px; outline:none; }
.pm-adoption .progress-text { margin-top:0; line-height:1.6; }
.pm-adoption .animal-img { flex-shrink:0; display:flex; align-items:center; justify-content:center; background:#FDF0EB; font-size:30px; }
.pm-adoption .animal-details { min-width:0; }
.pm-adoption .animal-details h3 { overflow-wrap:anywhere; line-height:1.4; }
.pm-adoption .animal-details p { flex-wrap:wrap; line-height:1.6; }
.pm-adoption .form-control { display:block; background:#fff; color:#44403C; line-height:1.5; min-height:47px; }
.pm-adoption .form-control::placeholder { color:#8a8581; opacity:1; }
.pm-adoption .form-control.has-suffix { padding-right:54px; }
.pm-adoption .form-control.budget { padding-right:105px; }
.pm-adoption textarea.form-control { min-height:88px; }
.pm-adoption .form-group label { line-height:1.6; }
.pm-adoption .button-group { margin-top:30px; }
.pm-adoption .btn { line-height:1.4; }
.pm-adoption button:focus-visible { outline:3px solid #C07055; outline-offset:4px; }
.pm-adoption .helper-text-bottom { line-height:1.7; }
.pm-adoption .test-result { grid-column:1 / -1; margin:0; padding:12px 16px; border:1px solid #E29578; border-radius:12px; color:#854b36; background:#FDF0EB; font:13px/1.7 'Prompt',sans-serif; }
@media(max-width:600px) {
 .pm-adoption { border-radius:24px; max-height:94dvh; }
 .pm-adoption .modal-content { padding:52px 22px 26px; }
 .pm-adoption .modal-title { font-size:22px; padding:0; }
 .pm-adoption .close-btn { top:14px; right:14px; }
 .pm-adoption .animal-highlight { padding:14px; gap:12px; }
 .pm-adoption .full-width { grid-column:1 / -1; }
 .pm-adoption .button-group { margin-top:14px; }
 .pm-adoption .btn { width:100%; font-size:17px; }
}
@media(prefers-reduced-motion:reduce) { .pm-adoption * { animation:none!important; transition:none!important; } }
`}</style>
    </dialog>
  );
}
