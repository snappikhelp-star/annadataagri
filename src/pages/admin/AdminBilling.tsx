import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, Download, Share2, X, FileText,
  Phone, Printer, TrendingUp, Receipt, IndianRupee,
  Users, AlertCircle, CalendarDays, Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* ─────────────────────────────── Types ─────────────────────────────── */
interface CartItem {
  product_id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  quantity: number;
  selling_price: number;
  discount: number;
}

/** Cash / UPI / Credit (उधार/क्रेडिट) — not "paid status" */
type PayMode = "cash" | "upi" | "credit" | "";

/* ─────────────────────────────── Helpers ─────────────────────────────── */
function makeInvoiceNumber() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtRs(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

/** Encode extra metadata as prefixes in the notes field (no extra DB columns needed) */
function buildNotes(mode: PayMode, crop: string, note: string) {
  const parts: string[] = [];
  if (mode) parts.push(`[Mode:${mode.toUpperCase()}]`);
  if (crop) parts.push(`[Crop:${crop}]`);
  if (note.trim()) parts.push(note.trim());
  return parts.join(" ");
}

function parseMeta(notes?: string) {
  const mode = (notes?.match(/\[Mode:(CASH|UPI|CREDIT)\]/)?.[1] ?? "").toLowerCase() as PayMode;
  const crop = notes?.match(/\[Crop:([^\]]+)\]/)?.[1] ?? "";
  const note = (notes ?? "").replace(/\[Mode:[A-Z]+\]\s?/, "").replace(/\[Crop:[^\]]+\]\s?/, "").trim();
  return { mode, crop, note };
}

/* ──────────────────────── Print (new-window approach) ──────────────────────── */
function generatePrintHTML(inv: any, items: CartItem[]) {
  const { mode, crop, note } = parseMeta(inv?.notes);
  const safe = (value: any) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const rows = items.map((it, i) => {
    const itemTotal = (Number(it.selling_price) * Number(it.quantity)) - Number(it.discount || 0);
    return `
      <tr>
        <td class="center sr">${i + 1}</td>
        <td class="product">
          <strong>${safe(it.name)}</strong>
          ${it.category ? `<span>${safe(it.category)}</span>` : ""}
        </td>
        <td class="center">${safe(it.quantity)}</td>
        <td class="center">${safe(it.unit)}</td>
        <td class="right">${fmtRs(Number(it.selling_price))}</td>
        <td class="right">${Number(it.discount) > 0 ? fmtRs(Number(it.discount)) : "—"}</td>
        <td class="right amount">${fmtRs(itemTotal)}</td>
      </tr>`;
  }).join("");

  const dateText = inv?.created_at
    ? new Date(inv.created_at).toLocaleDateString("hi-IN", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("hi-IN", { day: "2-digit", month: "long", year: "numeric" });
  const timeText = inv?.created_at
    ? new Date(inv.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const paymentLabel = inv?.payment_status === "paid" ? "PAID / पूरा जमा" : inv?.payment_status === "udhaar" ? "@" : "PARTIAL / आंशिक";
  const modeLabel = mode ? mode.toUpperCase() : "CASH";

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Annadata Bill ${safe(inv?.invoice_number)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Noto Sans Devanagari',Arial,sans-serif;color:#111827;background:#e5e7eb;padding:10mm;font-size:13px;line-height:1.35}
  .invoice{width:190mm;min-height:277mm;margin:0 auto;background:#fff;border:2px solid #166534;position:relative;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.12)}
  .topbar{height:9mm;background:linear-gradient(90deg,#14532d,#166534,#22c55e);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:12px;letter-spacing:.7px}
  .header{padding:9mm 10mm 6mm;border-bottom:2px solid #166534;position:relative}
  .brand-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .logo-box{width:22mm;height:22mm;border:2px solid #166534;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;background:#f0fdf4;flex-shrink:0}
  .brand{text-align:center;flex:1}
  .shop-name{font-size:27px;font-weight:900;color:#14532d;letter-spacing:.4px;line-height:1.1}
  .shop-tag{font-size:12px;color:#92400e;font-weight:800;margin-top:3px;letter-spacing:.3px}
  .badge{width:28mm;text-align:center;border:2px solid #f59e0b;border-radius:10px;padding:6px 5px;background:#fffbeb;color:#92400e;font-weight:900;font-size:11px;flex-shrink:0}
  .shop-sub{text-align:center;color:#374151;font-size:12px;margin-top:6px;font-weight:600;line-height:1.55}
  .invoice-title{display:flex;align-items:center;justify-content:space-between;padding:4mm 10mm;background:#f0fdf4;border-bottom:1px solid #bbf7d0}
  .invoice-title h1{font-size:18px;color:#14532d;font-weight:900;letter-spacing:.5px}
  .status-pill{padding:5px 12px;border-radius:999px;background:#dcfce7;color:#166534;border:1px solid #86efac;font-size:12px;font-weight:900}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm;padding:7mm 10mm 5mm}
  .box{border:1.5px solid #d1d5db;border-radius:12px;overflow:hidden;background:#fff}
  .box-title{background:#14532d;color:#fff;padding:7px 10px;font-weight:900;font-size:12px;letter-spacing:.2px}
  .box-body{padding:9px 10px;display:grid;gap:6px}
  .line{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #e5e7eb;padding-bottom:4px}
  .line:last-child{border-bottom:0;padding-bottom:0}
  .label{color:#6b7280;font-size:11px;font-weight:700;white-space:nowrap}
  .value{font-weight:800;color:#111827;text-align:right}
  .items-wrap{padding:0 10mm 5mm}
  table{width:100%;border-collapse:collapse;border:1.5px solid #166534;font-size:12px}
  th{background:#166534;color:#fff;padding:10px 8px;text-align:left;font-weight:900;border-right:1px solid rgba(255,255,255,.25)}
  td{padding:9px 8px;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb;vertical-align:top}
  tbody tr:nth-child(even){background:#f9fafb}
  .center{text-align:center}.right{text-align:right}.sr{font-weight:900;color:#166534}.product strong{display:block;font-size:12.5px}.product span{display:block;color:#6b7280;font-size:10.5px;margin-top:2px}.amount{font-weight:900;color:#14532d}
  .summary-row{display:grid;grid-template-columns:1.25fr .75fr;gap:6mm;padding:0 10mm 5mm;align-items:start}
  .terms{border:1px solid #d1d5db;border-radius:12px;padding:10px;min-height:38mm;background:#fafafa}
  .terms h3{color:#14532d;font-size:13px;font-weight:900;margin-bottom:6px}
  .terms ul{padding-left:18px;color:#4b5563;font-size:11.5px;line-height:1.6}
  .note{margin-top:8px;color:#374151;font-size:11.5px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:7px}
  .totals{border:2px solid #166534;border-radius:14px;overflow:hidden;background:#fff}
  .total-line{display:flex;justify-content:space-between;padding:8px 11px;border-bottom:1px solid #e5e7eb;font-size:12.5px}
  .total-line span:first-child{color:#4b5563;font-weight:700}.total-line span:last-child{font-weight:900}
  .grand{background:#14532d;color:#fff;padding:11px;font-size:20px;font-weight:900;display:flex;justify-content:space-between;align-items:center}
  .paid{color:#15803d}.due{color:#b91c1c}.discount{color:#b45309}
  .sign-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8mm;padding:8mm 10mm 6mm;margin-top:4mm}
  .sign{text-align:center;border-top:1.5px solid #111;padding-top:7px;font-size:11px;font-weight:800;color:#374151}
  .footer{position:absolute;left:0;right:0;bottom:0;background:#14532d;color:#fff;text-align:center;padding:8px 10mm;font-size:11.5px;font-weight:700;line-height:1.45}
  .review-strip{margin:0 10mm 5mm;border:1px dashed #f59e0b;border-radius:12px;background:#fffbeb;color:#92400e;text-align:center;padding:8px;font-weight:900;font-size:12px}
  @media print{body{background:#fff;padding:0}.invoice{box-shadow:none;margin:0;width:190mm;min-height:277mm}@page{size:A4;margin:10mm}.no-print{display:none!important}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
  <div class="invoice">
    <div class="topbar">TAX / RETAIL INVOICE • किसान सेवा बिल</div>

    <div class="header">
      <div class="brand-row">
        <div class="logo-box">🌿</div>
        <div class="brand">
          <div class="shop-name">अन्नदाता एग्री एण्ड सीड्स</div>
          <div class="shop-tag">बीज • खाद • कीटनाशक • फसल सलाह</div>
        </div>
        <div class="badge">Google ⭐ 4.9<br/>200+ Farmers</div>
      </div>
      <div class="shop-sub">
        रायसेन रोड, त्रिमूर्ति चौराहा, सलामतपुर, जिला रायसेन (म.प्र.)<br/>
        📞 6261737388 / 9691712455 &nbsp; | &nbsp; केशव मीणा — किसान सलाहकार
      </div>
    </div>

    <div class="invoice-title">
      <h1>बिल / Invoice</h1>
      <div class="status-pill">${safe(paymentLabel)}</div>
    </div>

    <div class="info-grid">
      <div class="box">
        <div class="box-title">Invoice Details</div>
        <div class="box-body">
          <div class="line"><span class="label">Bill No.</span><span class="value">${safe(inv?.invoice_number)}</span></div>
          <div class="line"><span class="label">Date</span><span class="value">${safe(dateText)}</span></div>
          <div class="line"><span class="label">Time</span><span class="value">${safe(timeText)}</span></div>
          <div class="line"><span class="label">Payment Mode</span><span class="value">${safe(modeLabel)}</span></div>
        </div>
      </div>
      <div class="box">
        <div class="box-title">Customer Details</div>
        <div class="box-body">
          <div class="line"><span class="label">Name</span><span class="value">${safe(inv?.customer_name)}</span></div>
          ${inv?.customer_mobile ? `<div class="line"><span class="label">Mobile</span><span class="value">${safe(inv.customer_mobile)}</span></div>` : ""}
          ${inv?.customer_village ? `<div class="line"><span class="label">Village</span><span class="value">${safe(inv.customer_village)}</span></div>` : ""}
          ${crop ? `<div class="line"><span class="label">Crop</span><span class="value">${safe(crop)}</span></div>` : ""}
        </div>
      </div>
    </div>

    <div class="items-wrap">
      <table>
        <thead><tr>
          <th style="width:9%;text-align:center">Sr.</th>
          <th style="width:35%">Product / Category</th>
          <th style="width:10%;text-align:center">Qty</th>
          <th style="width:10%;text-align:center">Unit</th>
          <th style="width:13%;text-align:right">Rate</th>
          <th style="width:10%;text-align:right">Disc.</th>
          <th style="width:13%;text-align:right">Amount</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="summary-row">
      <div class="terms">
        <h3>नियम व सूचना</h3>
        <ul>
          <li>खरीदा हुआ सामान जांचकर लें।</li>
          <li>बीज/दवाई का उपयोग सलाह और निर्देश अनुसार करें।</li>
          <li>फसल की समस्या में फोटो WhatsApp पर भेजें।</li>
        </ul>
        ${note ? `<div class="note"><strong>नोट:</strong> ${safe(note)}</div>` : ""}
      </div>
      <div class="totals">
        <div class="total-line"><span>उप-कुल</span><span>${fmtRs(inv?.total_amount || 0)}</span></div>
        ${Number(inv?.discount) > 0 ? `<div class="total-line"><span>छूट</span><span class="discount">− ${fmtRs(inv?.discount || 0)}</span></div>` : ""}
        <div class="grand"><span>कुल राशि</span><span>${fmtRs(inv?.final_amount || 0)}</span></div>
        <div class="total-line"><span>जमा राशि</span><span class="paid">${fmtRs(inv?.paid_amount || 0)}</span></div>
        <div class="total-line"><span>बाकी / उधार</span><span class="due">${fmtRs(inv?.udhaar_amount || 0)}</span></div>
      </div>
    </div>

    <div class="review-strip">🙏 धन्यवाद किसान भाई! Google Review देकर हमें और किसानों तक पहुंचाने में मदद करें.</div>

    <div class="sign-row">
      <div class="sign">Customer Signature</div>
      <div class="sign">Checked By</div>
      <div class="sign">For Annadata Agri & Seeds</div>
    </div>

    <div class="footer">
      🌾 Annadata Agri & Seeds — सलामतपुर, रायसेन | Call/WhatsApp: 6261737388 / 9691712455<br/>
      असली माल • सही सलाह • किसान भाई का भरोसा
    </div>
  </div>
</body></html>`;
}


function openPrintWindow(inv: any, items: CartItem[]) {
  const win = window.open("", "_blank", "width=1100,height=850,toolbar=0,scrollbars=1");
  if (!win) { alert("Popup blocked! Please allow popups for printing."); return; }
  win.document.write(generatePrintHTML(inv, items));
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

/* ══════════════════════════ Main Component ══════════════════════════ */
export default function AdminBilling() {
  const [isNewRoute] = useRoute("/admin/billing/new");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"new" | "list">(isNewRoute ? "new" : "list");

  /* ── Data ── */
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);

  /* ── New bill form ── */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [prodSearch, setProdSearch] = useState("");
  const [showProdDropdown, setShowProdDropdown] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerVillage, setCustomerVillage] = useState("");
  const [customerCrop, setCustomerCrop] = useState("");
  const [payMode, setPayMode] = useState<PayMode>("cash");
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [payStatus, setPayStatus] = useState<"paid" | "udhaar" | "partial">("paid");
  const [billNotes, setBillNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  /* ── Bill list filters ── */
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchInvoices();
    fetchCustomerCount();
    if (isNewRoute) setActiveTab("new");
  }, [isNewRoute]);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("id, name, unit, selling_price, current_stock, low_stock_limit, category")
      .eq("is_active", true)
      .order("name");
    setAllProducts(data || []);
  }

  async function fetchInvoices() {
    setListLoading(true);
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    setInvoices(data || []);
    setListLoading(false);
  }

  async function fetchCustomerCount() {
    const { count } = await supabase.from("customers").select("id", { count: "exact", head: true });
    setTotalCustomers(count || 0);
  }

  /* ── Dashboard stats (computed from invoices) ── */
  const todayInvoices = invoices.filter(i => i.created_at?.slice(0, 10) === todayStr());
  const todaySales = todayInvoices.reduce((s, i) => s + Number(i.final_amount), 0);
  const totalUdhaar = invoices.reduce((s, i) => s + Number(i.udhaar_amount), 0);

  /* ── Cart helpers ── */
  const prodDropdownList = allProducts.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) &&
    !cart.find(c => c.product_id === p.id)
  );

  function addToCart(p: any) {
    setCart(c => [...c, {
      product_id: p.id, name: p.name,
      category: p.category || "",
      unit: p.unit,
      current_stock: Number(p.current_stock),
      quantity: 1, selling_price: Number(p.selling_price), discount: 0
    }]);
    setProdSearch(""); setShowProdDropdown(false);
  }

  function removeFromCart(pid: string) {
    setCart(c => c.filter(i => i.product_id !== pid));
  }

  function updateCartItem(pid: string, field: keyof CartItem, val: number) {
    setCart(c => c.map(i => i.product_id === pid ? { ...i, [field]: Math.max(0, val) } : i));
  }

  const subtotal = cart.reduce((s, i) => s + (i.selling_price * i.quantity) - i.discount, 0);
  const finalAmount = Math.max(0, subtotal - extraDiscount);
  const actualPaid = payStatus === "paid" ? finalAmount : payStatus === "udhaar" ? 0 : paidAmount;
  const udhaarAmount = Math.max(0, finalAmount - actualPaid);

  /* ── Save bill ── */
  async function saveBill() {
    if (!customerName.trim()) return setSaveError("ग्राहक का नाम लिखें!");
    if (cart.length === 0) return setSaveError("कम से कम एक प्रोडक्ट जोड़ें!");
    setSaveError(""); setSaving(true);
    const invNum = makeInvoiceNumber();
    const combinedNotes = buildNotes(payMode, customerCrop, billNotes);

    const { data: inv, error: invErr } = await supabase.from("invoices").insert([{
      invoice_number: invNum,
      customer_name: customerName.trim(),
      customer_mobile: customerMobile.trim(),
      customer_village: customerVillage.trim(),
      total_amount: subtotal,
      discount: extraDiscount,
      final_amount: finalAmount,
      paid_amount: actualPaid,
      udhaar_amount: udhaarAmount,
      payment_status: payStatus,
      notes: combinedNotes || null,
      created_by: user?.email || "admin"
    }]).select().single();

    if (invErr || !inv) {
      setSaveError("बिल सेव नहीं हुआ: " + (invErr?.message || "Unknown error"));
      setSaving(false); return;
    }

    await supabase.from("invoice_items").insert(
      cart.map(i => ({
        invoice_id: inv.id, product_id: i.product_id, product_name: i.name,
        quantity: i.quantity, unit: i.unit, selling_price: i.selling_price,
        discount: i.discount, total: (i.selling_price * i.quantity) - i.discount
      }))
    );

    for (const item of cart) {
      const newStock = Math.max(0, item.current_stock - item.quantity);
      await supabase.from("products").update({
        current_stock: newStock, updated_at: new Date().toISOString()
      }).eq("id", item.product_id);
      await supabase.from("stock_movements").insert([{
        product_id: item.product_id, movement_type: "out",
        quantity: item.quantity, previous_stock: item.current_stock, new_stock: newStock,
        notes: `बिल: ${invNum}`, created_by: user?.email || "admin"
      }]);
    }

    if (customerMobile.trim()) {
      const { data: existing } = await supabase.from("customers")
        .select("id, total_purchase, total_udhaar").eq("mobile", customerMobile.trim()).maybeSingle();
      if (existing) {
        await supabase.from("customers").update({
          total_purchase: Number(existing.total_purchase) + finalAmount,
          total_udhaar: Number(existing.total_udhaar) + udhaarAmount,
          updated_at: new Date().toISOString()
        }).eq("id", existing.id);
      } else {
        await supabase.from("customers").insert([{
          name: customerName.trim(), mobile: customerMobile.trim(),
          village: customerVillage.trim(), total_purchase: finalAmount, total_udhaar: udhaarAmount
        }]);
      }
    }

    /* Save a snapshot of cart+inv for immediate print */
    const savedItems = [...cart];
    const savedInv = { ...inv };

    setCart([]); setCustomerName(""); setCustomerMobile(""); setCustomerVillage("");
    setCustomerCrop(""); setExtraDiscount(0); setPaidAmount(0);
    setBillNotes(""); setPayStatus("paid"); setPayMode("cash");
    setSaving(false);
    fetchInvoices(); fetchProducts(); fetchCustomerCount();
    setActiveTab("list");
    if (isNewRoute) setLocation("/admin/billing");

    /* Auto-open print window for freshly saved bill */
    openPrintWindow(savedInv, savedItems);
  }

  /* ── Print from bill list ── */
  async function handlePrintFromList(inv: any) {
    const { data: dbItems } = await supabase.from("invoice_items").select("*").eq("invoice_id", inv.id);
    const cartItems: CartItem[] = (dbItems || []).map((it: any) => ({
      product_id: it.product_id, name: it.product_name,
      category: "", unit: it.unit,
      current_stock: 0, quantity: it.quantity,
      selling_price: it.selling_price, discount: it.discount
    }));
    openPrintWindow(inv, cartItems);
  }

  /* ── PDF generation ── */
  async function generatePDF(inv: any) {
    const { data: dbItems } = await supabase.from("invoice_items").select("*").eq("invoice_id", inv.id);
    const { mode, crop, note } = parseMeta(inv?.notes);

    const doc = new jsPDF({ format: "a5", unit: "mm" });
    const W = 148; const cx = W / 2;

    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, W, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text("ANNADATA AGRI & SEEDS", cx, 9, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("Salamatpur, Raisen, MP  |  Ph: 6261737388 / 9691712455", cx, 14, { align: "center" });
    doc.text("Keshav Meena (Farmer Advisor)  |  Google: 4.9 Stars", cx, 19, { align: "center" });
    doc.setFillColor(249, 168, 37); doc.rect(0, 24, W, 2, "F");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(`Bill No: ${inv.invoice_number}`, 8, 33);
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString("en-IN")}`, W - 8, 33, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text(`Customer: ${inv.customer_name}`, 8, 39);
    if (inv.customer_mobile) doc.text(`Mobile: ${inv.customer_mobile}`, 8, 44);
    if (inv.customer_village) doc.text(`Village: ${inv.customer_village}`, W - 8, 39, { align: "right" });
    if (crop) doc.text(`Crop: ${crop}`, W - 8, 44, { align: "right" });
    if (mode) doc.text(`Payment: ${mode.toUpperCase()}`, 8, 49);

    autoTable(doc, {
      startY: 54,
      head: [["#", "Product", "Category", "Qty", "Unit", "Rate", "Disc", "Total"]],
      body: (dbItems || []).map((item: any, i: number) => [
        i + 1, item.product_name, "",
        item.quantity, item.unit,
        `Rs.${item.selling_price}`,
        item.discount > 0 ? `Rs.${item.discount}` : "-",
        `Rs.${item.total}`
      ]),
      styles: { fontSize: 7, cellPadding: 1.8 },
      headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [249, 251, 250] },
      columnStyles: { 1: { cellWidth: 35 }, 2: { cellWidth: 22 } }
    });

    const y = (doc as any).lastAutoTable.finalY + 4;
    doc.setFillColor(240, 253, 244); doc.rect(W - 62, y - 1, 54, 30, "F");
    doc.setDrawColor(22, 101, 52); doc.rect(W - 62, y - 1, 54, 30, "S");
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text(`Subtotal:  Rs.${Number(inv.total_amount).toLocaleString("en-IN")}`, W - 10, y + 4, { align: "right" });
    if (Number(inv.discount) > 0)
      doc.text(`Discount: -Rs.${Number(inv.discount).toLocaleString("en-IN")}`, W - 10, y + 9, { align: "right" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(`TOTAL:  Rs.${Number(inv.final_amount).toLocaleString("en-IN")}`, W - 10, y + 16, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(21, 128, 61);
    doc.text(`Paid:   Rs.${Number(inv.paid_amount).toLocaleString("en-IN")}`, W - 10, y + 22, { align: "right" });
    if (Number(inv.udhaar_amount) > 0) {
      doc.setTextColor(185, 28, 28);
      doc.text(`Udhaar: Rs.${Number(inv.udhaar_amount).toLocaleString("en-IN")}`, W - 10, y + 28, { align: "right" });
    }
    if (note) {
      doc.setTextColor(100, 100, 100); doc.setFontSize(7);
      doc.text(`Note: ${note}`, 8, y + 8);
    }

    doc.setTextColor(0, 0, 0);
    const fy = y + 36;
    doc.setFillColor(22, 101, 52); doc.rect(0, fy, W, 10, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "italic");
    doc.text("Dhanyawad Kisan Bhai! Jai Kisan  |  Annadata Agri & Seeds", cx, fy + 6, { align: "center" });

    doc.save(`bill_${inv.invoice_number}.pdf`);
  }

  /* ── WhatsApp share ── */
  function shareWhatsApp(inv: any) {
    const { mode, crop, note } = parseMeta(inv?.notes);
    const lines = [
      `*🌿 अन्नदाता एग्री & सीड्स*`,
      `📍 सलामतपुर, रायसेन | 📞 6261737388`,
      ``,
      `*📋 बिल नं: ${inv.invoice_number}*`,
      `👤 ग्राहक: ${inv.customer_name}`,
      inv.customer_village ? `🏘️ गांव: ${inv.customer_village}` : "",
      crop ? `🌾 फसल: ${crop}` : "",
      `📅 तारीख: ${new Date(inv.created_at).toLocaleDateString("hi-IN")}`,
      mode ? `💳 भुगतान: ${mode.toUpperCase()}` : "",
      ``,
      `💰 *कुल राशि: ${fmtRs(inv.final_amount)}*`,
      `✅ जमा राशि: ${fmtRs(inv.paid_amount)}`,
      Number(inv.udhaar_amount) > 0 ? `📒 बाकी राशि: ${fmtRs(inv.udhaar_amount)}` : "",
      note ? `📝 नोट: ${note}` : "",
      ``,
      `_🙏 धन्यवाद! आपकी सेवा में सदैव तत्पर — Annadata Agri & Seeds_`
    ].filter(Boolean).join("\n");
    const num = inv.customer_mobile ? `91${inv.customer_mobile}` : "";
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(lines)}`, "_blank");
  }

  /* ── Excel Export ── */
  function exportSales() {
    const rows = filteredInvoices.map(i => {
      const { mode, crop, note } = parseMeta(i.notes);
      return {
        बिल_नं: i.invoice_number, ग्राहक: i.customer_name,
        मोबाइल: i.customer_mobile, गांव: i.customer_village, फसल: crop,
        भुगतान_तरीका: mode.toUpperCase(),
        कुल: i.final_amount, जमा: i.paid_amount, उधार: i.udhaar_amount,
        स्थिति: i.payment_status === "paid" ? "पेड" : i.payment_status === "udhaar" ? "उधार" : "आंशिक",
        तारीख: new Date(i.created_at).toLocaleDateString("hi-IN"),
        नोट: note
      };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "बिल सूची");
    XLSX.writeFile(wb, `annadata_sales_${todayStr()}.xlsx`);
  }

  /* ── Filtered list ── */
  const filteredInvoices = invoices.filter(inv => {
    const q = invoiceSearch.toLowerCase();
    const matchSearch = !q ||
      inv.customer_name.toLowerCase().includes(q) ||
      (inv.invoice_number || "").toLowerCase().includes(q) ||
      (inv.customer_village || "").toLowerCase().includes(q) ||
      (inv.customer_mobile || "").includes(q);
    const dateStr = inv.created_at?.slice(0, 10) || "";
    return matchSearch &&
      (!filterFrom || dateStr >= filterFrom) &&
      (!filterTo || dateStr <= filterTo);
  });

  /* ══════════════════════ Render ══════════════════════ */
  return (
    <div className="space-y-4">

      {/* ─── Dashboard Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <Receipt className="w-5 h-5 text-green-700" />, bg: "bg-green-100", val: todayInvoices.length, label: "आज के बिल" },
          { icon: <TrendingUp className="w-5 h-5 text-yellow-700" />, bg: "bg-yellow-100", val: fmtRs(todaySales), label: "आज की बिक्री" },
          { icon: <AlertCircle className="w-5 h-5 text-orange-600" />, bg: "bg-orange-100", val: fmtRs(totalUdhaar), label: "कुल उधार बाकी" },
          { icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-100", val: totalCustomers, label: "कुल ग्राहक" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xl font-black text-gray-800">{card.val}</p>
              <p className="text-xs font-hindi text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-hindi">बिलिंग</h2>
        {activeTab === "list" && (
          <button onClick={exportSales}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-hindi hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
        )}
      </div>

      {/* ─── Tab selector ─── */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all ${activeTab === "new" ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
          + नया बिल
        </button>
        <button onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg text-sm font-hindi transition-all ${activeTab === "list" ? "bg-white text-green-700 font-bold shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
          बिल सूची ({invoices.length})
        </button>
      </div>

      {/* ══════════════ NEW BILL TAB ══════════════ */}
      {activeTab === "new" && (
        <div className="space-y-4">

          {/* Bill date banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="font-hindi text-green-800 text-sm font-semibold">नया बिल</span>
            <span className="ml-auto text-xs text-green-600">
              {new Date().toLocaleDateString("hi-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>

          {/* ─── Customer ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-gray-700 font-hindi text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" /> ग्राहक जानकारी
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="ग्राहक का नाम *"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />
              <input value={customerMobile} onChange={e => setCustomerMobile(e.target.value)}
                placeholder="मोबाइल नंबर" type="tel"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <input value={customerVillage} onChange={e => setCustomerVillage(e.target.value)}
                placeholder="गांव का नाम"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />
              <select value={customerCrop} onChange={e => setCustomerCrop(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi text-gray-700 bg-white">
                <option value="">🌾 फसल चुनें</option>
                <option value="धान">🌾 धान</option>
                <option value="गेहूं">🌿 गेहूं</option>
                <option value="सोयाबीन">🫘 सोयाबीन</option>
                <option value="चना">🟤 चना</option>
                <option value="मक्का">🌽 मक्का</option>
                <option value="अन्य">अन्य</option>
              </select>
            </div>
          </div>

          {/* ─── Products (with category column) ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 font-hindi text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" /> प्रोडक्ट ({cart.length})
              </h3>
              <button onClick={() => setShowProdDropdown(v => !v)}
                className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-hindi hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" /> प्रोडक्ट जोड़ें
              </button>
            </div>

            {showProdDropdown && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input autoFocus value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                  placeholder="प्रोडक्ट खोजें (नाम / केटेगरी)..."
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-green-400 rounded-xl text-sm focus:outline-none font-hindi" />
                {prodSearch && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 mt-1 max-h-52 overflow-y-auto z-30">
                    {prodDropdownList.length === 0
                      ? <p className="px-4 py-3 text-gray-400 text-sm font-hindi">कोई प्रोडक्ट नहीं मिला</p>
                      : prodDropdownList.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)}
                          className="w-full text-left px-4 py-3 hover:bg-green-50 border-b last:border-0 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-hindi font-semibold text-gray-800 text-sm">{p.name}</span>
                            <span className="text-green-700 font-bold text-sm">₹{p.selling_price}/{p.unit}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-gray-400 text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.category}</span>
                            <span className={`text-xs font-semibold ${Number(p.current_stock) <= Number(p.low_stock_limit) ? "text-red-500" : "text-gray-400"}`}>
                              स्टॉक: {p.current_stock} {p.unit}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {cart.length === 0
              ? <p className="text-center text-gray-400 font-hindi py-8 text-sm">ऊपर "+ प्रोडक्ट जोड़ें" दबाएं</p>
              : (
                <>
                  {/* Table header */}
                  <div className="hidden sm:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto_auto] gap-2 px-3 py-1.5 bg-green-50 rounded-lg text-xs font-hindi font-bold text-green-800">
                    <span>प्रोडक्ट</span>
                    <span>केटेगरी</span>
                    <span className="text-center">मात्रा</span>
                    <span className="text-center">रेट (₹)</span>
                    <span className="text-center">छूट (₹)</span>
                    <span className="text-right">कुल (₹)</span>
                    <span></span>
                  </div>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.product_id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        {/* Mobile: stacked layout */}
                        <div className="flex items-center justify-between sm:hidden">
                          <div>
                            <p className="font-hindi font-semibold text-gray-800 text-sm">{item.name}</p>
                            {item.category && <p className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">{item.category}</p>}
                          </div>
                          <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 p-0.5">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Desktop: row layout */}
                        <div className="hidden sm:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto_auto] gap-2 items-center">
                          <p className="font-hindi font-semibold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category || "—"}</p>
                          <input type="number" min="1" value={item.quantity}
                            onChange={e => updateCartItem(item.product_id, "quantity", Number(e.target.value))}
                            className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                          <input type="number" min="0" value={item.selling_price}
                            onChange={e => updateCartItem(item.product_id, "selling_price", Number(e.target.value))}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                          <input type="number" min="0" value={item.discount}
                            onChange={e => updateCartItem(item.product_id, "discount", Number(e.target.value))}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                          <p className="font-bold text-green-700 text-sm text-right w-20">
                            ₹{((item.selling_price * item.quantity) - item.discount).toLocaleString("en-IN")}
                          </p>
                          <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 p-0.5">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Mobile: inputs */}
                        <div className="grid grid-cols-3 gap-2 mt-2 sm:hidden">
                          <div>
                            <p className="text-xs text-gray-400 font-hindi mb-1">मात्रा ({item.unit})</p>
                            <input type="number" min="1" value={item.quantity}
                              onChange={e => updateCartItem(item.product_id, "quantity", Number(e.target.value))}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-hindi mb-1">रेट (₹)</p>
                            <input type="number" min="0" value={item.selling_price}
                              onChange={e => updateCartItem(item.product_id, "selling_price", Number(e.target.value))}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-hindi mb-1">छूट (₹)</p>
                            <input type="number" min="0" value={item.discount}
                              onChange={e => updateCartItem(item.product_id, "discount", Number(e.target.value))}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-green-500" />
                          </div>
                        </div>
                        <p className="text-right text-sm font-bold text-green-700 mt-1.5 font-hindi sm:hidden">
                          = ₹{((item.selling_price * item.quantity) - item.discount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* ─── Payment ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-bold text-gray-700 font-hindi text-base flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-green-600" /> भुगतान
            </h3>

            {/* Totals */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-hindi text-gray-600">उप-कुल</span>
                <span className="font-bold text-gray-800">{fmtRs(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-hindi text-gray-600">अतिरिक्त छूट (₹)</span>
                <input type="number" min="0" max={subtotal} value={extraDiscount}
                  onChange={e => setExtraDiscount(Number(e.target.value))}
                  className="w-28 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="font-hindi font-bold text-gray-800 text-base">कुल राशि</span>
                <span className="font-bold text-green-700 text-2xl">{fmtRs(finalAmount)}</span>
              </div>
            </div>

            {/* Payment Mode: Cash / UPI / Credit */}
            <div>
              <p className="text-sm font-semibold text-gray-700 font-hindi mb-2">💳 भुगतान का तरीका</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { v: "cash" as PayMode, l: "💵 नकद (Cash)" },
                  { v: "upi" as PayMode, l: "📱 UPI" },
                  { v: "credit" as PayMode, l: "🏦 क्रेडिट / Online" },
                ].map(opt => (
                  <button key={opt.v} onClick={() => setPayMode(opt.v)}
                    className={`px-4 py-2 rounded-xl text-sm font-hindi font-bold border-2 transition-all ${payMode === opt.v ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Status */}
            <div>
              <p className="text-sm font-semibold text-gray-700 font-hindi mb-2">📋 भुगतान स्थिति</p>
              <div className="flex gap-2">
                {[
                  { v: "paid" as const, l: "✅ पूरा पेड" },
                  { v: "udhaar" as const, l: "📒 पूरा उधार" },
                  { v: "partial" as const, l: "💰 आंशिक" }
                ].map(opt => (
                  <button key={opt.v} onClick={() => setPayStatus(opt.v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-hindi font-bold border-2 transition-all ${payStatus === opt.v ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {payStatus === "partial" && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-hindi text-gray-600">जमा राशि (₹)</span>
                <input type="number" min="0" max={finalAmount} value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-28 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500" />
              </div>
            )}

            {udhaarAmount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <span className="font-hindi text-orange-700 font-bold">📒 बाकी राशि: {fmtRs(udhaarAmount)}</span>
              </div>
            )}

            <input value={billNotes} onChange={e => setBillNotes(e.target.value)}
              placeholder="📝 कोई नोट (वैकल्पिक)..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-hindi" />

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-hindi text-center">
                {saveError}
              </div>
            )}

            <button onClick={saveBill} disabled={saving}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-hindi font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:opacity-60 shadow-lg transition-all">
              {saving ? "⏳ बिल बन रहा है..." : "✅ बिल सेव करें"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ BILL LIST TAB ══════════════ */}
      {activeTab === "list" && (
        <div className="space-y-3">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)}
              placeholder="नाम, बिल नंबर, गांव, मोबाइल..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-hindi" />
          </div>

          {/* Date range filter */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500" />
            <span className="text-gray-400 text-xs flex-shrink-0">से</span>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500" />
            {(filterFrom || filterTo) && (
              <button onClick={() => { setFilterFrom(""); setFilterTo(""); }}
                className="text-xs text-red-500 font-hindi hover:underline flex-shrink-0 flex items-center gap-0.5">
                <X className="w-3.5 h-3.5" /> हटाएं
              </button>
            )}
            <span className="text-xs text-gray-500 font-hindi flex-shrink-0">{filteredInvoices.length} बिल</span>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInvoices.map((inv: any) => {
                const { mode, crop } = parseMeta(inv.notes);
                return (
                  <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 font-hindi truncate">{inv.customer_name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-gray-400 text-xs font-mono">{inv.invoice_number}</span>
                          {inv.customer_village && <span className="text-gray-400 text-xs font-hindi">• {inv.customer_village}</span>}
                          {crop && <span className="text-xs text-green-600 font-hindi">🌾 {crop}</span>}
                          <span className="text-gray-400 text-xs">• {new Date(inv.created_at).toLocaleDateString("hi-IN")}</span>
                          {mode && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold">{mode.toUpperCase()}</span>}
                        </div>
                        {inv.customer_mobile && (
                          <a href={`tel:${inv.customer_mobile}`}
                            className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold mt-1 hover:text-green-700">
                            <Phone className="w-3 h-3" /> {inv.customer_mobile}
                          </a>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-800">{fmtRs(inv.final_amount)}</p>
                        {Number(inv.udhaar_amount) > 0 && (
                          <p className="text-orange-600 text-xs font-hindi font-semibold">बाकी {fmtRs(inv.udhaar_amount)}</p>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-hindi font-bold mt-0.5 inline-block ${
                          inv.payment_status === "paid" ? "bg-green-100 text-green-700" :
                          inv.payment_status === "udhaar" ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {inv.payment_status === "paid" ? "पेड" : inv.payment_status === "udhaar" ? "उधार" : "आंशिक"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handlePrintFromList(inv)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 py-2 rounded-xl text-xs font-hindi font-semibold hover:bg-green-100 transition-colors">
                        <Printer className="w-3.5 h-3.5" /> प्रिंट
                      </button>
                      <button onClick={() => generatePDF(inv)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-hindi font-semibold hover:bg-blue-100 transition-colors">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button onClick={() => shareWhatsApp(inv)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-xs font-hindi font-semibold hover:bg-emerald-100 transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      {inv.customer_mobile && (
                        <a href={`tel:${inv.customer_mobile}`}
                          className="flex items-center justify-center bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredInvoices.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-hindi">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{invoiceSearch || filterFrom || filterTo ? "कोई बिल नहीं मिला" : "अभी कोई बिल नहीं"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
