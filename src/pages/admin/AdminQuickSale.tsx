import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useLang";
import { useAuth } from "@/hooks/useAuth";
import { Search, Plus, Minus, Trash2, CheckCircle, Printer, MessageCircle, X } from "lucide-react";

interface CartItem {
  product_id: string; name: string; unit: string;
  quantity: number; selling_price: number; total: number;
}

function makeInvNum() {
  const d = new Date();
  return `QS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(Math.random()*9000)+1000}`;
}

export default function AdminQuickSale() {
  const { t } = useLang();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerVillage, setCustomerVillage] = useState("");
  const [payStatus, setPayStatus] = useState<"paid"|"udhaar">("paid");
  const [saving, setSaving] = useState(false);
  const [savedInv, setSavedInv] = useState<any>(null);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("products").select("id,name,unit,selling_price,current_stock,category,crop_type")
      .eq("is_active", true).order("name").then(({ data }) => setProducts(data || []));
    searchRef.current?.focus();
  }, []);

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.crop_type.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(p: any) {
    setCart(prev => {
      const ex = prev.find(c => c.product_id === p.id);
      if (ex) return prev.map(c => c.product_id === p.id
        ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.selling_price }
        : c);
      return [...prev, { product_id: p.id, name: p.name, unit: p.unit, quantity: 1, selling_price: Number(p.selling_price), total: Number(p.selling_price) }];
    });
    setSearch("");
    searchRef.current?.focus();
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.product_id === id
      ? { ...c, quantity: Math.max(1, c.quantity + delta), total: Math.max(1, c.quantity + delta) * c.selling_price }
      : c).filter(c => c.quantity > 0));
  }

  function updatePrice(id: string, price: number) {
    setCart(prev => prev.map(c => c.product_id === id
      ? { ...c, selling_price: price, total: c.quantity * price } : c));
  }

  function removeFromCart(id: string) { setCart(prev => prev.filter(c => c.product_id !== id)); }

  const totalAmount = cart.reduce((s, c) => s + c.total, 0);

  async function saveBill() {
    if (cart.length === 0) { setError("कार्ट में कुछ जोड़ें"); return; }
    if (!customerName.trim()) { setError("ग्राहक का नाम जरूरी है"); return; }
    setSaving(true); setError("");
    const invNum = makeInvNum();
    const udhaarAmt = payStatus === "udhaar" ? totalAmount : 0;
    const paidAmt = payStatus === "paid" ? totalAmount : 0;

    try {
      let customerId: string | null = null;
      if (customerMobile) {
        const { data: existing } = await supabase.from("customers").select("id,total_udhaar,total_purchase")
          .eq("mobile", customerMobile).maybeSingle();
        if (existing) {
          customerId = existing.id;
          await supabase.from("customers").update({
            total_udhaar: Number(existing.total_udhaar) + udhaarAmt,
            total_purchase: Number(existing.total_purchase) + totalAmount,
            last_purchase_date: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString()
          }).eq("id", existing.id);
        } else {
          const { data: newCust } = await supabase.from("customers").insert([{
            name: customerName, mobile: customerMobile, village: customerVillage,
            total_purchase: totalAmount, total_udhaar: udhaarAmt,
            last_purchase_date: new Date().toISOString().split("T")[0]
          }]).select("id").single();
          customerId = newCust?.id || null;
        }
      }

      const { data: inv, error: invErr } = await supabase.from("invoices").insert([{
        invoice_number: invNum, customer_id: customerId,
        customer_name: customerName, customer_mobile: customerMobile,
        customer_village: customerVillage, total_amount: totalAmount,
        discount: 0, final_amount: totalAmount, paid_amount: paidAmt,
        udhaar_amount: udhaarAmt, payment_status: payStatus,
        created_by: user?.email || "admin"
      }]).select().single();

      if (invErr) throw invErr;

      await supabase.from("invoice_items").insert(cart.map(c => ({
        invoice_id: inv.id, product_id: c.product_id, product_name: c.name,
        quantity: c.quantity, unit: c.unit, selling_price: c.selling_price,
        discount: 0, total: c.total
      })));

      await Promise.all(cart.map(async c => {
        const { data: prod } = await supabase.from("products").select("current_stock").eq("id", c.product_id).single();
        if (prod) {
          const newStock = Math.max(0, Number(prod.current_stock) - c.quantity);
          await supabase.from("products").update({ current_stock: newStock }).eq("id", c.product_id);
          await supabase.from("stock_movements").insert([{
            product_id: c.product_id, movement_type: "out",
            quantity: c.quantity, previous_stock: prod.current_stock,
            new_stock: newStock, notes: `बिल ${invNum}`, created_by: user?.email || "admin"
          }]);
        }
      }));

      setSavedInv({ ...inv, items: cart, customer_name: customerName, customer_mobile: customerMobile, customer_village: customerVillage });
      setCart([]); setCustomerName(""); setCustomerMobile(""); setCustomerVillage("");
    } catch (e: any) {
      setError(e.message || t("errorMsg"));
    } finally { setSaving(false); }
  }

  function printBill() {
    if (!savedInv) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Bill - ${savedInv.invoice_number}</title>
      <style>body{font-family:sans-serif;max-width:350px;margin:auto;padding:16px;font-size:13px}
      h2{text-align:center;margin:0}p{margin:2px 0}.line{border-top:1px dashed #000;margin:8px 0}
      table{width:100%;border-collapse:collapse}td{padding:3px 2px}
      .right{text-align:right}.bold{font-weight:bold}.center{text-align:center}</style></head>
      <body>
      <h2>🌿 अन्नदाता एग्री & सीड्स</h2>
      <p class="center">सलामतपुर, रायसेन | 📞 6261737388 / 9691712455</p>
      <div class="line"></div>
      <p><b>बिल नं:</b> ${savedInv.invoice_number}</p>
      <p><b>ग्राहक:</b> ${savedInv.customer_name}</p>
      ${savedInv.customer_village ? `<p><b>गांव:</b> ${savedInv.customer_village}</p>` : ""}
      <p><b>तारीख:</b> ${new Date().toLocaleDateString("hi-IN")}</p>
      <div class="line"></div>
      <table><tr><td class="bold">प्रोडक्ट</td><td class="bold right">मात्रा</td><td class="bold right">दाम</td><td class="bold right">कुल</td></tr>
      ${savedInv.items.map((i: CartItem) => `<tr><td>${i.name}</td><td class="right">${i.quantity} ${i.unit}</td><td class="right">₹${i.selling_price}</td><td class="right">₹${i.total}</td></tr>`).join("")}
      </table>
      <div class="line"></div>
      <p class="bold right">कुल: ₹${totalAmount.toLocaleString("en-IN")}</p>
      <p class="bold right">${savedInv.payment_status === "paid" ? "✅ पेड" : "🔴 उधार"}</p>
      <div class="line"></div>
      <p class="center">धन्यवाद! 🙏 — केशव भाई</p>
      </body></html>`);
    win.print();
  }

  function whatsappBill() {
    if (!savedInv) return;
    const items = savedInv.items.map((i: CartItem) => `• ${i.name}: ${i.quantity} ${i.unit} × ₹${i.selling_price} = ₹${i.total}`).join("\n");
    const msg = `🌿 *अन्नदाता एग्री & सीड्स*\nसलामतपुर, रायसेन | 📞 6261737388\n\n*बिल: ${savedInv.invoice_number}*\nग्राहक: ${savedInv.customer_name}\n\n${items}\n\n*कुल: ₹${totalAmount.toLocaleString("en-IN")}*\n${savedInv.payment_status === "paid" ? "✅ पूरा पेड" : "🔴 उधार"}\n\nधन्यवाद! 🙏`;
    const phone = savedInv.customer_mobile ? `91${savedInv.customer_mobile}` : "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 font-hindi">{t("quickSaleTitle")} ⚡</h1>

      {savedInv && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-green-800 font-hindi font-bold text-lg">{t("billCreated")}</p>
            <button onClick={() => setSavedInv(null)} className="p-1 hover:bg-green-100 rounded-lg"><X className="w-5 h-5 text-green-600" /></button>
          </div>
          <p className="text-green-700 font-hindi text-sm mb-4">बिल नं: <strong>{savedInv.invoice_number}</strong> | कुल: <strong>₹{totalAmount.toLocaleString("en-IN")}</strong></p>
          <div className="flex gap-3">
            <button onClick={printBill} className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-green-400 text-green-700 py-3 rounded-xl font-hindi font-bold hover:bg-green-50 transition-colors">
              <Printer className="w-5 h-5" /> {t("printBill")}
            </button>
            <button onClick={whatsappBill} className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-hindi font-bold hover:opacity-90 transition-opacity">
              <MessageCircle className="w-5 h-5" /> {t("whatsappBill")}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t("searchProduct")}
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-green-200 focus:border-green-500 rounded-xl outline-none font-hindi" />
            </div>
            {search && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-gray-400 font-hindi py-4 text-center col-span-2">कोई प्रोडक्ट नहीं मिला</p>
                ) : filtered.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="flex items-center justify-between bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl px-4 py-3 text-left transition-colors">
                    <div>
                      <p className="font-hindi font-bold text-gray-800 text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs font-hindi">{p.category} | {p.unit} | स्टॉक: {p.current_stock}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-green-700">₹{p.selling_price}</p>
                      <Plus className="w-4 h-4 text-green-600 mx-auto mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!search && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {products.slice(0, 9).map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl px-3 py-3 text-left transition-colors">
                    <p className="font-hindi text-gray-700 text-xs font-medium leading-tight">{p.name}</p>
                    <p className="font-bold text-green-700 text-sm mt-1">₹{p.selling_price}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-gray-700 font-hindi">{t("customerDetails")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder={`${t("customerName")} *`}
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-base font-hindi outline-none" />
              <input value={customerMobile} onChange={e => setCustomerMobile(e.target.value)}
                placeholder={t("customerMobile")} type="tel"
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-base font-hindi outline-none" />
              <input value={customerVillage} onChange={e => setCustomerVillage(e.target.value)}
                placeholder={t("customerVillage")}
                className="border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 text-base font-hindi outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
          <h3 className="font-bold text-gray-700 font-hindi text-lg mb-3 flex items-center gap-2">
            🛒 {t("cart")} ({cart.length})
          </h3>
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-300 font-hindi text-center text-lg">{t("emptyCart")}<br/>👆 ऊपर से प्रोडक्ट जोड़ें</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto max-h-80">
              {cart.map(c => (
                <div key={c.product_id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-hindi font-medium text-gray-800 text-sm leading-tight">{c.name}</p>
                    <button onClick={() => removeFromCart(c.product_id)} className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(c.product_id, -1)} className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center font-bold hover:bg-red-200">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-800">{c.quantity}</span>
                      <button onClick={() => updateQty(c.product_id, 1)} className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold hover:bg-green-200">
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-gray-400 text-xs ml-1">{c.unit}</span>
                    </div>
                    <div className="text-right">
                      <input type="number" value={c.selling_price} onChange={e => updatePrice(c.product_id, Number(e.target.value))}
                        className="w-16 text-right border border-gray-200 rounded-lg px-1 py-0.5 text-xs text-green-700 font-bold" />
                      <p className="font-bold text-gray-800 text-sm">₹{c.total.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-hindi font-bold text-gray-700 text-lg">{t("total")}</span>
              <span className="text-2xl font-bold text-green-700">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPayStatus("paid")}
                className={`py-4 rounded-xl font-hindi font-bold text-sm transition-all ${payStatus === "paid" ? "bg-green-600 text-white shadow-lg scale-[1.02]" : "bg-gray-100 text-gray-600 hover:bg-green-50"}`}>
                ✅ {t("paid")}
              </button>
              <button onClick={() => setPayStatus("udhaar")}
                className={`py-4 rounded-xl font-hindi font-bold text-sm transition-all ${payStatus === "udhaar" ? "bg-orange-500 text-white shadow-lg scale-[1.02]" : "bg-gray-100 text-gray-600 hover:bg-orange-50"}`}>
                🔴 {t("udhaar")}
              </button>
            </div>
            {error && <p className="text-red-600 text-sm font-hindi text-center">{error}</p>}
            <button onClick={saveBill} disabled={saving || cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-hindi font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {saving ? "बन रहा है..." : t("createBill")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
