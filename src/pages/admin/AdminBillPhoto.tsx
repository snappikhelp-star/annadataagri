import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Image, CheckCircle, X } from "lucide-react";

function makeInvNum() {
  const d = new Date();
  return `BP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(Math.random()*9000)+1000}`;
}


const UI = {
  hi: {
    pageDesc: "बिल की फोटो अपलोड करें और मैनुअल एंट्री भरें। बाद में OCR/AI से ऑटो-एंट्री जोड़ी जाएगी।",
    photoUploadFailedPrefix: "फोटो अपलोड नहीं हुई: ",
    photoUploadFailedSuffix: " (Supabase में bill-images bucket बनाएं)",
    customerNameRequired: "ग्राहक का नाम जरूरी है",
    productNameRequired: "प्रोडक्ट का नाम जरूरी है",
    qtyPriceRequired: "मात्रा और दाम भरें",
    saveFailedPrefix: "सेव नहीं हुआ: ",
    billSaved: "बिल सेव हो गया!",
    dropPhoto: "फोटो खींचकर यहाँ छोड़ें या क्लिक करें",
    supported: "JPG, PNG, WEBP सपोर्ट",
    uploaded: "{L("uploaded")}",
    uploadNote: "नोट: फोटो बिना अपलोड के भी एंट्री सेव हो सकती है।",
    ocrTitle: "OCR / AI ऑटो-एंट्री",
    ocrDesc: "भविष्य में बिल फोटो से ऑटोमैटिक डेटा भरा जाएगा। अभी मैनुअल एंट्री भरें।",
    customerNamePh: "ग्राहक का नाम...",
    mobilePh: "मोबाइल",
    villagePh: "गांव",
    productNamePh: "प्रोडक्ट का नाम...",
    quantityPh: "मात्रा",
    pricePh: "दाम",
    total: "कुल",
    notesPh: "नोट (वैकल्पिक)...",
    saving: "सेव हो रहा है...",
  },
  en: {
    pageDesc: "Upload a bill photo and fill manual entry. OCR/AI auto-entry will be added later.",
    photoUploadFailedPrefix: "Photo upload failed: ",
    photoUploadFailedSuffix: " (Create the bill-images bucket in Supabase)",
    customerNameRequired: "Customer name is required",
    productNameRequired: "Product name is required",
    qtyPriceRequired: "Enter quantity and price",
    saveFailedPrefix: "Save failed: ",
    billSaved: "Bill saved!",
    dropPhoto: "Drop a photo here or click to upload",
    supported: "JPG, PNG, WEBP supported",
    uploaded: "✅ Uploaded",
    uploadNote: "Note: Entry can still be saved without photo upload.",
    ocrTitle: "OCR / AI Auto Entry",
    ocrDesc: "In future, data will be filled automatically from bill photos. For now, fill manual entry.",
    customerNamePh: "Customer name...",
    mobilePh: "Mobile",
    villagePh: "Village",
    productNamePh: "Product name...",
    quantityPh: "Quantity",
    pricePh: "Price",
    total: "Total",
    notesPh: "Notes (optional)...",
    saving: "Saving...",
  },
} as const;


export default function AdminBillPhoto() {
  const { t, lang } = useLang();
  const L = (key: keyof typeof UI.hi) => UI[lang]?.[key] ?? UI.hi[key];
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerVillage, setCustomerVillage] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [payStatus, setPayStatus] = useState<"paid"|"udhaar">("paid");
  const [notes, setNotes] = useState("");

  const totalAmount = Number(quantity || 0) * Number(price || 0);

  function handleFile(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl(null);
    setUploadError("");
    setSaved(false);
    uploadImage(file);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError("");
    const ext = file.name.split(".").pop();
    const path = `bill-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage.from("bill-images").upload(path, file, { upsert: true });
    if (error) {
      setUploadError(L("photoUploadFailedPrefix") + error.message + L("photoUploadFailedSuffix"));
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("bill-images").getPublicUrl(data.path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  async function saveBill() {
    if (!customerName.trim()) { setSaveError(L("customerNameRequired")); return; }
    if (!productName.trim()) { setSaveError(L("productNameRequired")); return; }
    if (!quantity || !price) { setSaveError(L("qtyPriceRequired")); return; }
    setSaving(true); setSaveError("");

    const invNum = makeInvNum();
    const udhaarAmt = payStatus === "udhaar" ? totalAmount : 0;
    const paidAmt = payStatus === "paid" ? totalAmount : 0;

    const { error } = await supabase.from("invoices").insert([{
      invoice_number: invNum, customer_name: customerName,
      customer_mobile: customerMobile, customer_village: customerVillage,
      total_amount: totalAmount, discount: 0, final_amount: totalAmount,
      paid_amount: paidAmt, udhaar_amount: udhaarAmt,
      payment_status: payStatus, notes: notes || null,
      bill_image_url: imageUrl || null,
      created_by: user?.email || "admin"
    }]);

    if (error) { setSaveError(L("saveFailedPrefix") + error.message); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setCustomerName(""); setCustomerMobile(""); setCustomerVillage("");
    setProductName(""); setQuantity(""); setPrice(""); setNotes("");
    setImageFile(null); setImagePreview(null); setImageUrl(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 font-hindi">{t("billPhotoTitle")} 📸</h1>
      <p className="text-gray-500 font-hindi text-sm">{L("pageDesc")}</p>

      {saved && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-800 font-hindi font-bold">{t("billCreated")} {L("billSaved")}</p>
          <button onClick={() => setSaved(false)} className="ml-auto"><X className="w-5 h-5 text-green-600" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-3 border-dashed border-green-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-green-50 transition-colors bg-green-50/30 min-h-[200px] flex flex-col items-center justify-center">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {uploading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-hindi text-green-700">{t("uploading")}</p>
              </div>
            ) : imagePreview ? null : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-green-400 mx-auto" />
                <p className="font-hindi text-green-700 font-bold text-lg">{t("uploadBill")}</p>
                <p className="font-hindi text-gray-400 text-sm">{L("dropPhoto")}</p>
                <p className="font-hindi text-gray-300 text-xs">{L("supported")}</p>
              </div>
            )}
          </div>

          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-green-200 shadow-md">
              <img src={imagePreview} alt="Bill" className="w-full object-contain max-h-96" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); setImageUrl(null); }}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50">
                <X className="w-4 h-4 text-red-500" />
              </button>
              {imageUrl && (
                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-hindi">
                  {L("uploaded")}
                </div>
              )}
            </div>
          )}

          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm font-hindi">{uploadError}</p>
              <p className="text-red-400 text-xs font-hindi mt-1">{L("uploadNote")}</p>
            </div>
          )}

          {!imagePreview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-yellow-600" />
                <p className="font-hindi font-bold text-yellow-800">{L("ocrTitle")}</p>
              </div>
              <p className="font-hindi text-yellow-700 text-sm">{L("ocrDesc")}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 font-hindi text-lg">{t("manualEntry")}</h3>

          <div className="space-y-3">
            <div>
              <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("customerName")} *</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder={L("customerNamePh")}
                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("mobile")}</label>
                <input value={customerMobile} onChange={e => setCustomerMobile(e.target.value)}
                  placeholder={L("mobilePh")} type="tel"
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              </div>
              <div>
                <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("village")}</label>
                <input value={customerVillage} onChange={e => setCustomerVillage(e.target.value)}
                  placeholder={L("villagePh")}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              </div>
            </div>
            <div>
              <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("product")} *</label>
              <input value={productName} onChange={e => setProductName(e.target.value)}
                placeholder={L("productNamePh")}
                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("quantity")} *</label>
                <input value={quantity} onChange={e => setQuantity(e.target.value)}
                  placeholder={L("quantityPh")} type="number" min="0"
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              </div>
              <div>
                <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("price")} (₹) *</label>
                <input value={price} onChange={e => setPrice(e.target.value)}
                  placeholder={L("pricePh")} type="number" min="0"
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base" />
              </div>
            </div>
            {totalAmount > 0 && (
              <div className="bg-green-50 rounded-xl px-4 py-3 text-center">
                <p className="text-green-800 font-hindi font-bold text-xl">{L("total")}: ₹{totalAmount.toLocaleString("en-IN")}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPayStatus("paid")}
                className={`py-3 rounded-xl font-hindi font-bold transition-all ${payStatus === "paid" ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
                ✅ {t("paid")}
              </button>
              <button onClick={() => setPayStatus("udhaar")}
                className={`py-3 rounded-xl font-hindi font-bold transition-all ${payStatus === "udhaar" ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
                🔴 {t("udhaar")}
              </button>
            </div>
            <div>
              <label className="block font-hindi text-sm font-semibold text-gray-700 mb-1.5">{t("notes")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder={L("notesPh")} rows={2}
                className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 font-hindi outline-none text-base resize-none" />
            </div>
          </div>

          {saveError && <p className="text-red-600 font-hindi text-sm">{saveError}</p>}

          <button onClick={saveBill} disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-hindi font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60">
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {saving ? L("saving") : t("saveBill")}
          </button>
        </div>
      </div>
    </div>
  );
}
