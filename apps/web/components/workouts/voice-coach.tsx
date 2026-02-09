'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';

interface VoiceCoachProps {
  enabled?: boolean;
  language?: 'en' | 'ar';
}

// Voice coaching messages
const coachingMessages = {
  en: {
    // Workout start
    workoutStart: "Let's go! Time to work out. Remember, consistency beats perfection.",
    warmUp: "Start with a quick warm-up. Get that blood flowing!",

    // Exercise cues
    exerciseStart: (name: string, sets: number, reps: number) =>
      `Starting ${name}. ${sets} sets of ${reps} reps. You've got this!`,
    nextSet: (setNumber: number, totalSets: number) => {
      const setsLeft = totalSets - setNumber + 1;
      if (setsLeft === 1) return "Last set! Give it everything you've got!";
      if (setsLeft === 2) return `2 sets left. Stay focused!`;
      return `Set ${setNumber} of ${totalSets}. ${setsLeft} sets to go.`;
    },
    setsLeft: (remaining: number) => {
      if (remaining === 1) return "Last set!";
      if (remaining === 2) return "2 sets left!";
      return `${remaining} sets left.`;
    },
    lastSet: "Last set! Give it everything you've got!",
    setComplete: "Set done! Great work.",

    // Rep cues
    repCount: (rep: number, total: number) => {
      if (rep === total) return "Last rep!";
      if (rep === total - 1) return "One more after this!";
      if (rep === Math.floor(total / 2)) return "Halfway there!";
      return `${rep}`;
    },
    lastRep: "Last rep! Make it count!",
    halfwayReps: "Halfway through! Keep going!",

    // Rest periods
    restStart: (seconds: number) => `Rest for ${seconds} seconds.`,
    restCountdown: (seconds: number) => {
      if (seconds === 30) return "30 seconds left.";
      if (seconds === 10) return "10 seconds, get ready!";
      if (seconds === 5) return "5 seconds!";
      if (seconds <= 3 && seconds > 0) return `${seconds}`;
      return "";
    },
    restHalf: "Halfway through rest. Prepare for the next set.",
    restEnd: "Time! Let's go!",

    // Encouragement
    encouragement: [
      "You're doing amazing!",
      "Keep pushing!",
      "Strong work!",
      "That's the spirit!",
      "You're stronger than you think!",
      "Every rep counts!",
      "Mind over muscle!",
    ],

    // Form reminders
    formReminders: {
      squat: "Keep your chest up and core tight. Push through your heels.",
      pushup: "Keep your body in a straight line. Control the movement.",
      deadlift: "Neutral spine, drive through your legs. Squeeze at the top.",
      plank: "Keep your core engaged. Don't let your hips sag.",
      lunge: "Keep your front knee over your ankle. Stand tall.",
      default: "Focus on your form. Quality over quantity.",
    },

    // Progress feedback
    progressFeedback: {
      newPR: "New personal record! Incredible!",
      weightIncrease: (weight: number) => `Great progress! You're lifting ${weight} more than last time.`,
      consistentStrength: "Solid consistency. Keep building!",
    },

    // Workout completion
    coolDown: "Excellent workout! Time to cool down and stretch.",
    workoutComplete: "Workout complete! You showed up and gave your best. See you next time!",

    // Countdowns
    countdown: (num: number) => num.toString(),
  },
  ar: {
    // Workout start
    workoutStart: "هيا! وقت التمرين. تذكر، الاستمرارية أفضل من الكمال.",
    warmUp: "ابدأ بإحماء سريع. حرك الدورة الدموية!",

    // Exercise cues
    exerciseStart: (name: string, sets: number, reps: number) =>
      `نبدأ ${name}. ${sets} مجموعات من ${reps} تكرار. يمكنك فعلها!`,
    nextSet: (setNumber: number, totalSets: number) => {
      const setsLeft = totalSets - setNumber + 1;
      if (setsLeft === 1) return "المجموعة الأخيرة! أعطها كل ما لديك!";
      if (setsLeft === 2) return "مجموعتان متبقيتان. ركز!";
      return `مجموعة ${setNumber} من ${totalSets}. ${setsLeft} مجموعات متبقية.`;
    },
    setsLeft: (remaining: number) => {
      if (remaining === 1) return "المجموعة الأخيرة!";
      if (remaining === 2) return "مجموعتان متبقيتان!";
      return `${remaining} مجموعات متبقية.`;
    },
    lastSet: "المجموعة الأخيرة! أعطها كل ما لديك!",
    setComplete: "انتهت المجموعة! عمل رائع.",

    // Rep cues
    repCount: (rep: number, total: number) => {
      if (rep === total) return "التكرار الأخير!";
      if (rep === total - 1) return "واحد آخر بعد هذا!";
      if (rep === Math.floor(total / 2)) return "في المنتصف!";
      return `${rep}`;
    },
    lastRep: "التكرار الأخير! اجعله مهماً!",
    halfwayReps: "في منتصف الطريق! استمر!",

    // Rest periods
    restStart: (seconds: number) => `استرح ${seconds} ثانية.`,
    restCountdown: (seconds: number) => {
      if (seconds === 30) return "30 ثانية متبقية.";
      if (seconds === 10) return "10 ثواني، استعد!";
      if (seconds === 5) return "5 ثواني!";
      if (seconds <= 3 && seconds > 0) return `${seconds}`;
      return "";
    },
    restHalf: "نصف الراحة انتهى. استعد للمجموعة التالية.",
    restEnd: "الوقت! هيا!",

    // Encouragement
    encouragement: [
      "أنت رائع!",
      "استمر بالدفع!",
      "عمل قوي!",
      "هذه هي الروح!",
      "أنت أقوى مما تظن!",
      "كل تكرار مهم!",
      "العقل يتفوق على العضلات!",
    ],

    // Form reminders
    formReminders: {
      squat: "ارفع صدرك وشد بطنك. ادفع من كعبيك.",
      pushup: "حافظ على جسمك مستقيماً. تحكم في الحركة.",
      deadlift: "ظهر مستقيم، ادفع من ساقيك. اضغط في الأعلى.",
      plank: "شد بطنك. لا تدع وركيك يتدليان.",
      lunge: "ركبتك الأمامية فوق كاحلك. قف منتصباً.",
      default: "ركز على شكلك. الجودة أهم من الكمية.",
    },

    // Progress feedback
    progressFeedback: {
      newPR: "رقم قياسي جديد! مذهل!",
      weightIncrease: (weight: number) => `تقدم رائع! أنت ترفع ${weight} أكثر من المرة السابقة.`,
      consistentStrength: "ثبات قوي. استمر في البناء!",
    },

    // Workout completion
    coolDown: "تمرين ممتاز! وقت التهدئة والتمدد.",
    workoutComplete: "انتهى التمرين! لقد حضرت وقدمت أفضل ما لديك. أراك المرة القادمة!",

    // Countdowns
    countdown: (num: number) => num.toString(),
  },
};

// Voice coach hook
export function useVoiceCoach(language: 'en' | 'ar' = 'en') {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      // Load voices
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        // Find a voice for the selected language
        const langCode = language === 'ar' ? 'ar' : 'en';
        voiceRef.current = voices.find(v => v.lang.startsWith(langCode)) || voices[0];
      };

      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);

      return () => {
        synthRef.current?.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [language]);

  // Speak text
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number }) => {
    if (!isEnabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceRef.current;
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [isEnabled, language]);

  // Stop speaking
  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Get messages for current language
  const messages = coachingMessages[language];

  return {
    isEnabled,
    setIsEnabled,
    isSpeaking,
    speak,
    stop,
    messages,
    // Convenience methods
    announceExercise: (name: string, sets: number, reps: number) => {
      speak(messages.exerciseStart(name, sets, reps));
    },
    announceSet: (setNumber: number, totalSets: number) => {
      if (setNumber === totalSets) {
        speak(messages.lastSet);
      } else {
        speak(messages.nextSet(setNumber, totalSets));
      }
    },
    announceRest: (seconds: number) => {
      speak(messages.restStart(seconds));
    },
    announceRestEnd: () => {
      speak(messages.restEnd);
    },
    encourageUser: () => {
      const randomIndex = Math.floor(Math.random() * messages.encouragement.length);
      speak(messages.encouragement[randomIndex]);
    },
    announceFormTip: (exercise: string) => {
      const tip = messages.formReminders[exercise.toLowerCase() as keyof typeof messages.formReminders]
        || messages.formReminders.default;
      speak(tip);
    },
    announceWorkoutStart: () => {
      speak(messages.workoutStart);
    },
    announceWorkoutComplete: () => {
      speak(messages.workoutComplete);
    },
    announceSetsLeft: (remaining: number) => {
      speak(messages.setsLeft(remaining));
    },
    announceRep: (rep: number, total: number) => {
      const phrase = messages.repCount(rep, total);
      if (phrase) speak(phrase, { rate: 1.1 });
    },
    announceRestCountdown: (seconds: number) => {
      const phrase = messages.restCountdown(seconds);
      if (phrase) speak(phrase, { rate: 1.1 });
    },
    announceNewPR: () => {
      speak(messages.progressFeedback.newPR);
    },
    countdown: (from: number, onComplete?: () => void) => {
      let count = from;
      const countdownInterval = setInterval(() => {
        if (count > 0) {
          speak(messages.countdown(count), { rate: 1.2 });
          count--;
        } else {
          clearInterval(countdownInterval);
          onComplete?.();
        }
      }, 1000);
      return () => clearInterval(countdownInterval);
    },
  };
}

// Voice coach toggle button
export function VoiceCoachToggle({
  enabled,
  onChange
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        enabled
          ? 'bg-violet-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      {enabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          Voice On
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          Voice Off
        </>
      )}
    </button>
  );
}

// Example workout player component with voice coaching
export function WorkoutWithVoiceCoach({
  exercises,
  language = 'en',
}: {
  exercises: Array<{ name: string; sets: number; reps: number }>;
  language?: 'en' | 'ar';
}) {
  const coach = useVoiceCoach(language);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [isActive, setIsActive] = useState(false);

  const exercise = exercises[currentExercise];

  // Start workout
  const startWorkout = () => {
    setIsActive(true);
    coach.announceWorkoutStart();
    setTimeout(() => {
      coach.announceExercise(exercise.name, exercise.sets, exercise.reps);
    }, 3000);
  };

  // Complete a set
  const completeSet = () => {
    if (currentSet < exercise.sets) {
      coach.speak(coach.messages.setComplete);
      setIsResting(true);
      coach.announceRest(restTime);

      // Rest timer
      const timer = setTimeout(() => {
        setIsResting(false);
        setCurrentSet(currentSet + 1);
        coach.announceRestEnd();
        setTimeout(() => {
          coach.announceSet(currentSet + 1, exercise.sets);
        }, 1000);
      }, restTime * 1000);

      // Halfway encouragement
      setTimeout(() => {
        coach.speak(coach.messages.restHalf);
      }, (restTime / 2) * 1000);

      return () => clearTimeout(timer);
    } else {
      // Move to next exercise
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
        coach.encourageUser();
        setTimeout(() => {
          coach.announceExercise(
            exercises[currentExercise + 1].name,
            exercises[currentExercise + 1].sets,
            exercises[currentExercise + 1].reps
          );
        }, 2000);
      } else {
        // Workout complete
        coach.announceWorkoutComplete();
        setIsActive(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Workout
        </h2>
        <VoiceCoachToggle
          enabled={coach.isEnabled}
          onChange={coach.setIsEnabled}
        />
      </div>

      {!isActive ? (
        <button
          onClick={startWorkout}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium"
        >
          Start Workout with Voice Coach
        </button>
      ) : (
        <div className="space-y-6">
          {/* Current Exercise */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Exercise {currentExercise + 1} of {exercises.length}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {exercise.name}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Set {currentSet} of {exercise.sets} • {exercise.reps} reps
            </p>
          </div>

          {/* Speaking Indicator */}
          {coach.isSpeaking && (
            <div className="flex items-center justify-center gap-2 text-violet-500">
              <Mic className="w-5 h-5 animate-pulse" />
              <span className="text-sm">Coach speaking...</span>
            </div>
          )}

          {/* Rest Timer */}
          {isResting && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Rest</p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {restTime}s
              </p>
            </div>
          )}

          {/* Complete Set Button */}
          {!isResting && (
            <button
              onClick={completeSet}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"
            >
              Complete Set
            </button>
          )}

          {/* Form Tip Button */}
          <button
            onClick={() => coach.announceFormTip(exercise.name)}
            className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl"
          >
            Get Form Tip
          </button>
        </div>
      )}
    </div>
  );
}
