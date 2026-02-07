/* حافظ على تنسيقاتك الأصلية وأضف هذه التعديلات */
:root {
  --primary: #7c6cff;
  --bg: #0a0a0c;
  --panel: #141417;
  --text: #ffffff;
}

/* تنسيق قائمة التأمين الجديدة */
.insurance-select {
  background: #1a1a1e;
  color: white;
  border: 1px solid #333;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.insurance-select:focus {
  border-color: var(--primary);
}

/* تنسيق الفحوصات القابلة للسحب */
.testRow {
  background: #1c1c21;
  border: 1px solid #2d2d35;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: grab;
  transition: transform 0.2s, background 0.2s;
}
.testRow:active {
  cursor: grabbing;
  transform: scale(0.98);
  background: #25252b;
}
.testRow.dragging {
  opacity: 0.5;
  border: 1px dashed var(--primary);
}

/* نافذة التحديثات (Patch Notes) */
.patch-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: none; /* تظهر عبر JS */
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
}
.patch-card {
  background: linear-gradient(145deg, #1e2235, #0f111a);
  border: 2px solid var(--primary);
  border-radius: 24px;
  padding: 40px;
  max-width: 450px;
  text-align: center;
  color: white;
  box-shadow: 0 0 50px rgba(124, 108, 255, 0.3);
  animation: patchPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes patchPop {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
.patch-icon { font-size: 50px; margin-bottom: 20px; }
.patch-list { text-align: right; list-style: none; padding: 0; margin: 25px 0; }
.patch-list li { margin-bottom: 15px; font-size: 0.95rem; line-height: 1.6; }
.patch-list b { color: var(--primary); }

/* تحسينات عامة للهيدر واللوحة */
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--panel); border-bottom: 1px solid #222; }
.actions { display: flex; gap: 10px; align-items: center; }
.btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btnPrimary { background: var(--primary); color: white; }
.btnPrimary:hover { opacity: 0.9; transform: translateY(-1px); }
