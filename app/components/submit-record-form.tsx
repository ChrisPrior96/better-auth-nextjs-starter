'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitRecord } from '@/app/actions/records'
import { Button } from '@/components/ui/button'

type StateType = {
  success: boolean;
  record?: any;
  error?: string | null;
}

// For proper typing with server actions
const submitRecordWithState = (state: StateType, formData: FormData) => {
  return submitRecord(formData);
}

export function SubmitRecordForm() {
  const [state, formAction] = useFormState<StateType, FormData>(
    submitRecordWithState, 
    {
      success: false,
      error: null,
    }
  );

  return (
    <form action={formAction}>
      {/* Your form fields */}
      
      <SubmitButton />
      
      {state.error && (
        <p className="text-red-500 mt-2">{state.error}</p>
      )}
    </form>
  )
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Record'}
    </Button>
  );
} 