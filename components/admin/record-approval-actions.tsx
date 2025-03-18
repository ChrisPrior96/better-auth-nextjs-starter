"use client"

import { useState } from "react"
import { reviewRecord } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  XCircle, 
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface RecordApprovalActionsProps {
  recordId: string
}

export function RecordApprovalActions({ recordId }: RecordApprovalActionsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  
  const handleApproval = async (action: 'approve' | 'reject') => {
    setIsLoading(true)
    setApprovalAction(action)
    
    try {
      const result = await reviewRecord(recordId, action)
      
      if (result.success) {
        toast.success(`Record ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      } else {
        toast.error(`Failed to ${action} record: ${result.error}`)
      }
    } catch (error) {
      toast.error(`An error occurred: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
        onClick={() => handleApproval('approve')}
        disabled={isLoading}
      >
        {isLoading && approvalAction === 'approve' ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-1" />
        )}
        Approve
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => handleApproval('reject')}
        disabled={isLoading}
      >
        {isLoading && approvalAction === 'reject' ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 mr-1" />
        )}
        Reject
      </Button>
    </div>
  )
} 