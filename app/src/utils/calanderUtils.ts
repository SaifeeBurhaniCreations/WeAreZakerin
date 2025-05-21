const islamicReferenceDate = new Date("2024-07-07");
const islamicReferenceYear = 1446;
const msPerDay = 86400000;

export const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
export const islamicMonths = [
    "Moharrum-ul-Haram", "Safar-ul-Muzaffar", "Rabi-ul-Awwal", "Rabi-ul-Aakhar",
    "Jamadal-Ula", "Jamadal-Ukhra", "Rajab-ul-Asab", "Shaban-ul-Karim",
    "Ramadan-al-Moazzam", "Shawwal-al-Mukarram", "Zilqadatil-Haram", "Zilhajjatil-Haram"
  ];

export const toArabicNumerals = (num: number) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicDigits[parseInt(d)] || d).join('');
};

export const getIslamicMonthLengths = (year: number) => {
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  const yearInCycle = (year - 1) % 30 + 1;
  const isLeap = leapYears.includes(yearInCycle);
  return [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, isLeap ? 30 : 29];
};

export const getIslamicDate = (gregDate: Date ) => {
    const daysSinceReference = Math.floor((gregDate.getTime() - islamicReferenceDate.getTime()) / msPerDay);
    if (isNaN(daysSinceReference)) return null;
  
    let year = islamicReferenceYear;
    let dayCounter = daysSinceReference;
  
    while (true) {
      const yearLength = getIslamicMonthLengths(year).reduce((a, b) => a + b, 0);
      if (dayCounter < 0) {
        year--;
        dayCounter += getIslamicMonthLengths(year).reduce((a, b) => a + b, 0);
      } else if (dayCounter >= yearLength) {
        dayCounter -= yearLength;
        year++;
      } else {
        break;
      }
    }
  
    const monthLengths = getIslamicMonthLengths(year);
    let monthIndex = 0;
    while (dayCounter >= monthLengths[monthIndex]) {
      dayCounter -= monthLengths[monthIndex];
      monthIndex++;
    }
  
    return {
      day: dayCounter + 1,
      month: islamicMonths[monthIndex],
      monthIndex,
      year,
    };
  };

  
export const getGregorianDateFromIslamic = (year: number, monthIndex: number, day: number) => {
    let totalDays = 0;
    let y = islamicReferenceYear;
    while (y < year) {
      totalDays += getIslamicMonthLengths(y).reduce((a, b) => a + b, 0);
      y++;
    }
    while (y > year) {
      y--;
      totalDays -= getIslamicMonthLengths(y).reduce((a, b) => a + b, 0);
    }
  
    const monthLengths = getIslamicMonthLengths(year);
    for (let i = 0; i < monthIndex; i++) {
      totalDays += monthLengths[i];
    }
  
    totalDays += day - 1;
    return new Date(islamicReferenceDate.getTime() + totalDays * msPerDay);
  };