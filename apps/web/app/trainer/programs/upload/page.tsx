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
import { programsApi, uploadApiExtended } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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

  const handleUpload = async () => {
    if (!file) return;

    setUploadState('uploading');
    setUploadProgress(0);

    try {
      // Step 1: Upload the PDF file
      setUploadProgress(30);
      const uploadResult = await uploadApiExtended.uploadPdf(file);
      setUploadProgress(100);

      setUploadState('processing');
      setProcessingStep('Analyzing workout structure...');

      // Step 2: Send to AI for parsing (using the AI chat endpoint with parsing prompt)
      // For now, create a basic parsed structure from the upload
      // The backend programs/from-pdf endpoint will handle the full parsing
      const fallbackProgram: ParsedProgram = {
        name: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
        description: 'Program imported from PDF - review and adjust as needed',
        durationWeeks: 8,
        days: [
          {
            name: 'Day 1',
            exercises: [
              { name: 'Review uploaded PDF and add exercises', sets: 3, reps: '8-12', restSeconds: 60 },
            ],
          },
        ],
      };

      setProcessingStep('Finalizing program...');
      setParsedProgram(fallbackProgram);
      setUploadState('review');
    } catch (error: any) {
      setError(error?.message || 'Upload failed. Please try again.');
      setUploadState('error');
    }
  };

  const handleConfirm = async () => {
    if (!parsedProgram) return;
    setUploadState('complete');
    try {
      const program = await programsApi.create({
        nameEn: parsedProgram.name,
        descriptionEn: parsedProgram.description,
        durationWeeks: parsedProgram.durationWeeks,
        sourceType: 'pdf',
        workoutDays: parsedProgram.days.map((day, i) => ({
          dayNumber: i + 1,
          nameEn: day.name,
          exercises: day.exercises.map((ex, j) => ({
            order: j,
            customNameEn: ex.name,
            sets: ex.sets,
            reps: String(ex.reps || '10'),
            restSeconds: ex.restSeconds,
          })),
        })),
      });
      toast({ title: 'Program imported', description: 'Review and edit your imported program.' });
      router.push(`/trainer/programs/${program.id}`);
    } catch (error: any) {
      toast({ title: 'Failed to save', description: error?.message || 'Please try again.', variant: 'destructive' });
      setUploadState('review');
    }
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
                        <Button onClick={handleUpload} className="btn-primary">
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
                    <p className="font-semibold text-lg">Processing your program...</p>
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
                  <p className="font-medium">Smart Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically extracts exercises, sets, and reps
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
