import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Date formatter
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
    // Get streak or default
    const streakData = userData.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };

    // Use local date
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const lastActiveStr = streakData.lastActiveDate;

    // Scenario 1: Already active today
    if (lastActiveStr === todayStr) {
      console.log("Streak already updated for today.");
      return;
    }

    let newCurrentStreak = 1; // Reset to 1
    let newLongestStreak = streakData.longestStreak || 0;

    if (lastActiveStr) {
      // Calculate diff
      // Set to midnight
      const lastDate = new Date(lastActiveStr);
      lastDate.setHours(0, 0, 0, 0);

      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Scenario 2: Active yesterday
        newCurrentStreak = (streakData.currentStreak || 0) + 1;
      } else {
        // Scenario 3: Missed a day
        newCurrentStreak = 1;
      }
    } else {
      // Scenario 4: New user
      newCurrentStreak = 1;
    }

    // Check for high score
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    // Save to Firestore
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
