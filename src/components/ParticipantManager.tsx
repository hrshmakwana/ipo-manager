import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Participant, DematAccount, IPODetails } from "./IPODashboard";

interface ParticipantManagerProps {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  dematAccounts: DematAccount[];
  ipoDetails: IPODetails;
}

export const ParticipantManager = ({ participants, setParticipants, dematAccounts, ipoDetails }: ParticipantManagerProps) => {
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    investmentAmount: "",
    dematAccount: ""
  });
  const { toast } = useToast();

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.investmentAmount || !newParticipant.dematAccount) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields to add a participant.",
        variant: "destructive"
      });
      return;
    }

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      investmentAmount: parseFloat(newParticipant.investmentAmount),
      dematAccount: newParticipant.dematAccount
    };

    setParticipants([...participants, participant]);
    setNewParticipant({ name: "", investmentAmount: "", dematAccount: "" });
    
    toast({
      title: "Participant Added",
      description: `${participant.name} has been added successfully.`,
      variant: "default"
    });
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    toast({
      title: "Participant Removed",
      description: "Participant has been removed successfully.",
      variant: "default"
    });
  };

  const getDematAccountName = (accountId: string) => {
    const account = dematAccounts.find(acc => acc.id === accountId);
    return account ? account.accountName : "Unknown Account";
  };

  const getDematAccountOwner = (accountId: string) => {
    const account = dematAccounts.find(acc => acc.id === accountId);
    return account ? account.ownerName : "Unknown Owner";
  };

  const getSharesFromInvestment = (investmentAmount: number) => {
    if (!ipoDetails.issuePrice || ipoDetails.issuePrice === 0) return 0;
    return investmentAmount / ipoDetails.issuePrice;
  };

  const getOwnershipPercentage = (investmentAmount: number, dematAccountId: string) => {
    const accountParticipants = participants.filter(p => p.dematAccount === dematAccountId);
    const totalAccountInvestment = accountParticipants.reduce((sum, p) => sum + p.investmentAmount, 0) + investmentAmount;
    if (totalAccountInvestment === 0) return 0;
    return (investmentAmount / totalAccountInvestment) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Add New Participant */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Participant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Participant Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                value={newParticipant.investmentAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (parseFloat(value) < 0) {
                    toast({
                      title: "Invalid Amount",
                      description: "Investment amount cannot be negative.",
                      variant: "destructive"
                    });
                    return;
                  }
                  setNewParticipant({ ...newParticipant, investmentAmount: value });
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demat">Demat Account</Label>
              <Select
                value={newParticipant.dematAccount}
                onValueChange={(value) => setNewParticipant({ ...newParticipant, dematAccount: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {dematAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.ownerName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={addParticipant} className="w-full bg-gradient-primary text-primary-foreground">
                Add Participant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Participants List</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participants added yet. Add your first participant above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Investment Amount</TableHead>
                  <TableHead>Shares & Ownership</TableHead>
                  <TableHead>Demat Account</TableHead>
                  <TableHead>Account Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {participants.map((participant) => {
                   const shares = getSharesFromInvestment(participant.investmentAmount);
                   const accountParticipants = participants.filter(p => p.dematAccount === participant.dematAccount);
                   const totalAccountInvestment = accountParticipants.reduce((sum, p) => sum + p.investmentAmount, 0);
                   const ownershipPercentage = totalAccountInvestment > 0 ? (participant.investmentAmount / totalAccountInvestment) * 100 : 0;
                  
                  return (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell className="text-accent font-semibold">
                        ₹{participant.investmentAmount.toLocaleString()}
                      </TableCell>
                       <TableCell>
                         <div className="text-sm space-y-1">
                          {shares > 0 && (
                            <div className="font-medium">
                              {shares % 1 === 0 ? shares.toFixed(0) : shares.toFixed(2)} shares
                            </div>
                          )}
                           <div className="text-xs font-medium text-primary">
                             {ownershipPercentage.toFixed(2)}% ownership in account
                           </div>
                         </div>
                       </TableCell>
                      <TableCell>{getDematAccountName(participant.dematAccount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getDematAccountOwner(participant.dematAccount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};