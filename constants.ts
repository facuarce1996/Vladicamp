import { Question, Candidate } from './types';

export const QUESTIONS: Question[] = [
  { id: 1, text: "El que no suelta el micrófono" },
  { id: 2, text: "El más carnadín" },
  { id: 3, text: "El que más pega" },
  { id: 4, text: "El que menos pega" },
  { id: 5, text: "El que tira peores latas" },
  { id: 6, text: "El más negativo" },
  { id: 7, text: "El más motivador" },
  { id: 8, text: "El más gracioso" },
  { id: 9, text: "El menos gracioso" },
  { id: 10, text: "El más cagón" },
  { id: 11, text: "El que no hace nada para que salga" },
  { id: 12, text: "El más excusín" },
  { id: 13, text: "El que tiene asistencia perfecta" },
  { id: 14, text: "El que más genera" },
  { id: 15, text: "La revelación" },
  { id: 16, text: "Audio del año", type: 'text' }
];

export const CANDIDATES: Candidate[] = [
  "Sergio",
  "Zinow",
  "Tincho",
  "Tomi",
  "Tanke",
  "Javo",
  "Rod",
  "Augu",
  "Casla",
  "Jerry",
  "Emi",
  "Shone",
  "Pola",
  "Guai",
  "Gato",
  "Fach",
  "Fran",
  "Ale Melli",
  "Boris",
  "Juanma",
  "Eze",
  "Tebi"
];

// Helper to shuffle array (Fisher-Yates)
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};