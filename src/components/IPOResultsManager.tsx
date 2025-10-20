import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, TrendingUp, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Participant, DematAccount, IPOResult, IPODetails } from "./IPODashboard";

interface IPOResultsManagerProps {
  participants: Participant[];
  dematAccounts: DematAccount[];
  ipoResults: IPOResult[];
  setIPOResults: (results: IPOResult[]) => void;
  ipoDetails: IPODetails;
}

export const IPOResultsManager = ({ participants, dematAccounts, ipoResults, setIPOResults, ipoDetails }: IPOResultsManagerProps) => {
  const [newResult, setNewResult] = useState({
    dematAccountId: "",
    isAllotted: "",
    sellingPrice: ""
  });
  const { toast } = useToast();

  const addIPOResult = () => {
    if (!newResult.dematAccountId || !newResult.isAllotted) {
      toast({
        title: "Missing Information",
        description: "Please select a demat account and allotment status.",
        variant: "destructive"
      });
      return;
    }

    const dematAccount = dematAccounts.find(acc => acc.id === newResult.dematAccountId);
    if (!dematAccount) return;

    // Get all participants in this demat account
    const accountParticipants = participants.filter(p => p.dematAccount === newResult.dematAccountId);
    const totalInvestment = accountParticipants.reduce((sum, p) => sum + p.investmentAmount, 0);
    
    const isAllotted = newResult.isAllotted === "true";
    let finalAmount = 0;
    let commissionDeducted = 0;

    if (isAllotted && newResult.sellingPrice) {
      // Calculate total lots and shares for this account
      const totalLots = Math.floor(totalInvestment / ipoDetails.lotPrice);
      const usedInvestment = totalLots * ipoDetails.lotPrice;
      const remainderInvestment = totalInvestment - usedInvestment; // refunded if unused
      const totalShares = totalLots * ipoDetails.sharesPerLot;
      const sellingPrice = parseFloat(newResult.sellingPrice);
      const totalSaleValue = totalShares * sellingPrice;
      const grossProfit = totalSaleValue - usedInvestment;
      
      // Commission calculation - check if commission rate exists
      const commissionRate = dematAccount.commissionRate || 0;
      if (grossProfit > 0 && commissionRate > 0) {
        commissionDeducted = (grossProfit * commissionRate) / 100;
      }
      
      // Final amount includes sale proceeds + any unused funds, minus commission
      finalAmount = totalSaleValue + remainderInvestment - commissionDeducted;
    } else {
      // Not allotted - return full investment (no commission on non-allotment)
      finalAmount = totalInvestment;
      commissionDeducted = 0;
    }

    const result: IPOResult = {
      id: Date.now().toString(),
      dematAccountId: newResult.dematAccountId,
      isAllotted,
      sellingPrice: isAllotted ? parseFloat(newResult.sellingPrice) : undefined,
      commissionDeducted,
      finalAmount,
      participantIds: accountParticipants.map(p => p.id)
    };

    setIPOResults([...ipoResults, result]);
    setNewResult({ dematAccountId: "", isAllotted: "", sellingPrice: "" });
    
    toast({
      title: "Result Added",
      description: `IPO result for ${dematAccount.accountName} has been recorded.`,
      variant: "default"
    });
  };

  const getDematAccountName = (accountId: string) => {
    const account = dematAccounts.find(acc => acc.id === accountId);
    return account ? account.accountName : "Unknown";
  };

  const getDematAccountOwner = (accountId: string) => {
    const account = dematAccounts.find(acc => acc.id === accountId);
    return account ? account.ownerName : "Unknown";
  };

  const getAccountTotal = (accountId: string) => {
    return participants
      .filter(p => p.dematAccount === accountId)
      .reduce((sum, p) => sum + p.investmentAmount, 0);
  };

  const getParticipantNames = (participantIds: string[]) => {
    return participantIds
      .map(id => participants.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const unprocessedAccounts = dematAccounts.filter(
    account => !ipoResults.some(r => r.dematAccountId === account.id) &&
    participants.some(p => p.dematAccount === account.id)
  );

  return (
    <div className="space-y-6">
      {/* Add IPO Result */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Record IPO Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demat-account">Demat Account</Label>
              <Select
                value={newResult.dematAccountId}
                onValueChange={(value) => setNewResult({ ...newResult, dematAccountId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select demat account" />
                </SelectTrigger>
                <SelectContent>
                  {unprocessedAccounts.map((account) => {
                    const total = getAccountTotal(account.id);
                    const participantCount = participants.filter(p => p.dematAccount === account.id).length;
                    return (
                      <SelectItem key={account.id} value={account.id}>
                        {account.ownerName} - {account.accountName} - ₹{total.toLocaleString()} ({participantCount} participants)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allotment">Allotment Status</Label>
              <Select
                value={newResult.isAllotted}
                onValueChange={(value) => setNewResult({ ...newResult, isAllotted: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Allotted</SelectItem>
                  <SelectItem value="false">Not Allotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newResult.isAllotted === "true" && (
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={newResult.sellingPrice}
                  onChange={(e) => setNewResult({ ...newResult, sellingPrice: e.target.value })}
                />
              </div>
            )}
            
            <div className="flex items-end">
              <Button onClick={addIPOResult} className="w-full bg-gradient-primary text-primary-foreground">
                Record Result
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>IPO Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {ipoResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No IPO results recorded yet. Add results above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demat Account</TableHead>
                  <TableHead>Account Owner</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipoResults.map((result) => {
                  const totalInvestment = getAccountTotal(result.dematAccountId);
                  const profitLoss = result.finalAmount - totalInvestment;
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {getDematAccountName(result.dematAccountId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getDematAccountOwner(result.dematAccountId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getParticipantNames(result.participantIds)}
                      </TableCell>
                      <TableCell className="text-accent font-semibold">
                        ₹{totalInvestment.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={result.isAllotted ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                          {result.isAllotted ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Allotted
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Not Allotted
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.isAllotted && result.sellingPrice ? (
                          <div className="text-sm">
                            ₹{result.sellingPrice}/share
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-warning font-semibold">
                        ₹{result.commissionDeducted.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{result.finalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${profitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString()}
                        </span>
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