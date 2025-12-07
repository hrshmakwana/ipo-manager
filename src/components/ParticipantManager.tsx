import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
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
      toast({ title: "Missing Information", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    const amount = parseFloat(newParticipant.investmentAmount);
    if (isNaN(amount) || amount <= 0) {
        toast({ title: "Invalid Amount", description: "Amount must be > 0.", variant: "destructive" });
        return;
    }

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      investmentAmount: amount,
      dematAccount: newParticipant.dematAccount
    };

    setParticipants([...participants, participant]);
    setNewParticipant({ name: "", investmentAmount: "", dematAccount: "" });
    toast({ title: "Participant Added", description: `${participant.name} added.`, variant: "default" });
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const getDematAccountName = (accountId: string) => dematAccounts.find(acc => acc.id === accountId)?.accountName || "Unknown";
  const getDematAccountOwner = (accountId: string) => dematAccounts.find(acc => acc.id === accountId)?.ownerName || "Unknown";

  return (
    <div className="space-y-6">
      {}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Add New Participant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Participant Name</Label>
              <Input placeholder="Enter name" value={newParticipant.name} onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Investment Amount (₹)</Label>
              <Input type="number" placeholder="0.00" min="0" value={newParticipant.investmentAmount} onChange={(e) => parseFloat(e.target.value) >= 0 && setNewParticipant({ ...newParticipant, investmentAmount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Demat Account</Label>
              <Select value={newParticipant.dematAccount} onValueChange={(value) => setNewParticipant({ ...newParticipant, dematAccount: value })}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {dematAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.accountName} ({account.ownerName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end"><Button onClick={addParticipant} className="w-full bg-gradient-primary">Add Participant</Button></div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader><CardTitle>Participants & Funding Status</CardTitle></CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No participants added yet.</p></div>
          ) : (
            <div className="space-y-8">
              {}
              {dematAccounts.map(account => {
                const accountParticipants = participants.filter(p => p.dematAccount === account.id);
                if (accountParticipants.length === 0) return null;

                const totalCollected = accountParticipants.reduce((sum, p) => sum + p.investmentAmount, 0);
                const targetAmount = ipoDetails.lotPrice > 0 ? ipoDetails.lotPrice : totalCollected;
                const gap = targetAmount - totalCollected;
                const coveragePercent = (totalCollected / targetAmount) * 100;

                return (
                  <div key={account.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{account.accountName} <span className="text-sm font-normal text-muted-foreground">({account.ownerName})</span></h3>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Required: ₹{targetAmount.toLocaleString()}</div>
                        <div className={`font-bold ${gap > 0 ? 'text-warning' : 'text-success'}`}>
                            {gap > 0 ? `Short by ₹${gap.toLocaleString()}` : "Fully Funded"}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden flex">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(coveragePercent, 100)}%` }} />
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Invested</TableHead>
                          <TableHead>Pool Share</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {}
                         {accountParticipants.map((participant) => {
                           const ownershipOfLot = (participant.investmentAmount / targetAmount) * 100;
                           
                          return (
                            <TableRow key={participant.id}>
                              <TableCell className="font-medium">{participant.name}</TableCell>
                              <TableCell>₹{participant.investmentAmount.toLocaleString()}</TableCell>
                              <TableCell>
                                 <span className="text-primary font-bold">{ownershipOfLot.toFixed(2)}%</span> of Lot
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="destructive" size="sm" onClick={() => removeParticipant(participant.id)}><Trash2 className="h-4 w-4" /></Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {}
                        {gap > 0 && ipoDetails.lotPrice > 0 && (
                            <TableRow className="bg-muted/30">
                                <TableCell className="font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-warning" />
                                    {account.ownerName} (Owner)
                                </TableCell>
                                <TableCell className="text-warning font-medium">₹{gap.toLocaleString()}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {( (gap / targetAmount) * 100 ).toFixed(2)}% (Gap Funding)
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="text-xs text-muted-foreground italic">Auto-calculated</span>
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};