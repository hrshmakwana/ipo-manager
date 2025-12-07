import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Building2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DematAccount, Participant, IPOResult } from "./IPODashboard";

interface DematAccountManagerProps {
  dematAccounts: DematAccount[];
  setDematAccounts: (accounts: DematAccount[]) => void;
  participants: Participant[];
}

export const DematAccountManager = ({ dematAccounts, setDematAccounts, participants }: DematAccountManagerProps) => {
  const [newAccount, setNewAccount] = useState({
    accountName: "",
    ownerName: "",
    commissionRate: ""
  });
  const { toast } = useToast();

  const addDematAccount = () => {
    if (!newAccount.accountName || !newAccount.ownerName || !newAccount.commissionRate) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields to add a demat account.",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = participants
      .filter(p => p.dematAccount === "temp")
      .reduce((sum, p) => sum + p.investmentAmount, 0);

    const account: DematAccount = {
      id: Date.now().toString(),
      accountName: newAccount.accountName,
      ownerName: newAccount.ownerName,
      commissionRate: parseFloat(newAccount.commissionRate),
      totalAmount: 0
    };

    setDematAccounts([...dematAccounts, account]);
    setNewAccount({ accountName: "", ownerName: "", commissionRate: "" });
    
    toast({
      title: "Demat Account Added",
      description: `${account.accountName} has been added successfully.`,
      variant: "default"
    });
  };

  const removeDematAccount = (id: string) => {
    const hasParticipants = participants.some(p => p.dematAccount === id);
    
    if (hasParticipants) {
      toast({
        title: "Cannot Delete",
        description: "This account has participants assigned. Please reassign them first.",
        variant: "destructive"
      });
      return;
    }

    setDematAccounts(dematAccounts.filter(acc => acc.id !== id));
    toast({
      title: "Account Removed",
      description: "Demat account has been removed successfully.",
      variant: "default"
    });
  };

  const getAccountTotal = (accountId: string) => {
    return participants
      .filter(p => p.dematAccount === accountId)
      .reduce((sum, p) => sum + p.investmentAmount, 0);
  };

  const getAccountParticipantCount = (accountId: string) => {
    return participants.filter(p => p.dematAccount === accountId).length;
  };

  return (
    <div className="space-y-6">
      {}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Demat Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Account Owner</Label>
              <Input
                id="ownerName"
                placeholder="Owner name"
                value={newAccount.ownerName}
                onChange={(e) => setNewAccount({ ...newAccount, ownerName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g., Zerodha-001"
                value={newAccount.accountName}
                onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={newAccount.commissionRate}
                onChange={(e) => setNewAccount({ ...newAccount, commissionRate: e.target.value })}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={addDematAccount} className="w-full bg-gradient-primary text-primary-foreground">
                Add Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Demat Accounts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {dematAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No demat accounts added yet. Add your first account above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dematAccounts.map((account) => {
                  const accountTotal = getAccountTotal(account.id);
                  const participantCount = getAccountParticipantCount(account.id);
                  
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.accountName}</TableCell>
                      <TableCell>{account.ownerName}</TableCell>
                      <TableCell className="text-warning font-semibold">
                        {account.commissionRate}% (on profit)
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {participantCount} participant(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-accent font-semibold">
                            ₹{accountTotal.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Investment Amount
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeDematAccount(account.id)}
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