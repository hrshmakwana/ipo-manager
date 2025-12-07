import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantManager } from "./ParticipantManager";
import { DematAccountManager } from "./DematAccountManager";
import { IPOResultsManager } from "./IPOResultsManager";
import { FinalReport } from "./FinalReport";
import { TrendingUp, Users, Building2, FileText } from "lucide-react";

export interface Participant {
  id: string;
  name: string;
  investmentAmount: number;
  dematAccount: string;
}

export interface DematAccount {
  id: string;
  accountName: string;
  ownerName: string;
  commissionRate: number;
  totalAmount: number;
}

export interface IPODetails {
  name: string;
  lotPrice: number;
  sharesPerLot: number;
  issuePrice: number;
}

export interface IPOResult {
  id: string;
  dematAccountId: string;
  isAllotted: boolean;
  sellingPrice?: number;
  commissionDeducted: number;
  finalAmount: number;
  participantIds: string[];
}

const IPODashboard = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dematAccounts, setDematAccounts] = useState<DematAccount[]>([]);
  const [ipoResults, setIPOResults] = useState<IPOResult[]>([]);
  const [ipoDetails, setIPODetails] = useState<IPODetails>({
    name: "",
    lotPrice: 0,
    sharesPerLot: 0,
    issuePrice: 0
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            IPO Investment Manager
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage group IPO investments, track allocations, and calculate returns
          </p>
          {ipoDetails.name && (
            <div className="bg-gradient-card p-4 rounded-lg shadow-card mt-4">
              <h2 className="text-xl font-semibold text-primary">{ipoDetails.name}</h2>
              <div className="flex justify-center gap-6 mt-2 text-sm text-muted-foreground">
                <span>Lot Price: ₹{ipoDetails.lotPrice.toLocaleString()}</span>
                <span>Shares per Lot: {ipoDetails.sharesPerLot}</span>
                <span>Issue Price: ₹{ipoDetails.issuePrice}</span>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{participants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Demat Accounts</p>
                  <p className="text-2xl font-bold">{dematAccounts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-bold text-accent">
                    ₹{participants.reduce((sum, p) => sum + p.investmentAmount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Processed Results</p>
                  <p className="text-2xl font-bold text-success">{ipoResults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Tabs defaultValue="ipo-details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ipo-details">IPO Details</TabsTrigger>
            <TabsTrigger value="accounts">Demat Accounts</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="results">IPO Results</TabsTrigger>
            <TabsTrigger value="report">Final Report</TabsTrigger>
          </TabsList>

          <TabsContent value="ipo-details">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  IPO Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="ipo-name" className="text-sm font-medium">IPO Name</label>
                    <input
                      id="ipo-name"
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="Enter IPO name"
                      value={ipoDetails.name}
                      onChange={(e) => setIPODetails({...ipoDetails, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lot-price" className="text-sm font-medium">Lot Price (₹)</label>
                    <input
                      id="lot-price"
                      type="number"
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="0"
                      value={ipoDetails.lotPrice || ""}
                      onChange={(e) => setIPODetails({...ipoDetails, lotPrice: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="shares-per-lot" className="text-sm font-medium">No. of shares</label>
                    <input
                      id="shares-per-lot"
                      type="number"
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="0"
                      value={ipoDetails.sharesPerLot || ""}
                      onChange={(e) => {
                        const shares = parseInt(e.target.value) || 0;
                        const issuePrice = ipoDetails.lotPrice > 0 && shares > 0 ? ipoDetails.lotPrice / shares : 0;
                        setIPODetails({
                          ...ipoDetails, 
                          sharesPerLot: shares,
                          issuePrice: issuePrice
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="issue-price" className="text-sm font-medium">Issue Price (₹)</label>
                    <input
                      id="issue-price"
                      type="number"
                      step="0.01"
                      className="w-full p-2 border rounded-md bg-background bg-muted/50"
                      placeholder="0.00"
                      value={ipoDetails.issuePrice ? ipoDetails.issuePrice.toFixed(2) : ""}
                      readOnly
                      title="Automatically calculated from Lot Price ÷ No. of shares"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <DematAccountManager
              dematAccounts={dematAccounts}
              setDematAccounts={setDematAccounts}
              participants={participants}
            />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantManager
              participants={participants}
              setParticipants={setParticipants}
              dematAccounts={dematAccounts}
              ipoDetails={ipoDetails}
            />
          </TabsContent>

          <TabsContent value="results">
            <IPOResultsManager
              participants={participants}
              dematAccounts={dematAccounts}
              ipoResults={ipoResults}
              setIPOResults={setIPOResults}
              ipoDetails={ipoDetails}
            />
          </TabsContent>

          <TabsContent value="report">
            <FinalReport
              participants={participants}
              dematAccounts={dematAccounts}
              ipoResults={ipoResults}
              ipoDetails={ipoDetails}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IPODashboard;