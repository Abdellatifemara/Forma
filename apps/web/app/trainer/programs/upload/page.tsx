'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type UploadState = 'idle' | 'uploading' | 'processing' | 'review' | 'complete' | 'error';

interface ParsedExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

interface ParsedDay {
  name: string;
  exercises: ParsedExercise[];
}

interface ParsedProgram {
  name: string;
  description: string;
  durationWeeks: number;
  days: ParsedDay[];
}

export default function UploadPDFPage() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [parsedProgram, setParsedProgram] = useState<ParsedProgram | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  const simulateUpload = async () => {
    setUploadState('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setUploadState('processing');

    // Simulate processing steps
    const steps = [
      'Extracting text from PDF...',
      'Analyzing workout structure...',
      'Identifying exercises...',
      'Parsing sets and reps...',
      'Organizing into days...',
      'Finalizing program...',
    ];

    for (const step of steps) {
      setProcessingStep(step);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Simulated parsed result
    const mockParsedProgram: ParsedProgram = {
      name: file?.name.replace('.pdf', '') || 'Uploaded Program',
      description: 'Program extracted from uploaded PDF',
      durationWeeks: 8,
      days: [
        {
          name: 'Day 1 - Push',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10', restSeconds: 90 },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60 },
            { name: 'Shoulder Press', sets: 3, reps: '8-10', restSeconds: 90 },
            { name: 'Lateral Raises', sets: 3, reps: '12-15', restSeconds: 45 },
            { name: 'Tricep Pushdown', sets: 3, reps: '12-15', restSeconds: 45 },
          ],
        },
        {
          name: 'Day 2 - Pull',
          exercises: [
            { name: 'Deadlift', sets: 4, reps: '5-6', restSeconds: 180 },
            { name: 'Pull-ups', sets: 4, reps: '6-10', restSeconds: 90 },
            { name: 'Barbell Row', sets: 3, reps: '8-10', restSeconds: 90 },
            { name: 'Face Pulls', sets: 3, reps: '15-20', restSeconds: 45 },
            { name: 'Bicep Curl', sets: 3, reps: '10-12', restSeconds: 45 },
          ],
        },
        {
          name: 'Day 3 - Legs',
          exercises: [
            { name: 'Squat', sets: 4, reps: '6-8', restSeconds: 180 },
            { name: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 90 },
            { name: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
            { name: 'Leg Curl', sets: 3, reps: '10-12', restSeconds: 60 },
            { name: 'Calf Raises', sets: 4, reps: '12-15', restSeconds: 45 },
          ],
        },
      ],
    };

    setParsedProgram(mockParsedProgram);
    setUploadState('review');
  };

  const handleConfirm = async () => {
    setUploadState('complete');
    // TODO: Call API to save the parsed program
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/trainer/programs');
  };

  const resetUpload = () => {
    setFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setProcessingStep('');
    setParsedProgram(null);
    setError(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainer/programs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload PDF Program</h1>
          <p className="text-muted-foreground">
            Convert your existing PDF workout programs into interactive formats
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card className="glass border-border/50">
            <CardContent className="py-8">
              {uploadState === 'idle' && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-12 text-center transition-colors',
                    file ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50',
                    error && 'border-red-500/50'
                  )}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={resetUpload}>
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                        <Button onClick={simulateUpload} className="btn-primary">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Process PDF
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          Drag and drop your PDF here
                        </p>
                        <p className="text-muted-foreground mt-1">
                          or click to browse files
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <Button asChild variant="outline" className="border-primary/50">
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          Select PDF File
                        </label>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Maximum file size: 10MB
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
              )}

              {uploadState === 'uploading' && (
                <div className="text-center py-12 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Uploading PDF...</p>
                    <p className="text-muted-foreground mt-1">{file?.name}</p>
                  </div>
                  <div className="max-w-xs mx-auto space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                  </div>
                </div>
              )}

              {uploadState === 'processing' && (
                <div className="text-center py-12 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Processing with AI...</p>
                    <p className="text-muted-foreground mt-1">{processingStep}</p>
                  </div>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              )}

              {uploadState === 'review' && parsedProgram && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Program Extracted</h3>
                      <p className="text-muted-foreground">
                        Review the extracted content before saving
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      <Check className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  </div>

                  <Card className="bg-muted/30 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{parsedProgram.name}</CardTitle>
                      <CardDescription>{parsedProgram.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{parsedProgram.durationWeeks} weeks</span>
                        <span>{parsedProgram.days.length} workout days</span>
                        <span>
                          {parsedProgram.days.reduce((sum, d) => sum + d.exercises.length, 0)} exercises
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {parsedProgram.days.map((day, index) => (
                      <Card key={index} className="bg-muted/30 border-border/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{day.name}</CardTitle>
                            <Badge variant="outline">{day.exercises.length} exercises</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {day.exercises.map((exercise, exIndex) => (
                              <div
                                key={exIndex}
                                className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0"
                              >
                                <span>{exercise.name}</span>
                                <span className="text-muted-foreground">
                                  {exercise.sets} x {exercise.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetUpload} className="flex-1">
                      <X className="mr-2 h-4 w-4" />
                      Start Over
                    </Button>
                    <Button onClick={handleConfirm} className="btn-primary flex-1">
                      <Check className="mr-2 h-4 w-4" />
                      Save Program
                    </Button>
                  </div>
                </div>
              )}

              {uploadState === 'complete' && (
                <div className="text-center py-12 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Program Created!</p>
                    <p className="text-muted-foreground mt-1">
                      Redirecting to your programs...
                    </p>
                  </div>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-base">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Upload your PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Upload any workout program PDF file
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">AI Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI extracts exercises, sets, and reps
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Review & Edit</p>
                  <p className="text-sm text-muted-foreground">
                    Verify the extracted content and make adjustments
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Assign to Clients</p>
                  <p className="text-sm text-muted-foreground">
                    Your program is ready to assign
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Standard workout PDFs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Program spreadsheets as PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Text-based programs</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span>Image-only PDFs (scanned)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Pro Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For best results, use PDFs with clearly formatted exercises,
                    sets, and reps. Tables work great!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
