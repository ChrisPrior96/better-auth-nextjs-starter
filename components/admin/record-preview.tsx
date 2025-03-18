import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Trophy,
  User,
  Users,
  Clock,
  Calendar
} from "lucide-react"
import { RecordApprovalActions } from "./record-approval-actions"

interface RecordPreviewProps {
  record: {
    id: string
    completionTime: string
    teamSize: string
    teamMembers: string[]
    screenshotUrl: string
    createdAt: Date
    boss: {
      id: string
      name: string
      imageUrl: string
    } | null
    submitter: {
      id: string
      name: string
      rsn: string
    }
  }
}

export function RecordPreview({ record }: RecordPreviewProps) {
  const createdAt = new Date(record.createdAt)
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {record.boss?.name || "Unknown Boss"} - {record.teamSize}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{record.completionTime}</span>
              </div>
            </div>
          </div>
          
          {record.boss?.imageUrl && (
            <div className="w-12 h-12 relative shrink-0">
              <Image
                src={record.boss.imageUrl}
                alt={record.boss.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="aspect-video relative rounded-md overflow-hidden border">
            <Image
              src={record.screenshotUrl}
              alt="Record proof"
              fill
              className="object-contain"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Submitted By</h4>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{record.submitter.rsn || record.submitter.name}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Submitted</h4>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          {record.teamMembers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Team Members</h4>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{record.teamMembers.join(", ")}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <RecordApprovalActions recordId={record.id} />
      </CardFooter>
    </Card>
  )
} 