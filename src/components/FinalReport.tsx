import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Building2,
  CheckCircle,
  XCircle
} from "lucide-react";
import type { Participant, DematAccount, IPOResult, IPODetails } from "./IPODashboard";

interface FinalReportProps {
  participants: Participant[];
  dematAccounts: DematAccount[];
  ipoResults: IPOResult[];
  ipoDetails: IPODetails;
}

export const FinalReport = ({ participants, dematAccounts, ipoResults, ipoDetails }: FinalReportProps) => {
  // Calculate overall statistics
  const totalInvestment = participants.reduce((sum, p) => sum + p.investmentAmount, 0);
  const totalFinalAmount = ipoResults.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalCommission = ipoResults.reduce((sum, r) => sum + r.commissionDeducted, 0);
  const totalProfit = totalFinalAmount - totalInvestment;
  const allottedResults = ipoResults.filter(r => r.isAllotted);
  const notAllottedResults = ipoResults.filter(r => !r.isAllotted);

  // Helper functions
  const getDematAccountName = (accountId: string) => {
    const account = dematAccounts.find(acc => acc.id === accountId);
    return account ? account.accountName : "Unknown";
  };

  const getDematAccountOwner = (accountId: string) => {
    const account = dematAccounts.find(acc => acc.id === accountId);
    return account ? account.ownerName : "Unknown";
  };

  const getParticipantNames = (participantIds: string[]) => {
    return participantIds
      .map(id => participants.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getAccountInvestment = (accountId: string) => {
    return participants
      .filter(p => p.dematAccount === accountId)
      .reduce((sum, p) => sum + p.investmentAmount, 0);
  };

  const calculateIndividualReturns = (result: IPOResult) => {
    const accountInvestment = getAccountInvestment(result.dematAccountId);
    const accountParticipants = participants.filter(p => p.dematAccount === result.dematAccountId);
    
    return accountParticipants.map(participant => {
      const share = participant.investmentAmount / accountInvestment;
      const individualReturn = result.finalAmount * share;
      const individualProfit = individualReturn - participant.investmentAmount;
      
      return {
        participant,
        individualReturn,
        individualProfit,
        share
      };
    });
  };

  // Generate detailed breakdown for each participant
  const participantBreakdown = ipoResults.flatMap(result => 
    calculateIndividualReturns(result).map(calc => ({
      ...calc,
      result,
      dematAccount: dematAccounts.find(acc => acc.id === result.dematAccountId)!
    }))
  );

  const exportToCSV = () => {
    const csvData = [
      ["Participant Name", "Investment Amount", "Demat Account", "Account Owner", "Status", "Individual Return", "Profit/Loss"],
      ...participantBreakdown.map(item => [
        item.participant.name,
        item.participant.investmentAmount,
        item.dematAccount.accountName,
        item.dematAccount.ownerName,
        item.result.isAllotted ? "Allotted" : "Not Allotted",
        item.individualReturn.toFixed(2),
        item.individualProfit.toFixed(2)
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ipo-final-report-${ipoDetails.name || 'report'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* IPO Summary */}
      {ipoDetails.name && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              IPO Summary - {ipoDetails.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Lot Price</p>
                <p className="font-semibold">₹{ipoDetails.lotPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shares per Lot</p>
                <p className="font-semibold">{ipoDetails.sharesPerLot}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issue Price</p>
                <p className="font-semibold">₹{ipoDetails.issuePrice}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Lots Applied</p>
                <p className="font-semibold">
                  {ipoDetails.lotPrice > 0 ? Math.floor(totalInvestment / ipoDetails.lotPrice) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-xl font-bold text-accent">₹{totalInvestment.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-xl font-bold">₹{totalFinalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {totalProfit >= 0 ? (
                <TrendingUp className="h-8 w-8 text-profit" />
              ) : (
                <TrendingDown className="h-8 w-8 text-loss" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
                <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Commission Paid</p>
                <p className="text-xl font-bold text-warning">₹{totalCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allotment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-profit" />
                <span className="font-medium">Allotted Accounts</span>
              </div>
              <Badge variant="default">{allottedResults.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Non-Allotted Accounts</span>
              </div>
              <Badge variant="secondary">{notAllottedResults.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Participant Breakdown */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Individual Participant Returns</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {participantBreakdown.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results available yet. Complete the IPO results to see individual breakdowns.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Demat Account</TableHead>
                  <TableHead>Account Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Individual Return</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                  <TableHead>Return %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantBreakdown.map((item, index) => {
                  const returnPercentage = ((item.individualProfit / item.participant.investmentAmount) * 100);
                  
                  return (
                    <TableRow key={`${item.participant.id}-${index}`}>
                      <TableCell className="font-medium">{item.participant.name}</TableCell>
                      <TableCell className="text-accent font-semibold">
                        ₹{item.participant.investmentAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{item.dematAccount.accountName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.dematAccount.ownerName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.result.isAllotted ? "default" : "secondary"}>
                          {item.result.isAllotted ? "Allotted" : "Not Allotted"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{item.individualReturn.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${item.individualProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {item.individualProfit >= 0 ? '+' : ''}₹{item.individualProfit.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${returnPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
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

      {/* Demat Account Summary */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Demat Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {ipoResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results available yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net Profit/Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipoResults.map((result) => {
                  const investment = getAccountInvestment(result.dematAccountId);
                  const profit = result.finalAmount - investment;
                  
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
                        ₹{investment.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={result.isAllotted ? "default" : "secondary"}>
                          {result.isAllotted ? "Allotted" : "Not Allotted"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{result.finalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-warning font-semibold">
                        ₹{result.commissionDeducted.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
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