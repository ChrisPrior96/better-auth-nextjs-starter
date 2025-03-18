'use client'

import { approveRecord } from '@/app/actions/admin'

export function RecordApprovalButton({ recordId }: { recordId: string }) {
  const handleApprove = async () => {
    const result = await approveRecord(recordId)
    if (!result.success) {
      // Handle error
    }
  }

  return (
    <button onClick={handleApprove}>
      Approve Record
    </button>
  )
} 