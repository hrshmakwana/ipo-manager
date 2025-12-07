import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import type { MultiIPO } from "./MultiIPODashboard";
import type { DematAccount } from "./IPODashboard";

interface ConsolidatedParticipantViewProps {
  ipos: MultiIPO[];
  dematAccounts: DematAccount[];
}

export const ConsolidatedParticipantView = ({ ipos, dematAccounts }: ConsolidatedParticipantViewProps) => {
  const allParticipants = new Map();
  
  ipos.forEach(ipo => {
    ipo.participants.forEach(participant => {
      const key = `${participant.name}-${participant.dematAccount}`;
      if (!allParticipants.has(key)) {
        allParticipants.set(key, {
          name: participant.name,
          dematAccount: participant.dematAccount,
          investments: new Map()
        });
      }
      
      allParticipants.get(key).investments.set(ipo.id, {
        ipoName: ipo.details.name,
        investment: participant.investmentAmount,
        result: ipo.results.find(r => r.participantIds.includes(participant.id))
      });
    });
  });

  const getDematAccountName = (accountId: string) => {
    return dematAccounts.find(acc => acc.id === accountId)?.accountName || "Unknown Account";
  };

  const calculateProfitLoss = (result: any, investment: number) => {
    if (!result || !result.isAllotted) return { profit: 0, returns: 0 };
    
    const sellingPrice = parseFloat(result.sellingPrice?.toString() || "0");
    if (sellingPrice === 0) return { profit: 0, returns: 0 };
    
    const dematAccount = dematAccounts.find(acc => acc.id === result.dematAccountId);
    const totalDematInvestment = dematAccount?.totalAmount || investment;
    const proportion = investment / totalDematInvestment;
    
    const proportionalFinalAmount = result.finalAmount * proportion;
    const netProfit = proportionalFinalAmount - investment;
    
    return { profit: netProfit, returns: 0 };
  };

  const participantArray = Array.from(allParticipants.values());

  if (ipos.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-8 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Add IPOs and participants to see consolidated view</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          All Participants & Investments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Demat Account</TableHead>
                {ipos.map(ipo => (
                  <TableHead key={ipo.id} className="text-center min-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-semibold">{ipo.details.name || `IPO ${ipo.id.slice(0, 8)}`}</div>
                      <div className="text-xs text-muted-foreground">
                        ₹{ipo.details.lotPrice} • {ipo.details.sharesPerLot} shares
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center">Total Investment</TableHead>
                <TableHead className="text-center">Total P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantArray.map((participant, index) => {
                let totalInvestment = 0;
                let totalProfitLoss = 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>{getDematAccountName(participant.dematAccount)}</TableCell>
                    {ipos.map(ipo => {
                      const investment = participant.investments.get(ipo.id);
                      if (investment) {
                        totalInvestment += investment.investment;
                        const { profit } = calculateProfitLoss(investment.result, investment.investment);
                        totalProfitLoss += profit;
                        
                        return (
                          <TableCell key={ipo.id} className="text-center">
                            <div className="space-y-2">
                              <div className="font-semibold">₹{investment.investment.toLocaleString()}</div>
                              {investment.result ? (
                                <div className="space-y-1">
                                  <Badge variant={investment.result.isAllotted ? "default" : "secondary"}>
                                    {investment.result.isAllotted ? "Allotted" : "Not Allotted"}
                                  </Badge>
                                  {investment.result.isAllotted && investment.result.sellingPrice && (
                                    <div className={`text-sm font-medium ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                      {profit >= 0 ? '+' : ''}₹{profit.toFixed(0)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </div>
                          </TableCell>
                        );
                      } else {
                        return (
                          <TableCell key={ipo.id} className="text-center text-muted-foreground">
                            -
                          </TableCell>
                        );
                      }
                    })}
                    <TableCell className="text-center font-semibold">
                      ₹{totalInvestment.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-center font-semibold ${totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalProfitLoss >= 0 ? '+' : ''}₹{totalProfitLoss.toFixed(0)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {participantArray.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No participants found across all IPOs</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};