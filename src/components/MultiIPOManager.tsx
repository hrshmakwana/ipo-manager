import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, TrendingUp, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MultiIPO } from "./MultiIPODashboard";
import type { DematAccount } from "./IPODashboard";

interface MultiIPOManagerProps {
  ipos: MultiIPO[];
  setIPOs: (ipos: MultiIPO[]) => void;
  dematAccounts: DematAccount[];
  onSelectIPO: (ipoId: string) => void;
  onDeleteIPO: (ipoId: string) => void;
}

export const MultiIPOManager = ({ 
  ipos, 
  setIPOs, 
  dematAccounts, 
  onSelectIPO, 
  onDeleteIPO 
}: MultiIPOManagerProps) => {
  const { toast } = useToast();

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

    return {
      totalInvestment,
      totalParticipants,
      processedResults,
      totalShares
    };
  };

  const getStatusBadge = (ipo: MultiIPO) => {
    if (!ipo.details.name || !ipo.details.issuePrice) {
      return <Badge variant="secondary">Setup Required</Badge>;
    }
    if (ipo.participants.length === 0) {
      return <Badge variant="outline">No Participants</Badge>;
    }
    if (ipo.results.length === 0) {
      return <Badge variant="outline">Pending Results</Badge>;
    }
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
                      <TableCell className="font-medium">
                        {ipo.details.name || (
                          <span className="text-muted-foreground italic">
                            Unnamed IPO ({ipo.id.slice(0, 8)})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ipo)}
                      </TableCell>
                      <TableCell className="text-accent font-semibold">
                        {ipo.details.issuePrice > 0 
                          ? `₹${ipo.details.issuePrice.toFixed(2)}`
                          : <span className="text-muted-foreground">Not set</span>
                        }
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
                          <span className="font-semibold text-accent">
                            ₹{stats.totalInvestment.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {stats.totalShares > 0 
                          ? (stats.totalShares % 1 === 0 
                              ? stats.totalShares.toFixed(0) 
                              : stats.totalShares.toFixed(2)
                            )
                          : "0"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={stats.processedResults > 0 ? "default" : "outline"}>
                          {stats.processedResults} processed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteIPO(ipo.id, ipo.details.name)}
                          >
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

      {/* Summary Cards */}
      {ipos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investment Across All IPOs</p>
                  <p className="text-2xl font-bold text-accent">
                    ₹{ipos.reduce((sum, ipo) => {
                      const ipoInvestment = ipo.participants.reduce((pSum, p) => pSum + p.investmentAmount, 0);
                      return sum + ipoInvestment;
                    }, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">
                    {ipos.reduce((sum, ipo) => sum + ipo.participants.length, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active IPOs</p>
                  <p className="text-2xl font-bold text-success">
                    {ipos.filter(ipo => 
                      ipo.details.name && ipo.details.issuePrice > 0 && ipo.participants.length > 0
                    ).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};