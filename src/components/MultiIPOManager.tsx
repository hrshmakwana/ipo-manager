import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, TrendingUp, Users, DollarSign, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MultiIPO } from "./MultiIPODashboard";
import type { DematAccount, IPODetails } from "./IPODashboard";

interface MultiIPOManagerProps {
  ipos: MultiIPO[];
  setIPOs: (ipos: MultiIPO[]) => void;
  dematAccounts: DematAccount[];
  onSelectIPO: (ipoId: string) => void;
  onEditIPO: (ipoId: string, details: IPODetails) => void;
  onDeleteIPO: (ipoId: string) => void;
}

export const MultiIPOManager = ({ 
  ipos, 
  setIPOs, 
  dematAccounts, 
  onSelectIPO, 
  onEditIPO,
  onDeleteIPO 
}: MultiIPOManagerProps) => {
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIPO, setEditingIPO] = useState<MultiIPO | null>(null);
  const [editForm, setEditForm] = useState<IPODetails>({
    name: "",
    lotPrice: 0,
    sharesPerLot: 0,
    issuePrice: 0
  });

  const handleEditClick = (ipo: MultiIPO) => {
    setEditingIPO(ipo);
    setEditForm({ ...ipo.details });
    setIsEditDialogOpen(true);
  };

  const handleFormChange = (field: keyof IPODetails, value: string | number) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'lotPrice' || field === 'sharesPerLot') {
        const lotPrice = field === 'lotPrice' ? Number(value) : prev.lotPrice;
        const shares = field === 'sharesPerLot' ? Number(value) : prev.sharesPerLot;
        
        if (lotPrice > 0 && shares > 0) {
          updated.issuePrice = Number((lotPrice / shares).toFixed(2));
        } else {
          updated.issuePrice = 0;
        }
      }
      return updated;
    });
  };

  const handleSaveEdit = () => {
    if (editingIPO) {
      onEditIPO(editingIPO.id, editForm);
      setIsEditDialogOpen(false);
      toast({
        title: "IPO Updated",
        description: "IPO details have been saved successfully.",
        variant: "default"
      });
    }
  };

  const handleDeleteIPO = (ipoId: string, ipoName: string) => {
    onDeleteIPO(ipoId);
    toast({
      title: "IPO Deleted",
      description: `${ipoName || "IPO"} has been deleted successfully.`,
      variant: "default"
    });
  };

  const getIPOStats = (ipo: MultiIPO) => {
    const totalInvestment = ipo.participants.reduce((sum, p) => sum + p.investmentAmount, 0);
    const totalParticipants = ipo.participants.length;
    const processedResults = ipo.results.length;
    const totalShares = ipo.details.issuePrice > 0 
      ? totalInvestment / ipo.details.issuePrice 
      : 0;

    return { totalInvestment, totalParticipants, processedResults, totalShares };
  };

  const getStatusBadge = (ipo: MultiIPO) => {
    if (!ipo.details.name || !ipo.details.issuePrice) return <Badge variant="secondary">Setup Required</Badge>;
    if (ipo.participants.length === 0) return <Badge variant="outline">No Participants</Badge>;
    if (ipo.results.length === 0) return <Badge variant="outline">Pending Results</Badge>;
    return <Badge variant="default" className="bg-success">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            All IPOs Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ipos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No IPOs added yet. Click "Add New IPO" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IPO Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Price</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Total Shares</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipos.map((ipo) => {
                  const stats = getIPOStats(ipo);
                  return (
                    <TableRow key={ipo.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium cursor-pointer" onClick={() => onSelectIPO(ipo.id)}>
                        {ipo.details.name || <span className="text-muted-foreground italic">Unnamed IPO</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(ipo)}</TableCell>
                      <TableCell className="text-accent font-semibold">
                        {ipo.details.issuePrice > 0 ? `₹${ipo.details.issuePrice.toFixed(2)}` : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">{stats.totalParticipants}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <span className="font-semibold text-accent">₹{stats.totalInvestment.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {stats.totalShares > 0 ? (stats.totalShares % 1 === 0 ? stats.totalShares.toFixed(0) : stats.totalShares.toFixed(2)) : "0"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stats.processedResults > 0 ? "default" : "outline"}>{stats.processedResults} processed</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          
                          {}
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(ipo)}>
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>

                          {}
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteIPO(ipo.id, ipo.details.name)}>
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit IPO Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lotPrice" className="text-right">Lot Price</Label>
              <Input
                id="lotPrice"
                type="number"
                value={editForm.lotPrice}
                onChange={(e) => handleFormChange("lotPrice", parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shares" className="text-right">Shares/Lot</Label>
              <Input
                id="shares"
                type="number"
                value={editForm.sharesPerLot}
                onChange={(e) => handleFormChange("sharesPerLot", parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issuePrice" className="text-right">Issue Price</Label>
              <Input
                id="issuePrice"
                value={editForm.issuePrice}
                disabled
                className="col-span-3 bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveEdit}>
                <Save className="w-4 h-4 mr-2"/> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};