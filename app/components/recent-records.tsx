import { getRecentRecords } from '@/app/actions/records'

// Define types
interface Boss {
  id: string;
  name: string;
  imageUrl: string;
}

interface User {
  username: string;
  rsn: string;
}

interface Record {
  id: string;
  bossId: string | null;
  completionTime: string;
  teamSize: string;
  status: 'pending' | 'approved' | 'rejected' | null;
  submitterId: string | null;
  screenshotUrl: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  teamMembers: string[];
  boss: Boss | null;
  submitter: User;
}

// RecordCard component
const RecordCard = ({ 
  record, 
  boss, 
  submitter 
}: { 
  record: Record; 
  boss: Boss; 
  submitter: User; 
}) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-2">
        <h3 className="text-lg font-bold">{boss.name}</h3>
        <p className="text-sm text-muted-foreground">by {submitter.rsn}</p>
        <p className="text-2xl font-bold text-osrs-gold">{record.completionTime}</p>
        <div className="flex justify-between items-center">
          <span className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
            {record.teamSize}
          </span>
          <span className="text-xs text-muted-foreground">
            {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}

export async function RecentRecords() {
  const records = await getRecentRecords()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.filter(record => record.boss !== null).map((record) => (
        <RecordCard 
          key={record.id} 
          record={record as Record}
          boss={record.boss as Boss}
          submitter={record.submitter}
        />
      ))}
    </div>
  )
} 