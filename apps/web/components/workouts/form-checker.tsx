'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// Form correction rules for common exercises
const exerciseRules: Record<string, FormRule[]> = {
  squat: [
    {
      id: 'knee_over_toes',
      check: (landmarks) => {
        // Knees shouldn't extend far past toes
        const knee = landmarks[25]; // Right knee
        const ankle = landmarks[27]; // Right ankle
        if (!knee || !ankle) return null;
        const kneeForward = knee.x - ankle.x;
        return kneeForward < 0.1; // Threshold
      },
      message: 'Keep your knees behind your toes',
      messageAr: 'حافظ على ركبتيك خلف أصابع قدميك',
      severity: 'warning',
    },
    {
      id: 'back_straight',
      check: (landmarks) => {
        // Check spine angle - shoulder, hip, knee alignment
        const shoulder = landmarks[11];
        const hip = landmarks[23];
        if (!shoulder || !hip) return null;
        const backAngle = Math.abs(shoulder.y - hip.y);
        return backAngle > 0.15; // Back should be relatively upright
      },
      message: 'Keep your back straight',
      messageAr: 'حافظ على استقامة ظهرك',
      severity: 'error',
    },
    {
      id: 'depth',
      check: (landmarks) => {
        // Hip should go below knee level
        const hip = landmarks[23];
        const knee = landmarks[25];
        if (!hip || !knee) return null;
        return hip.y > knee.y; // Hip below knee
      },
      message: 'Go deeper - hips below knees',
      messageAr: 'انزل أكثر - الوركين تحت الركبتين',
      severity: 'info',
    },
  ],
  pushup: [
    {
      id: 'body_straight',
      check: (landmarks) => {
        // Shoulder, hip, ankle should be aligned
        const shoulder = landmarks[11];
        const hip = landmarks[23];
        const ankle = landmarks[27];
        if (!shoulder || !hip || !ankle) return null;

        // Calculate alignment
        const shoulderToHip = Math.abs(shoulder.y - hip.y);
        const hipToAnkle = Math.abs(hip.y - ankle.y);
        return Math.abs(shoulderToHip - hipToAnkle) < 0.1;
      },
      message: 'Keep your body in a straight line',
      messageAr: 'حافظ على استقامة جسمك',
      severity: 'error',
    },
    {
      id: 'elbow_angle',
      check: (landmarks) => {
        // Check elbow angle at bottom position
        const shoulder = landmarks[11];
        const elbow = landmarks[13];
        const wrist = landmarks[15];
        if (!shoulder || !elbow || !wrist) return null;

        const angle = calculateAngle(shoulder, elbow, wrist);
        return angle < 100; // Should be around 90 degrees at bottom
      },
      message: 'Lower your chest closer to the ground',
      messageAr: 'انزل صدرك أقرب للأرض',
      severity: 'warning',
    },
  ],
  deadlift: [
    {
      id: 'back_neutral',
      check: (landmarks) => {
        // Check for rounded back
        const shoulder = landmarks[11];
        const hip = landmarks[23];
        if (!shoulder || !hip) return null;

        // Back should maintain neutral curve
        const backAngle = Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x);
        return Math.abs(backAngle) < 0.5; // Reasonable threshold
      },
      message: 'Keep your back neutral - avoid rounding',
      messageAr: 'حافظ على ظهرك مستقيماً - تجنب التقوس',
      severity: 'error',
    },
    {
      id: 'bar_path',
      check: (landmarks) => {
        // Bar should stay close to body (wrists close to legs)
        const wrist = landmarks[15];
        const knee = landmarks[25];
        if (!wrist || !knee) return null;

        const distance = Math.abs(wrist.x - knee.x);
        return distance < 0.15; // Close to body
      },
      message: 'Keep the bar close to your body',
      messageAr: 'حافظ على البار قريباً من جسمك',
      severity: 'warning',
    },
  ],
  plank: [
    {
      id: 'hip_height',
      check: (landmarks) => {
        // Hips shouldn't sag or pike
        const shoulder = landmarks[11];
        const hip = landmarks[23];
        const ankle = landmarks[27];
        if (!shoulder || !hip || !ankle) return null;

        // Check if hip is in line with shoulder-ankle
        const expectedHipY = (shoulder.y + ankle.y) / 2;
        const hipDiff = Math.abs(hip.y - expectedHipY);
        return hipDiff < 0.1;
      },
      message: 'Keep your hips level - not too high or low',
      messageAr: 'حافظ على مستوى وركيك - ليس مرتفعاً أو منخفضاً',
      severity: 'error',
    },
  ],
};

interface FormRule {
  id: string;
  check: (landmarks: Landmark[]) => boolean | null;
  message: string;
  messageAr: string;
  severity: 'info' | 'warning' | 'error';
}

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface FormFeedback {
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  passed: boolean;
}

// Calculate angle between three points
function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

interface FormCheckerProps {
  exercise: string;
  onClose: () => void;
}

export function FormChecker({ exercise, onClose }: FormCheckerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FormFeedback[]>([]);
  const [pose, setPose] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const rules = exerciseRules[exercise.toLowerCase()] || [];

  // Initialize camera and pose detection
  useEffect(() => {
    let animationFrameId: number;
    let poseDetector: any;

    const init = async () => {
      try {
        // Request camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        // Load TensorFlow.js and pose detection
        // @ts-ignore - Dynamic import
        const tf = await import('@tensorflow/tfjs-core');
        // @ts-ignore
        await import('@tensorflow/tfjs-backend-webgl');
        // @ts-ignore
        const poseDetection = await import('@tensorflow-models/pose-detection');

        // Create BlazePose detector
        poseDetector = await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          {
            runtime: 'tfjs',
            modelType: 'lite', // 'lite', 'full', or 'heavy'
            enableSmoothing: true,
          }
        );

        setPose(poseDetector);
        setIsLoading(false);

        // Start pose detection loop
        const detectPose = async () => {
          if (!videoRef.current || !canvasRef.current || !poseDetector) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          if (!ctx || video.readyState !== 4) {
            animationFrameId = requestAnimationFrame(detectPose);
            return;
          }

          // Detect poses
          const poses = await poseDetector.estimatePoses(video);

          // Clear and draw video frame
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (poses.length > 0) {
            const landmarks = poses[0].keypoints;

            // Draw skeleton
            drawSkeleton(ctx, landmarks);

            // Check form rules
            const newFeedback: FormFeedback[] = [];
            for (const rule of rules) {
              const result = rule.check(landmarks);
              if (result !== null) {
                newFeedback.push({
                  ruleId: rule.id,
                  message: rule.message,
                  severity: rule.severity,
                  passed: result,
                });
              }
            }
            setFeedback(newFeedback);
          }

          animationFrameId = requestAnimationFrame(detectPose);
        };

        detectPose();
      } catch (err: any) {
        console.error('Form checker error:', err);
        // Provide user-friendly error messages
        let errorMessage = 'Failed to initialize camera';
        if (err.name === 'NotFoundError' || err.message?.includes('device not found')) {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      // Cleanup
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (poseDetector) {
        poseDetector.dispose?.();
      }
    };
  }, [exercise, rules]);

  // Draw skeleton on canvas
  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: Landmark[]) => {
    const connections = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [11, 23], [12, 24], // Torso
      [23, 24], // Hips
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
    ];

    // Draw connections
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    connections.forEach(([i, j]) => {
      const a = landmarks[i];
      const b = landmarks[j];
      if (a && b && (a.visibility || 0) > 0.5 && (b.visibility || 0) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
        ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
        ctx.stroke();
      }
    });

    // Draw keypoints
    landmarks.forEach((landmark) => {
      if ((landmark.visibility || 0) > 0.5) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(
          landmark.x * ctx.canvas.width,
          landmark.y * ctx.canvas.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });
  };

  const getOverallScore = () => {
    if (feedback.length === 0) return null;
    const passed = feedback.filter(f => f.passed).length;
    return Math.round((passed / feedback.length) * 100);
  };

  const score = getOverallScore();

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-semibold capitalize">{exercise} Form Check</h2>
            <p className="text-white/70 text-sm">Basic pose detection - for guidance only</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Video/Canvas Area */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading pose detection...</p>
              <p className="text-white/60 text-sm">This may take a few seconds</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-white mb-2">Camera Error</p>
              <p className="text-white/60 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/20 text-white rounded-lg flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Score Badge */}
        {score !== null && (
          <div className="absolute top-20 right-4">
            <div className={`px-4 py-2 rounded-full font-bold text-lg ${
              score >= 80 ? 'bg-emerald-500' :
              score >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            } text-white`}>
              {score}%
            </div>
          </div>
        )}
      </div>

      {/* Feedback Panel */}
      <div className="bg-gray-900 p-4 max-h-48 overflow-y-auto">
        <h3 className="text-white font-medium mb-3">Form Feedback</h3>
        {feedback.length === 0 ? (
          <p className="text-white/60 text-sm">Position yourself in the frame to start analysis</p>
        ) : (
          <div className="space-y-2">
            {feedback.map((item) => (
              <div
                key={item.ruleId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  item.passed
                    ? 'bg-emerald-500/20'
                    : item.severity === 'error'
                      ? 'bg-red-500/20'
                      : item.severity === 'warning'
                        ? 'bg-yellow-500/20'
                        : 'bg-blue-500/20'
                }`}
              >
                {item.passed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : item.severity === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  item.passed ? 'text-emerald-400' :
                  item.severity === 'error' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {item.passed ? 'Good form!' : item.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified button to open form checker
export function FormCheckButton({ exercise }: { exercise: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!exerciseRules[exercise.toLowerCase()]) {
    return null; // No rules for this exercise
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
      >
        <Camera className="w-4 h-4" />
        Check Form
      </button>

      {isOpen && (
        <FormChecker exercise={exercise} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
