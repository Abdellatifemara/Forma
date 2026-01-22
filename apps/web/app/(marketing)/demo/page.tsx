export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Watch Demo</h1>
      <div className="max-w-3xl mx-auto">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-8">
          <p className="text-muted-foreground">Demo video coming soon</p>
        </div>
        <p className="text-center text-muted-foreground">
          See how Forma can transform your fitness journey with AI-powered workouts,
          nutrition tracking, and personalized coaching.
        </p>
      </div>
    </div>
  );
}
