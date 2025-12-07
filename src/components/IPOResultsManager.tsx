import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, XCircle, TrendingUp, Calculator, Edit, Trash2, Save } from "lucide-react";
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
  const { toast } = useToast();
  
  const [newResult, setNewResult] = useState({
    dematAccountId: "",
    isAllotted: "",
    sellingPrice: ""
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<IPOResult | null>(null);
  const [editForm, setEditForm] = useState({
    isAllotted: "false",
    sellingPrice: ""
  });

  const calculateFinancials = (dematAccountId: string, isAllottedStr: string, sellingPriceStr: string) => {
    const dematAccount = dematAccounts.find(acc => acc.id === dematAccountId);
    if (!dematAccount) return null;

    const accountParticipants = participants.filter(p => p.dematAccount === dematAccountId);
    const toFixedNumber = (num: number) => Number(Math.round(parseFloat(num + 'e2')) + 'e-2');
    const totalInvestment = accountParticipants.reduce((sum, p) => sum + p.investmentAmount, 0);
    
    const isAllotted = isAllottedStr === "true";
    let finalAmount = 0;
    let commissionDeducted = 0;
    let sellingPrice = undefined;

    if (isAllotted && sellingPriceStr) {
      const totalLots = Math.floor(totalInvestment / ipoDetails.lotPrice);
      const usedInvestment = totalLots * ipoDetails.lotPrice;
      const remainderInvestment = totalInvestment - usedInvestment; 
      
      const totalShares = totalLots * ipoDetails.sharesPerLot;
      sellingPrice = parseFloat(sellingPriceStr);
      
      const totalSaleValue = toFixedNumber(totalShares * sellingPrice);
      const grossProfit = toFixedNumber(totalSaleValue - usedInvestment);
      
      const commissionRate = dematAccount.commissionRate || 0;
      
      if (grossProfit > 0 && commissionRate > 0) {
        commissionDeducted = toFixedNumber((grossProfit * commissionRate) / 100);
      }
      
      finalAmount = toFixedNumber((totalSaleValue + remainderInvestment) - commissionDeducted);
    } else {
      finalAmount = totalInvestment;
      commissionDeducted = 0;
    }

    return {
      isAllotted,
      sellingPrice,
      commissionDeducted,
      finalAmount,
      participantIds: accountParticipants.map(p => p.id)
    };
  };
  const addIPOResult = () => {
    if (!newResult.dematAccountId || !newResult.isAllotted) {
      toast({ title: "Missing Information", description: "Select account and status.", variant: "destructive" });
      return;
    }

    const calculation = calculateFinancials(newResult.dematAccountId, newResult.isAllotted, newResult.sellingPrice);
    if (!calculation) return;

    const result: IPOResult = {
      id: Date.now().toString(),
      dematAccountId: newResult.dematAccountId,
      ...calculation
    };

    setIPOResults([...ipoResults, result]);
    setNewResult({ dematAccountId: "", isAllotted: "", sellingPrice: "" });
    toast({ title: "Result Recorded", description: "IPO result saved successfully.", variant: "default" });
  };
  const handleEditClick = (result: IPOResult) => {
    setEditingResult(result);
    setEditForm({
      isAllotted: result.isAllotted ? "true" : "false",
      sellingPrice: result.sellingPrice?.toString() || ""
    });
    setIsEditOpen(true);
  };

  const saveEdit = () => {
    if (!editingResult) return;

    const calculation = calculateFinancials(editingResult.dematAccountId, editForm.isAllotted, editForm.sellingPrice);
    if (!calculation) return;

    const updatedResult: IPOResult = {
      ...editingResult,
      ...calculation
    };

    setIPOResults(ipoResults.map(r => r.id === editingResult.id ? updatedResult : r));
    
    setIsEditOpen(false);
    setEditingResult(null);
    toast({ title: "Result Updated", description: "The result and financial calculations have been updated.", variant: "default" });
  };

  const handleDelete = (id: string) => {
    setIPOResults(ipoResults.filter(r => r.id !== id));
    toast({ title: "Deleted", description: "Result record removed.", variant: "default" });
  };

  const getDematAccountName = (id: string) => dematAccounts.find(acc => acc.id === id)?.accountName || "Unknown";
  const getDematAccountOwner = (id: string) => dematAccounts.find(acc => acc.id === id)?.ownerName || "Unknown";
  const getAccountTotal = (id: string) => participants.filter(p => p.dematAccount === id).reduce((sum, p) => sum + p.investmentAmount, 0);
  const getParticipantNames = (ids: string[]) => ids.map(id => participants.find(p => p.id === id)?.name).filter(Boolean).join(", ");

  const unprocessedAccounts = dematAccounts.filter(
    account => !ipoResults.some(r => r.dematAccountId === account.id) &&
    participants.some(p => p.dematAccount === account.id)
  );

  return (
    <div className="space-y-6">
      {}
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
              <Label>Demat Account</Label>
              <Select value={newResult.dematAccountId} onValueChange={(v) => setNewResult({ ...newResult, dematAccountId: v })}>
                <SelectTrigger><SelectValue placeholder="Select demat account" /></SelectTrigger>
                <SelectContent>
                  {unprocessedAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.ownerName} - {acc.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Allotment Status</Label>
              <Select value={newResult.isAllotted} onValueChange={(v) => setNewResult({ ...newResult, isAllotted: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Allotted</SelectItem>
                  <SelectItem value="false">Not Allotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newResult.isAllotted === "true" && (
              <div className="space-y-2">
                <Label>Selling Price (₹)</Label>
                <Input type="number" placeholder="0.00" value={newResult.sellingPrice} onChange={(e) => setNewResult({ ...newResult, sellingPrice: e.target.value })} />
              </div>
            )}
            
            <div className="flex items-end">
              <Button onClick={addIPOResult} className="w-full bg-gradient-primary">Record Result</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader><CardTitle>IPO Results Summary</CardTitle></CardHeader>
        <CardContent>
          {ipoResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No results recorded yet.</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demat Account</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipoResults.map((result) => {
                  const totalInvestment = getAccountTotal(result.dematAccountId);
                  const profitLoss = result.finalAmount - totalInvestment;
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{getDematAccountName(result.dematAccountId)}</TableCell>
                      <TableCell className="text-muted-foreground">{getDematAccountOwner(result.dematAccountId)}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{getParticipantNames(result.participantIds)}</TableCell>
                      <TableCell>₹{totalInvestment.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={result.isAllotted ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                          {result.isAllotted ? <><CheckCircle className="h-3 w-3" /> Allotted</> : <><XCircle className="h-3 w-3" /> Not Allotted</>}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.isAllotted && result.sellingPrice ? `₹${result.sellingPrice}` : "-"}</TableCell>
                      <TableCell className="text-warning">₹{result.commissionDeducted.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₹{result.finalAmount.toLocaleString()}</TableCell>
                      <TableCell className={`font-semibold ${profitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(result)}>
                                <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(result.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select value={editForm.isAllotted} onValueChange={(v) => setEditForm({ ...editForm, isAllotted: v })}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Allotted</SelectItem>
                        <SelectItem value="false">Not Allotted</SelectItem>
                    </SelectContent>
                </Select>
             </div>
             
             {editForm.isAllotted === "true" && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Selling Price</Label>
                    <Input 
                        type="number" 
                        value={editForm.sellingPrice} 
                        onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })} 
                        className="col-span-3"
                    />
                 </div>
             )}
          </div>
          <DialogFooter>
            <Button onClick={saveEdit} className="bg-gradient-primary">
                <Save className="h-4 w-4 mr-2" /> Update Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};