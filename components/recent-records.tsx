import { getRecentRecords } from '@/app/actions/records'
import { Users } from 'lucide-react'

// Define types
interface Boss {
  id: string;
  name: string;
  imageUrl: string;
}

interface User {
  username: string;
  rsn: string;
  name?: string; // Add optional name field
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
  // Get submitter's RSN (prefer RSN over username/name)
  const getSubmitterRsn = () => {
    if (submitter.rsn && submitter.rsn !== "unknown") {
      return submitter.rsn;
    }
    // Fallback to username if RSN not available
    return submitter.username || submitter.name || "unknown player";
  };

  // Format team members for display
  const displayTeam = () => {
    const submitterRsn = getSubmitterRsn();
    
    // For solo records, just show the submitter's RSN
    if (record.teamSize === 'solo') {
      return submitterRsn;
    }
    
    // For team records, ensure we include all members
    let allMembers = [...record.teamMembers];
    
    // Make sure the submitter is included in the team list
    if (!allMembers.includes(submitterRsn) && submitterRsn !== "unknown player") {
      allMembers = [submitterRsn, ...allMembers];
    }
    
    // Filter out any empty strings or duplicates
    allMembers = allMembers
      .filter(member => member && member.trim() !== '')
      .filter((member, index, self) => self.indexOf(member) === index);
      
    return (
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="line-clamp-2">{allMembers.join(', ')}</span>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-2">
        <h3 className="text-lg font-bold">{boss.name}</h3>
        <div className="text-sm text-muted-foreground">
          {displayTeam()}
        </div>
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