import { getPendingRecords } from "@/app/actions/admin"
import { RecordPreview } from "@/components/admin/record-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  AlertCircle,
  ClipboardCheck
} from "lucide-react"
import Link from "next/link"

export default async function PendingRecordsPage() {
  const { success, records, error } = await getPendingRecords()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Pending Records</h1>
        </div>
      </div>
      
      <div className="flex items-center bg-muted/50 rounded-md p-4 space-x-3">
        <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm">
          Review submitted records and approve or reject them. Approved records will appear on the leaderboards.
        </p>
      </div>
      
      {!success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Failed to load pending records. Please try again."}
          </AlertDescription>
        </Alert>
      )}
      
      {success && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-medium mb-1">No pending records</h2>
          <p>All records have been reviewed. Check back later for new submissions.</p>
        </div>
      )}
      
      {success && records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <RecordPreview 
              key={record.id} 
              record={{
                ...record,
                createdAt: record.createdAt || new Date() 
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
} 