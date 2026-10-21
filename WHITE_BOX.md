# WHITE BOX TESTING — ATLAS Filtering & Stemming Trace
> **Modul Uji**: `TokenBadge` Hover Tooltip · `src/components/PreprocessingInspector.jsx`
> **Versi**: v3.8.2 — Portal-based Tooltip
> **Teknik**: Data Flow Testing (Utama) · Basis Path & Branch Coverage · Loop Testing

---

## 1. Pendahuluan

Komponen `TokenBadge` merender token hasil preprocessing beserta tooltip interaktif yang muncul saat kursor diarahkan. Tooltip diimplementasikan menggunakan **React Portal** (`ReactDOM.createPortal`) ke `document.body` untuk menghindari *overflow-clip* dari container `overflow-y-auto`.

Pengujian white-box difokuskan pada:
1. **Kebenaran aliran data** posisi tooltip (`calcPos → setPos`)
2. **Seluruh cabang kondisi** dari status token dan penempatan tooltip
3. **Perilaku loop** saat banyak token dirender secara bersamaan

---

## 2. Data Flow Testing *(Paling Utama)*

Data Flow Testing memverifikasi bahwa setiap variabel mengikuti siklus **Definisi → Penggunaan → Penghapusan** yang benar dan bebas anomali (*du-anomaly*, *dd-anomaly*, *ur-anomaly*).

### 2.1 Variabel Kritis & Siklus Hidup

| Variabel | Defined (D) | Used (U) | Killed (K) |
|---|---|---|---|
| `pos` | `setPos(calcPos())` saat `handleEnter` | `pos.top`, `pos.left`, `pos.arrowX`, `pos.placeBelow` saat render Portal | `setPos(null)` saat `handleLeave` / `onScroll` |
| `leaveTimer.current` | `setTimeout(…)` saat `handleLeave` | — | `clearTimeout(…)` saat `handleEnter` & `useEffect` cleanup |
| `calcPos()` return | `getBoundingClientRect()` di `handleEnter` | Digunakan langsung oleh `setPos(calcPos())` | Garbage collected setelah render |
| `legendData` | `TOKEN_STATUS_LEGEND.find(…)` | `legendData.dotColor`, `.label`, `.description`, `.stage`, `.stageColor` | End of render scope |

### 2.2 Du-Paths yang Diuji

| Du-Path ID | Variabel | Path Aliran | Ekspektasi |
|---|---|---|---|
| DP-01 | `pos` | `handleEnter → calcPos() → setPos → Portal render` | Tooltip muncul dengan posisi tepat |
| DP-02 | `pos` | `handleLeave → setTimeout → setPos(null) → unmount Portal` | Tooltip hilang setelah 80ms |
| DP-03 | `pos` | `onScroll → setPos(null)` | Tooltip langsung hilang saat scroll |
| DP-04 | `leaveTimer.current` | `handleLeave → setTimeout` kemudian `handleEnter → clearTimeout` | Tooltip tidak berkedip (flicker-free) |
| DP-05 | `left` di `calcPos` | `r.left + r.width/2 - w/2` → clamp kiri → clamp kanan | Tooltip tidak keluar layar |
| DP-06 | `top` di `calcPos` | Hitung atas → fallback bawah jika `top < 10` → clamp batas bawah | Tooltip tidak terpotong layar |

### 2.3 Anomali yang Dicegah

| Kode Anomali | Deskripsi | Solusi Implementasi |
|---|---|---|
| **dd-anomaly** | `pos` diset dua kali berturutan tanpa digunakan | Dicegah oleh `clearTimeout(leaveTimer.current)` saat `handleEnter` |
| **ur-anomaly** | `pos.arrowX` dibaca sebelum `calcPos` mengembalikan nilai | `calcPos` return objek penuh; `setPos` dipanggil atomik |
| **du-anomaly** | `leaveTimer.current` belum di-clear saat komponen unmount | `useEffect` cleanup: `clearTimeout(leaveTimer.current)` |

---

## 3. Basis Path & Branch Coverage

### 3.1 Control Flow Graph `calcPos()`

```
START
  |
  v
[1] ref.current ada? ──── Tidak ──> return undefined
  | Ya
  v
[2] Hitung left = r.left + r.width/2 - w/2
  |
  v
[3] left < 10? ──── Ya ──> left = 10
  | Tidak
  v
[4] left + w > vw - 10? ──── Ya ──> left = vw - 10 - w
  | Tidak
  v
[5] Hitung top = r.top - h - 10
  |
  v
[6] top < 10? ──── Ya ──> top = r.bottom + 10; placeBelow = true
  | Tidak                       |
  v                             v
[7] top + h > vh - 10? ── Ya ──> top = max(10, vh-10-h)
  | Tidak
  v
[8] Hitung arrowX (clamp 14 ... w-14)
  |
  v
RETURN { top, left, arrowX, placeBelow }
```

### 3.2 Basis Paths (McCabe Cyclomatic Complexity = 5)

| Path | Jalur Simpul | Skenario |
|---|---|---|
| **BP-1** | 1 → return | `ref.current` null (komponen belum mount) |
| **BP-2** | 1→2→3→5→6→8→return | `left` normal, tooltip di atas, tidak terpotong |
| **BP-3** | 1→2→3(kiri)→5→6→8→return | `left` terlalu kecil (badge di tepi kiri layar) |
| **BP-4** | 1→2→4(kanan)→5→6(bawah)→8→return | Badge tepi kanan, tidak ada ruang di atas |
| **BP-5** | 1→2→3→5→7(bawah vh)→8→return | Tooltip melewati batas bawah layar |

### 3.3 Branch Coverage Checklist

| Cabang (Branch) | Status | Test Case |
|---|---|---|
| `ref.current === null` | PASS | Hover sebelum mount |
| `left < 10` = true | PASS | Badge di paling kiri layar |
| `left + w > vw - 10` = true | PASS | Badge di paling kanan layar |
| `top < 10` = true → `placeBelow=true` | PASS | Badge di atas halaman |
| `top + h > vh - 10` = true | PASS | Badge di bawah halaman |
| `item.status === 'removed'` | PASS | Token stopword |
| `item.status === 'stemmed'` | PASS | Token berimbuhan |
| `item.status === 'preserved'` | PASS | Token kata dasar |
| `item.stemmed && item.token !== item.stemmed` | PASS | Tampil tanda panah stemmed |
| `item.reason` truthy | PASS | Token dengan alasan khusus |

**Branch Coverage: 100%** pada seluruh kondisi `calcPos` dan render badge.

---

## 4. Loop Testing

### 4.1 Loop Rendering Token Array

`pipeline.trace.map((item, i) => <TokenBadge key={i} item={item} />)` adalah loop tunggal merender N token.

| Iterasi Uji | Skenario | Ekspektasi |
|---|---|---|
| **N = 0** | Teks kosong / hanya stopword | Tidak ada badge; container kosong |
| **N = 1** | Satu kata tunggal | Satu badge; hover normal |
| **N = 2** | Dua kata | Dua badge independen; tooltip tidak tumpang-tindih |
| **N = 5–20** | Kalimat pendek normal | Semua badge muncul; tooltip akurat |
| **N = 50–100** | Paragraf panjang | Container scroll (`max-h-64`); tooltip Portal tetap terlihat |
| **N = 200+** | Teks sangat panjang | Render stabil; tidak ada memory leak timer |

### 4.2 Loop Event Listener Scroll

```javascript
useEffect(() => {
  const onScroll = () => setPos(null);
  window.addEventListener('scroll', onScroll, true);
  return () => window.removeEventListener('scroll', onScroll, true);
}, []);
```

| Kondisi | Ekspektasi |
|---|---|
| Scroll 0 kali | Tooltip tetap terlihat |
| Scroll 1 kali saat tooltip tampil | `setPos(null)` → Portal unmount |
| Scroll berulang | Tidak ada re-subscription (dep array `[]`) |
| Unmount komponen | `removeEventListener` via cleanup |

### 4.3 Loop Timer (leaveTimer)

| Skenario | Perilaku |
|---|---|
| `handleLeave` → `handleEnter` dalam < 80ms | `clearTimeout` cegah `setPos(null)` → tidak berkedip |
| `handleLeave` → tidak ada enter selama 80ms | `setPos(null)` → Portal unmount bersih |
| `handleLeave` berulang (gerak cepat) | Hanya timer terakhir aktif; semua timer sebelumnya di-clear |

---

## 5. Ringkasan Hasil

| Teknik | Coverage | Temuan Kritis |
|---|---|---|
| **Data Flow Testing** | Du-path 100% | Anomali `dd` (double-set) dicegah oleh timer clear |
| **Basis Path Testing** | 5/5 path | BP-1 (null ref) ditangani early return |
| **Branch Coverage** | 10/10 cabang | Seluruh status token & posisi layar tercakup |
| **Loop Testing** | 6 skenario | N=0, N=1, tipikal, batas, ekstrem, scroll loop |

> **Kesimpulan**: Implementasi `TokenBadge` v3.8.2 dengan React Portal lulus seluruh kriteria white-box testing.
> React Portal menyelesaikan root cause (overflow-y-auto clip), timer 80ms menyelesaikan flicker, dan event cleanup mencegah memory leak.
