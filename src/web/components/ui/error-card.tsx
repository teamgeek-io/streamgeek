import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

interface ErrorCardProps {
  title: string;
  message: string;
  className?: string;
}

export function ErrorCard({ title, message, className }: ErrorCardProps) {
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto p-6">
      <Card className={className}>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold text-destructive">
            {title}
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {message}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
