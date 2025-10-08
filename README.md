# Studify – Aplikasi Habit Tracker Belajar Berbasis Web
Studify adalah aplikasi habit tracker berbasis web yang dirancang untuk membantu mahasiswa dan pengguna umum dalam mengelola waktu, membangun konsistensi, serta meningkatkan produktivitas belajar. Aplikasi ini menggabungkan metode Pomodoro untuk fokus belajar, pencatatan kebiasaan harian (habit tracker), penjadwalan aktivitas, sistem pengingat otomatis melalui email, serta statistik dasar progres pengguna. Dibangun menggunakan stack teknologi modern seperti Next.js untuk frontend dan backend, Firebase sebagai database, serta dikemas dalam container Docker untuk memudahkan deployment dan pengembangan tim.

Fitur utama Studify meliputi:
- Autentikasi pengguna (login & registrasi)
- Timer Pomodoro (25 menit belajar, 5 menit istirahat)
- Habit Tracker untuk mencatat dan memantau kebiasaan harian
- Jadwal harian berbasis kalender sederhana
- Reminder otomatis via email
- Statistik dasar: jumlah sesi Pomodoro dan progres habit

Aplikasi ini dikembangkan sebagai proyek untuk mata kuliah Pemrograman Terapan yang mengintegrasikan konsep pengembangan web, manajemen waktu, dan desain antarmuka yang user-friendly.

# 🛠️ Panduan Instalasi
Buat file .env :

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Lalu jalankan :
```
docker compose up --watch
```

# Anggota Kelompok
2372015 - Ariel Jonathan Wihardja  
2372023 - Eben Praus Yosia  
2372049 - Derryl Eberhard Sangaptaras Sembiring
