-- ============================================================
--  Kisan Information Center — Supabase Table Setup
--  Run this in your Supabase project → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS kisan_info (
  id            TEXT        PRIMARY KEY,
  emoji         TEXT        NOT NULL DEFAULT '🌱',
  name_hi       TEXT        NOT NULL,
  name_en       TEXT        NOT NULL DEFAULT '',
  color         TEXT        NOT NULL DEFAULT '#4CAF50',
  symptoms      TEXT[]      NOT NULL DEFAULT '{}',
  how_to_identify TEXT      NOT NULL DEFAULT '',
  causes        TEXT[]      NOT NULL DEFAULT '{}',
  expected_loss TEXT        NOT NULL DEFAULT '',
  expert_note   TEXT        NOT NULL DEFAULT '',
  category      TEXT        NOT NULL DEFAULT 'general',
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  sort_order    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_kisan_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kisan_info_updated_at ON kisan_info;
CREATE TRIGGER trg_kisan_info_updated_at
  BEFORE UPDATE ON kisan_info
  FOR EACH ROW EXECUTE FUNCTION update_kisan_info_updated_at();

-- Enable Row Level Security
ALTER TABLE kisan_info ENABLE ROW LEVEL SECURITY;

-- ─── RLS POLICIES ───────────────────────────────────────────

-- Anyone (including anonymous visitors) may read active entries
DROP POLICY IF EXISTS "Public read active kisan_info" ON kisan_info;
CREATE POLICY "Public read active kisan_info"
  ON kisan_info FOR SELECT
  USING (is_active = true);

-- Only verified admins (profiles.role = 'admin') may read ALL rows (incl. hidden)
DROP POLICY IF EXISTS "Admins can read all kisan_info" ON kisan_info;
CREATE POLICY "Admins can read all kisan_info"
  ON kisan_info FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only verified admins may insert new entries
DROP POLICY IF EXISTS "Admins can insert kisan_info" ON kisan_info;
CREATE POLICY "Admins can insert kisan_info"
  ON kisan_info FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only verified admins may update entries
DROP POLICY IF EXISTS "Admins can update kisan_info" ON kisan_info;
CREATE POLICY "Admins can update kisan_info"
  ON kisan_info FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only verified admins may delete entries
DROP POLICY IF EXISTS "Admins can delete kisan_info" ON kisan_info;
CREATE POLICY "Admins can delete kisan_info"
  ON kisan_info FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ── Seed with default data ──────────────────────────────────
INSERT INTO kisan_info (id, emoji, name_hi, name_en, color, symptoms, how_to_identify, causes, expected_loss, expert_note, sort_order) VALUES
(
  'rice-not-growing', '🌱', 'धान की ग्रोथ नहीं', 'Rice Not Growing', '#4CAF50',
  ARRAY['पौधे छोटे रह जाते हैं', 'नए पत्ते नहीं आते', 'फसल पीली या हल्की हरी दिखती है'],
  'खेत में जाकर देखें — पौधे की ऊंचाई सामान्य से कम, पत्ते पीले या हल्के हरे हों।',
  ARRAY['नाइट्रोजन की कमी', 'जड़ में कोई समस्या', 'मिट्टी में pH असंतुलन', 'अधिक जलभराव'],
  '20-40% तक पैदावार कम हो सकती है',
  'रोपाई के 15 दिन बाद भी ग्रोथ न हो तो तुरंत विशेषज्ञ से परामर्श लें।',
  1
),
(
  'poor-tillering', '🌾', 'कल्ले नहीं आना', 'Poor Tillering', '#F9A825',
  ARRAY['प्रति पौधे कल्ले बहुत कम', 'पत्ते पतले और पीले', 'पौधा कमज़ोर दिखता है'],
  'सामान्य धान में रोपाई के 30-45 दिन में 15-20 कल्ले होने चाहिए। इससे कम हो तो समस्या है।',
  ARRAY['जिंक की कमी', 'नाइट्रोजन की कमी', 'गहरी रोपाई', 'कम रोशनी या घना पानी'],
  '30-50% पैदावार प्रभावित होती है',
  'कल्ले आने की अवस्था सबसे महत्वपूर्ण है — देर से इलाज करने पर नुकसान होता है।',
  2
),
(
  'leaf-blast', '🍂', 'पत्ता झुलसा (Leaf Blast)', 'Leaf Blast', '#ef4444',
  ARRAY['पत्तों पर आँख के आकार के भूरे-सफेद धब्बे', 'धब्बों के किनारे लाल-भूरे', 'पत्ते सूखने लगते हैं'],
  'पत्तियों पर चौड़े बीच और पतले सिरे वाले धब्बे देखें। नमी में ग्रे फफूंद दिखती है।',
  ARRAY['Pyricularia oryzae फफूंद', 'अधिक नमी और ओस', 'घना पौधारोपण', 'अधिक यूरिया'],
  '10-30% उपज हानि, गभोट अवस्था में अधिक',
  'Leaf Blast दिखे तो 7-10 दिन में Neck Blast बन सकता है। तुरंत कार्रवाई जरूरी।',
  3
),
(
  'neck-blast', '🌾', 'गभोट झुलसा (Neck Blast)', 'Neck Blast', '#7E57C2',
  ARRAY['बाली की गर्दन पर भूरा-काला धब्बा', 'बाली नीचे झुक जाती है', 'दाने नहीं भरते'],
  'बाली निकलने के समय गर्दन पर गहरे भूरे रंग का घाव — बाली टूटकर झुक जाती है।',
  ARRAY['Pyricularia oryzae फफूंद', 'बाली निकलने के समय नमी', 'Leaf Blast का फैलाव'],
  '40-70% तक उपज नष्ट हो सकती है — सबसे खतरनाक अवस्था',
  'बाली निकलने से 7 दिन पहले और 7 दिन बाद निगरानी जरूरी। यह समय सबसे critical है।',
  4
),
(
  'blb', '🟡', 'BLB (जीवाणु पत्ता झुलसा)', 'Bacterial Leaf Blight', '#EF6C00',
  ARRAY['पत्ते के किनारे पीले-भूरे रंग से सूखते हैं', 'सूखापन ऊपर से शुरू होता है', 'पत्ते मुड़ते हैं'],
  'सुबह पत्तियों पर पीले रंग का चिपचिपा पदार्थ दिखे — यह bacterial exudate है।',
  ARRAY['Xanthomonas oryzae bacteria', 'तेज़ हवा और बारिश', 'खेत में पानी खड़ा रहना', 'अधिक नाइट्रोजन'],
  '20-40% उपज हानि संभव',
  'BLB को ठीक करने के लिए Copper-based या Kasugamycin जैसी दवाएं काम करती हैं।',
  5
),
(
  'bph', '🦗', 'भूरा माहू (Brown Plant Hopper)', 'Brown Plant Hopper', '#795548',
  ARRAY['पौधे के तने पर भूरे छोटे कीड़े', 'पौधे पीले पड़कर सूख जाते हैं (Hopperburn)', 'खेत में गोल-गोल जले हुए स्थान'],
  'तने और पत्ती के आधार पर छोटे भूरे कीड़े देखें। Hopperburn — गोल जले पैच बनते हैं।',
  ARRAY['घना पौधारोपण', 'अधिक नाइट्रोजन', 'कीटनाशकों का गलत उपयोग', 'प्राकृतिक शत्रुओं की कमी'],
  'भारी प्रकोप में 80-100% फसल नष्ट हो सकती है',
  'BPH के लिए सही कीटनाशक चुनना जरूरी है — गलत दवाई से resistance बढ़ता है।',
  6
),
(
  'stem-borer', '🪲', 'तना छेदक (Stem Borer)', 'Stem Borer', '#0288D1',
  ARRAY['मध्य पत्ती पीली होकर सूख जाती है (Dead Heart)', 'बाली सूखी और खाली (White Ear)', 'तने में सुराख'],
  'तने को काटें — अंदर इल्ली मिलेगी। पत्तियों में अनियमित छेद।',
  ARRAY['Scirpophaga incertulas इल्ली', 'खेत के किनारे से फैलाव', 'अंडे पत्तियों पर'],
  '20-40% उपज नुकसान, White Ear में अधिक',
  'Dead Heart दिखे तो तुरंत Chlorpyrifos या Cartap Hydrochloride का इस्तेमाल करें।',
  7
),
(
  'sheath-blight', '🍃', 'Sheath Blight (झूठा कंड)', 'Sheath Blight', '#009688',
  ARRAY['पत्ती की मयान पर अनियमित भूरे धब्बे', 'धब्बों के किनारे गहरे भूरे', 'पत्ते पीले पड़ते हैं'],
  'पत्ती के आधार पर अंडाकार धब्बे — पानी की सतह के पास शुरू होते हैं।',
  ARRAY['Rhizoctonia solani फफूंद', 'घना पौधारोपण', 'उच्च नमी', 'अधिक नाइट्रोजन'],
  '25-50% उपज हानि संभव',
  'Validamycin या Hexaconazole का Spray सबसे प्रभावी है।',
  8
)
ON CONFLICT (id) DO NOTHING;
