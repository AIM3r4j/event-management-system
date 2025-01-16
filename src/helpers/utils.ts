import moment from 'moment';

export const IsNumberString = (str) => /^\d+$/.test(str);
export const IsEmpty = (str) => !(str && str.trim().length);
export const secondDiffBetweenTwoDates = (
  date1: string | Date,
  date2: string | Date = new Date(),
): number => {
  // Create moment instances for the two dates
  const t1 = moment(date1);
  const t2 = moment(date2);

  // Get the difference in seconds
  const diffInSeconds = t1.diff(t2, 'seconds');

  // Return the absolute difference (optional if you want the result to always be positive)
  return Math.abs(diffInSeconds);
};

export const validateEmail = (email) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const genRandomInRange = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;
//45896 = 5
export const getlength = (number) => number.toString().length;
//548 = 000548
export const fillWithZero = (number, fillLength = 6) => {
  const lenghtOfNumber = getlength(number);
  let output = number.toString();

  if (lenghtOfNumber < fillLength) {
    for (let i = 0; i < fillLength - lenghtOfNumber; i++) {
      output = '0' + output;
    }
    return output;
  } else {
    return output;
  }
};

//*OYY!3@U6.y
export const generateRandomString = (min, max) => {
  let input = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    '|',
    '?',
    '/',
    '&',
    '*',
    '%',
    '$',
    '@',
    '!',
    '_',
    '-',
    '+',
    ',',
    ')',
    '(',
    '{',
    '}',
    '[',
    ']',
  ];

  let stringNumber = genRandomInRange(min, max),
    inputLength = input.length;
  let randomString = '';
  for (let i = 0; i < stringNumber; i++) {
    randomString += input[genRandomInRange(0, inputLength)];
  }

  return randomString;
};

export const generateNumericOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

export const maskCardNumber = (cardNumber) => {
  // Remove all non-digit characters
  const cleanCardNumber = cardNumber.replace(/\D/g, '');

  // Check if the card number is shorter than 4 digits
  if (cleanCardNumber.length <= 4) {
    return cleanCardNumber; // Return the number as is if it's too short
  }

  // Calculate the number of asterisks needed
  const maskedPart = '*'.repeat(cleanCardNumber.length - 4);

  // Get the last 4 digits
  const visiblePart = cleanCardNumber.slice(-4);

  // Return the masked card number
  return maskedPart + visiblePart;
};

// For scheduling help
export type RecurrenceInterval = 1 | 7 | 14 | 30 | 365; // Representing daily, weekly, bi-weekly, monthly, yearly

interface SubscriptionDatesOptions {
  startDate: Date;
  recurrenceInterval: RecurrenceInterval;
}

export function generateFutureDates({
  startDate,
  recurrenceInterval,
}: SubscriptionDatesOptions): Date[] {
  const futureDates: Date[] = [];
  const now = moment();
  let currentDate = moment(startDate);

  // Get the occurrences count based on the interval
  const occurrencesCount = getOccurrencesCount(recurrenceInterval);

  // Generate dates based on the recurrence interval
  for (let i = 0; i < occurrencesCount; i++) {
    futureDates.push(currentDate.toDate());

    // Move to the next occurrence based on the interval in days
    currentDate.add(recurrenceInterval, 'days');
  }

  return futureDates;
}

function getOccurrencesCount(recurrenceInterval: RecurrenceInterval): number {
  switch (recurrenceInterval) {
    case 1: // Daily
      return 365; // Generate dates for 365 days (1 year)
    case 7: // Weekly
      return 52; // Generate dates for 52 weeks (1 year)
    case 14: // Bi-weekly
      return 26; // Generate dates for 26 bi-weekly periods (1 year)
    case 30: // Monthly
      return 12; // Generate dates for 12 months (1 year)
    case 365: // Yearly
      return 1; // Generate dates for 1 year
    default:
      throw new Error(`Unsupported recurrence interval: ${recurrenceInterval}`);
  }
}
