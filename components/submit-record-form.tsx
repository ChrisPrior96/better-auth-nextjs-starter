'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitRecord } from '@/app/actions/records'
import { getAllUsersWithRsn } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, X, Upload, Search, Check, ChevronDown, UserPlus, User } from "lucide-react";

// Type re-export - should match the server action's return type
type UserWithRsn = {
  id: string;
  rsn: string;
}

type StateType = {
  success: boolean;
  record?: any;
  error?: string | null;
}

interface SubmitRecordFormProps {
  preselectedBossId?: string;
  bosses: Array<{
    id: string;
    name: string;
    allowedTeamSizes: string[];
  }>;
}

// For proper typing with server actions
const submitRecordWithState = (state: StateType, formData: FormData) => {
  return submitRecord(formData);
}

export function SubmitRecordForm({ preselectedBossId, bosses }: SubmitRecordFormProps) {
  const [state, formAction] = useFormState<StateType, FormData>(
    submitRecordWithState, 
    {
      success: false,
      error: null,
    }
  );

  // State for selected boss and team size
  const [selectedBossId, setSelectedBossId] = useState<string>(preselectedBossId || '');
  const [selectedTeamSize, setSelectedTeamSize] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<UserWithRsn[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allUsers, setAllUsers] = useState<UserWithRsn[]>([]);
  
  // Boss search state
  const [isBossDropdownOpen, setIsBossDropdownOpen] = useState<boolean>(false);
  const [bossSearchTerm, setBossSearchTerm] = useState<string>('');
  const bossDropdownRef = useRef<HTMLDivElement>(null);
  
  // Team member search state
  const [memberSearchTerm, setMemberSearchTerm] = useState<string>('');
  const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState<boolean>(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  
  // Time input state
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [milliseconds, setMilliseconds] = useState<number>(0);
  
  // Fetch all users with RSN on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsersWithRsn();
      const validUsers = users
        .filter(user => user.rsn !== null && user.rsn !== undefined)
        .map(user => ({
          id: user.id,
          rsn: user.rsn!
        }));
      setAllUsers(validUsers);
    };
    
    fetchUsers();
  }, []);
  
  // Get selected boss data
  const selectedBoss = bosses.find(b => b.id === selectedBossId);
  
  // Get allowed team sizes for selected boss
  const allowedTeamSizes = selectedBoss?.allowedTeamSizes || [];
  
  // Filter bosses based on search term
  const filteredBosses = bosses.filter(boss => 
    boss.name.toLowerCase().includes(bossSearchTerm.toLowerCase())
  );
  
  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => 
    user.rsn.toLowerCase().includes(memberSearchTerm.toLowerCase()) &&
    // Don't show users that are already selected
    !teamMembers.some(member => member.id === user.id)
  );
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bossDropdownRef.current && !bossDropdownRef.current.contains(event.target as Node)) {
        setIsBossDropdownOpen(false);
      }
      
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setIsMemberDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set boss name in search when a boss is selected
  useEffect(() => {
    if (selectedBossId) {
      const boss = bosses.find(b => b.id === selectedBossId);
      if (boss) {
        setBossSearchTerm(boss.name);
      }
    }
  }, [selectedBossId, bosses]);
  
  // Update team members array when team size changes
  useEffect(() => {
    if (!selectedTeamSize) {
      setTeamMembers([]);
      return;
    }
    
    // Parse team size (e.g., "solo" => 1, "duo" => 2, "trio" => 3, etc.)
    let teamSize = 1;
    switch (selectedTeamSize) {
      case 'solo': teamSize = 1; break;
      case 'duo': teamSize = 2; break;
      case 'trio': teamSize = 3; break;
      default: 
        // For team sizes like "4-man", extract the number
        const match = selectedTeamSize.match(/(\d+)-man/);
        if (match) {
          teamSize = parseInt(match[1], 10);
        }
    }
    
    // Initialize team members array (minus the submitter)
    const additionalMembers = Math.max(0, teamSize - 1);
    // Create an array of empty member slots
    setTeamMembers(Array(additionalMembers).fill(null).map(() => ({ id: '', rsn: '' })));
  }, [selectedTeamSize]);
  
  // Handle boss selection
  const handleSelectBoss = (bossId: string) => {
    setSelectedBossId(bossId);
    setIsBossDropdownOpen(false);
    
    // Reset team size when boss changes
    setSelectedTeamSize('');
  };
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };
  
  // Handle team member selection
  const handleSelectTeamMember = (index: number, user: UserWithRsn) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index] = user;
    setTeamMembers(newTeamMembers);
    setMemberSearchTerm('');
    setIsMemberDropdownOpen(false);
    setActiveMemberIndex(null);
  };
  
  // Handle removing a team member
  const handleRemoveTeamMember = (index: number) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index] = { id: '', rsn: '' };
    setTeamMembers(newTeamMembers);
  };
  
  // Handle opening the member dropdown for a specific index
  const handleOpenMemberDropdown = (index: number) => {
    setActiveMemberIndex(index);
    setIsMemberDropdownOpen(true);
    setMemberSearchTerm('');
  };
  
  // Get formatted time string for submission
  const getFormattedTime = () => {
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');
    const paddedMilliseconds = milliseconds.toString().padStart(3, '0');
    
    // Return format MM:SS.mmm as expected by the server
    return `${paddedMinutes}:${paddedSeconds}.${paddedMilliseconds}`;
  };
  
  // Success message
  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p>Your record has been submitted and is awaiting approval by a moderator.</p>
            <Button
              variant="link"
              className="ml-0 pl-0 text-green-600 p-0 h-auto"
              onClick={() => window.location.href = "/dashboard"}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields for submit */}
      <input
        type="hidden"
        name="bossId"
        value={selectedBossId}
      />
      {imageFile && (
        <input 
          type="hidden" 
          name="screenshotUrl" 
          value={imagePreview || 'https://example.com/placeholder.jpg'}
        />
      )}
      
      {/* Map each team member to individual inputs instead of a JSON array */}
      {teamMembers
        .filter(member => member.id !== '' && member.rsn !== '')
        .map((member, idx) => (
          <React.Fragment key={idx}>
            <input type="hidden" name={`teamMember_${idx}_id`} value={member.id} />
            <input type="hidden" name={`teamMember_${idx}_rsn`} value={member.rsn} />
          </React.Fragment>
        ))
      }
      
      {/* Add the teamMembers array as JSON */}
      <input 
        type="hidden" 
        name="teamMembers" 
        value={JSON.stringify(teamMembers
          .filter(member => member.id !== '' && member.rsn !== '')
          .map(member => member.id))} 
      />
      
      {/* Add hidden input for formatted completion time */}
      <input
        type="hidden"
        name="completionTime"
        value={getFormattedTime()}
      />
      
      {/* Boss Selection with Search */}
      <div className="space-y-2">
        <Label htmlFor="boss-search">Boss</Label>
        <div className="relative" ref={bossDropdownRef}>
          <div 
            className="flex items-center justify-between w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
            onClick={() => setIsBossDropdownOpen(!isBossDropdownOpen)}
          >
            <div className="flex items-center flex-1">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input
                id="boss-search"
                type="text"
                className="bg-transparent border-none outline-none flex-1"
                placeholder="Search for a boss..."
                value={bossSearchTerm}
                onChange={(e) => {
                  setBossSearchTerm(e.target.value);
                  setIsBossDropdownOpen(true);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
          </div>
          
          {isBossDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
              <div className="max-h-60 overflow-auto p-1">
                {filteredBosses.length > 0 ? (
                  filteredBosses.map(boss => (
                    <div
                      key={boss.id}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${
                        selectedBossId === boss.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSelectBoss(boss.id)}
                    >
                      <span>{boss.name}</span>
                      {selectedBossId === boss.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No bosses found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {selectedBoss && (
          <p className="text-xs text-muted-foreground">
            Available team sizes: {selectedBoss.allowedTeamSizes.join(', ')}
          </p>
        )}
      </div>
      
      {/* Team Size Selection - only visible after boss selection */}
      {selectedBossId && (
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <select
            id="teamSize"
            name="teamSize"
            value={selectedTeamSize}
            onChange={(e) => setSelectedTeamSize(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select team size</option>
            {allowedTeamSizes.map(size => (
              <option key={size} value={size}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Completion Time - improved version */}
      <div className="space-y-2">
        <Label htmlFor="completionTime">Completion Time</Label>
        <div className="flex items-center gap-1">
          <div className="space-y-1">
            <Input 
              type="number" 
              min="0"
              max="99"
              className="w-16 text-center"
              value={hours}
              onChange={(e) => setHours(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
            />
            <span className="text-xs text-center block">Hours</span>
          </div>
          <span className="text-xl pb-5">:</span>
          <div className="space-y-1">
            <Input 
              type="number" 
              min="0"
              max="59"
              className="w-16 text-center"
              value={minutes}
              onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            />
            <span className="text-xs text-center block">Minutes</span>
          </div>
          <span className="text-xl pb-5">:</span>
          <div className="space-y-1">
            <Input 
              type="number" 
              min="0"
              max="59"
              className="w-16 text-center"
              value={seconds}
              onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            />
            <span className="text-xs text-center block">Seconds</span>
          </div>
          <span className="text-xl pb-5">.</span>
          <div className="space-y-1">
            <Input 
              type="number" 
              min="0"
              max="999"
              className="w-20 text-center"
              value={milliseconds}
              onChange={(e) => setMilliseconds(Math.min(999, Math.max(0, parseInt(e.target.value) || 0)))}
            />
            <span className="text-xs text-center block">Milliseconds</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your completion time in hours, minutes, seconds and milliseconds
        </p>
      </div>
      
      {/* Team Members - only visible after team size selection for non-solo runs */}
      {teamMembers.length > 0 && (
        <div className="space-y-4">
          <Label>Team Members</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select each team member who participated from registered users.
          </p>
          
          {teamMembers.map((member, index) => (
            <div key={index} className="relative">
              <div 
                className={`flex items-center w-full rounded-md border ${
                  member.rsn ? 'bg-primary/5 border-primary/20' : 'bg-background border-input'
                } px-3 py-2 text-sm`}
                onClick={() => handleOpenMemberDropdown(index)}
              >
                {member.rsn ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-primary mr-2" />
                      <span>{member.rsn}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTeamMember(index);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <UserPlus className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Select team member {index + 1}</span>
                  </div>
                )}
              </div>
              
              {isMemberDropdownOpen && activeMemberIndex === index && (
                <div 
                  className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-lg"
                  ref={memberDropdownRef}
                >
                  <div className="p-2">
                    <div className="flex items-center px-2 py-1.5 rounded-md border border-input bg-background">
                      <Search className="h-4 w-4 text-muted-foreground mr-2" />
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        placeholder="Search for player..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-auto p-1">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted"
                          onClick={() => handleSelectTeamMember(index, user)}
                        >
                          <User className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{user.rsn}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Screenshot Upload */}
      <div className="space-y-2">
        <Label htmlFor="screenshot">Screenshot Proof</Label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer" onClick={() => document.getElementById('screenshot')?.click()}>
          <input
            type="file"
            id="screenshot"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          
          {imagePreview ? (
            <div className="relative w-full">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setImagePreview(null);
                  setImageFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <img 
                src={imagePreview} 
                alt="Screenshot preview" 
                className="max-h-64 max-w-full rounded-md mx-auto"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG or WEBP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-4">
        <SubmitButton />
      </div>
      
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p>{state.error}</p>
          </div>
        </div>
      )}
    </form>
  )
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Submitting...' : 'Submit Record'}
    </Button>
  );
}