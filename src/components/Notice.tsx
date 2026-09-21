import { CircleHelp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Notice({ message }: { message: string }) {
  return (
    <div className="fixed bottom-5 right-5">
      <Card>
        <CardContent className="flex items-center gap-2 py-3 text-sm">
          <CircleHelp className="size-4 text-primary" />
          {message}
        </CardContent>
      </Card>
    </div>
  );
}
