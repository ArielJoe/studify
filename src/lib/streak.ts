import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Helper sederhana untuk mendapatkan format YYYY-MM-DD dari waktu lokal user
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const updateUserStreak = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    // Ambil data streak yang ada, atau inisialisasi default jika belum ada
    const streakData = userData.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };

    // Gunakan tanggal hari ini (Lokal)
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const lastActiveStr = streakData.lastActiveDate;

    // SKENARIO 1: Jika hari ini SUDAH mengerjakan task (tanggal sama), tidak perlu update streak
    if (lastActiveStr === todayStr) {
      console.log("Streak already updated for today.");
      return;
    }

    let newCurrentStreak = 1; // Default reset ke 1
    let newLongestStreak = streakData.longestStreak || 0;

    if (lastActiveStr) {
      // Hitung selisih hari
      // Kita set jam ke 00:00:00 agar perbandingan murni berdasarkan tanggal kalender
      const lastDate = new Date(lastActiveStr);
      lastDate.setHours(0, 0, 0, 0);

      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // SKENARIO 2: Kemarin mengerjakan (selisih 1 hari) -> Streak Nambah
        newCurrentStreak = (streakData.currentStreak || 0) + 1;
      } else {
        // SKENARIO 3: Bolong lebih dari 1 hari -> Reset jadi 1
        newCurrentStreak = 1;
      }
    } else {
      // SKENARIO 4: Belum pernah ada data (User Baru) -> Streak 1
      newCurrentStreak = 1;
    }

    // Cek apakah memecahkan rekor tertinggi
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    // Simpan ke Firestore
    await updateDoc(userRef, {
      streak: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: todayStr,
      },
    });

    console.log(`Streak updated! New streak: ${newCurrentStreak}`);
    return newCurrentStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
  }
};
