import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParticipantManager } from "./ParticipantManager";
import { DematAccountManager } from "./DematAccountManager";
import { IPOResultsManager } from "./IPOResultsManager";
import { FinalReport } from "./FinalReport";
import { MultiIPOManager } from "./MultiIPOManager";
import { ConsolidatedParticipantView } from "./ConsolidatedParticipantView";
import { 
  TrendingUp, 
  Users, 
  Building2, 
  FileText, 
  Plus, 
  Github, 
  Linkedin, 
  Terminal,
  Heart
} from "lucide-react";
import type { DematAccount, IPODetails, Participant, IPOResult } from "./IPODashboard";

export interface MultiIPO {
  id: string;
  details: IPODetails;
  participants: Participant[];
  results: IPOResult[];
}

const MultiIPODashboard = () => {
  const [ipos, setIPOs] = useState<MultiIPO[]>(() => {
    const saved = localStorage.getItem("ipo_manager_data");
    return saved ? JSON.parse(saved) : [];
  });

  const [dematAccounts, setDematAccounts] = useState<DematAccount[]>(() => {
    const saved = localStorage.getItem("demat_manager_data");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedIPOId, setSelectedIPOId] = useState<string>(() => {
    return localStorage.getItem("selected_ipo_id") || "";
  });

  const [activeTab, setActiveTab] = useState<string>("all-details");

  useEffect(() => {
    localStorage.setItem("ipo_manager_data", JSON.stringify(ipos));
  }, [ipos]);

  useEffect(() => {
    localStorage.setItem("demat_manager_data", JSON.stringify(dematAccounts));
  }, [dematAccounts]);

  useEffect(() => {
    localStorage.setItem("selected_ipo_id", selectedIPOId);
  }, [selectedIPOId]);

  const selectedIPO = useMemo(() => 
    ipos.find(ipo => ipo.id === selectedIPOId), 
    [ipos, selectedIPOId]
  );

  const addNewIPO = useCallback(() => {
    const newIPO: MultiIPO = {
      id: Date.now().toString(),
      details: {
        name: `IPO ${ipos.length + 1}`,
        lotPrice: 0,
        sharesPerLot: 0,
        issuePrice: 0
      },
      participants: [],
      results: []
    };
    
    setIPOs(prev => [...prev, newIPO]);
    setSelectedIPOId(newIPO.id);
    setActiveTab("ipo-details");
  }, [ipos.length]);

  const updateIPODetails = useCallback((ipoId: string, details: IPODetails) => {
    setIPOs(prev => prev.map(ipo => 
      ipo.id === ipoId ? { ...ipo, details } : ipo
    ));
  }, []);

  const updateIPOParticipants = useCallback((ipoId: string, participants: Participant[]) => {
    setIPOs(prev => prev.map(ipo => 
      ipo.id === ipoId ? { ...ipo, participants } : ipo
    ));
  }, []);

  const updateIPOResults = useCallback((ipoId: string, results: IPOResult[]) => {
    setIPOs(prev => prev.map(ipo => 
      ipo.id === ipoId ? { ...ipo, results } : ipo
    ));
  }, []);

  const deleteIPO = useCallback((ipoId: string) => {
    setIPOs(prev => {
      const filtered = prev.filter(ipo => ipo.id !== ipoId);
      if (selectedIPOId === ipoId) {
        setSelectedIPOId("");
        setActiveTab("all-details");
      }
      return filtered;
    });
  }, [selectedIPOId]);

  const totalStats = useMemo(() => {
    const totalParticipants = ipos.reduce((sum, ipo) => sum + ipo.participants.length, 0);
    const totalInvestment = ipos.reduce((sum, ipo) => 
      sum + ipo.participants.reduce((pSum, p) => pSum + p.investmentAmount, 0), 0
    );
    const totalResults = ipos.reduce((sum, ipo) => sum + ipo.results.length, 0);
    
    return { totalParticipants, totalInvestment, totalResults };
  }, [ipos]);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        {}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Multi-IPO Investment Manager
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional dashboard for consolidated equity and asset tracking
          </p>
        </div>

        {}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                IPO Management
              </span>
              <Button onClick={addNewIPO} className="bg-gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add New IPO
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ipos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Select IPO to manage:</label>
                  <Select value={selectedIPOId} onValueChange={setSelectedIPOId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Choose an IPO" />
                    </SelectTrigger>
                    <SelectContent>
                      {ipos.map((ipo) => (
                        <SelectItem key={ipo.id} value={ipo.id}>
                          {ipo.details.name || `IPO ${ipo.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedIPO && selectedIPO.details.name && (
                  <div className="bg-gradient-card p-4 rounded-lg shadow-card">
                    <h3 className="text-lg font-semibold text-primary">{selectedIPO.details.name}</h3>
                    <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                      <span>Lot Price: ₹{selectedIPO.details.lotPrice.toLocaleString()}</span>
                      <span>Shares per Lot: {selectedIPO.details.sharesPerLot}</span>
                      <span>Issue Price: ₹{selectedIPO.details.issuePrice}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total IPOs</p>
                  <p className="text-2xl font-bold">{ipos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{totalStats.totalParticipants}</p>
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
                    ₹{totalStats.totalInvestment.toLocaleString()}
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
                  <p className="text-2xl font-bold text-success">{totalStats.totalResults}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        {ipos.length === 0 ? (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No IPOs Added Yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first IPO to begin managing investments</p>
              <Button onClick={addNewIPO} className="bg-gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First IPO
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all-details">All Details</TabsTrigger>
              <TabsTrigger value="ipo-details" disabled={!selectedIPOId}>IPO Details</TabsTrigger>
              <TabsTrigger value="multi-ipo">All IPOs</TabsTrigger>
              <TabsTrigger value="accounts">Demat Accounts</TabsTrigger>
              <TabsTrigger value="participants" disabled={!selectedIPOId}>Participants</TabsTrigger>
              <TabsTrigger value="results" disabled={!selectedIPOId}>IPO Results</TabsTrigger>
              <TabsTrigger value="report" disabled={!selectedIPOId}>Final Report</TabsTrigger>
            </TabsList>

            <TabsContent value="all-details">
              <ConsolidatedParticipantView
                ipos={ipos}
                dematAccounts={dematAccounts}
              />
            </TabsContent>

            <TabsContent value="multi-ipo">
              <MultiIPOManager
                ipos={ipos}
                setIPOs={setIPOs}
                dematAccounts={dematAccounts}
                onSelectIPO={(id) => {
                  setSelectedIPOId(id);
                  setActiveTab("ipo-details");
                }}
                onEditIPO={(id, details) => updateIPODetails(id, details)}
                onDeleteIPO={deleteIPO}
              />
            </TabsContent>

            <TabsContent value="ipo-details">
              {selectedIPO && (
                <Card className="bg-gradient-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      IPO Details - {selectedIPO.details.name || "Unnamed IPO"}
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
                          value={selectedIPO.details.name}
                          onChange={(e) => updateIPODetails(selectedIPO.id, {...selectedIPO.details, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lot-price" className="text-sm font-medium">Lot Price (₹)</label>
                        <input
                          id="lot-price"
                          type="number"
                          className="w-full p-2 border rounded-md bg-background"
                          placeholder="0"
                          value={selectedIPO.details.lotPrice || ""}
                          onChange={(e) => updateIPODetails(selectedIPO.id, {...selectedIPO.details, lotPrice: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="shares-per-lot" className="text-sm font-medium">No. of shares</label>
                        <input
                          id="shares-per-lot"
                          type="number"
                          className="w-full p-2 border rounded-md bg-background"
                          placeholder="0"
                          value={selectedIPO.details.sharesPerLot || ""}
                          onChange={(e) => {
                            const shares = parseInt(e.target.value) || 0;
                            const issuePrice = selectedIPO.details.lotPrice > 0 && shares > 0 ? selectedIPO.details.lotPrice / shares : 0;
                            updateIPODetails(selectedIPO.id, {
                              ...selectedIPO.details, 
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
                          value={selectedIPO.details.issuePrice ? selectedIPO.details.issuePrice.toFixed(2) : ""}
                          readOnly
                          title="Automatically calculated from Lot Price ÷ No. of shares"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="accounts">
              <DematAccountManager
                dematAccounts={dematAccounts}
                setDematAccounts={setDematAccounts}
                participants={selectedIPO?.participants || []}
              />
            </TabsContent>

            <TabsContent value="participants">
              {selectedIPO && (
                <ParticipantManager
                  participants={selectedIPO.participants}
                  setParticipants={(participants) => updateIPOParticipants(selectedIPO.id, participants)}
                  dematAccounts={dematAccounts}
                  ipoDetails={selectedIPO.details}
                />
              )}
            </TabsContent>

            <TabsContent value="results">
              {selectedIPO && (
                <IPOResultsManager
                  participants={selectedIPO.participants}
                  dematAccounts={dematAccounts}
                  ipoResults={selectedIPO.results}
                  setIPOResults={(results) => updateIPOResults(selectedIPO.id, results)}
                  ipoDetails={selectedIPO.details}
                />
              )}
            </TabsContent>

            <TabsContent value="report">
              {selectedIPO && (
                <FinalReport
                  participants={selectedIPO.participants}
                  dematAccounts={dematAccounts}
                  ipoResults={selectedIPO.results}
                  ipoDetails={selectedIPO.details}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {}
      <footer className="mt-20 border-t border-border/40 py-8 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2 text-muted-foreground/80">
              <Terminal className="h-4 w-4" />
              <span>v1.0.0</span>
              <span className="hidden md:inline mx-1 text-border">|</span>
              <span>© 2025 IPO Manager</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/30 border border-border/50">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Created By</span>
                <span className="font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-1.5">
                    Harsh Makwana
                </span>
            </div>

            {}
            <div className="flex items-center gap-4">
                <a 
                href="https://github.com/hrshmakwana"
                target="_blank" 
                rel="noreferrer"
                className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                    <Github className="h-4 w-4 group-hover:text-primary" />
                </div>
                <span className="font-medium group-hover:underline decoration-primary/50 underline-offset-4">GitHub</span>
                </a>

                <a 
                href="https://www.linkedin.com/in/hrshmakwana"
                target="_blank" 
                rel="noreferrer"
                className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                <div className="p-2 rounded-full bg-secondary group-hover:bg-blue-500/10 transition-colors">
                    <Linkedin className="h-4 w-4 group-hover:text-blue-500" />
                </div>
                <span className="font-medium group-hover:underline decoration-blue-500/50 underline-offset-4">LinkedIn</span>
                </a>
            </div>
          </div>
        </div>
      </footer>
      {}
    </div>
  );
};

export default MultiIPODashboard;