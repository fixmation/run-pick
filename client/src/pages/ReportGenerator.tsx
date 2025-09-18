import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Calendar,
  Filter,
  BarChart3,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export default function ReportGenerator() {
  const { user } = useAuth();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [reportFormat, setReportFormat] = useState("pdf");

  const reportTypes = [
    { id: "revenue", name: "Revenue Report", description: "Detailed revenue breakdown by services" },
    { id: "users", name: "User Analytics", description: "User registration, activity, and retention" },
    { id: "services", name: "Service Performance", description: "Performance metrics for all services" },
    { id: "drivers", name: "Driver Report", description: "Driver statistics and performance" },
    { id: "vendors", name: "Vendor Report", description: "Restaurant and vendor analytics" },
    { id: "commissions", name: "Commission Report", description: "Commission calculations and payments" },
  ];

  const handleReportSelection = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const generateReport = () => {
    console.log("Generating reports:", { selectedReports, dateRange, reportFormat });
    // Here you would implement the actual report generation logic
  };

  return (
    <div className="min-h-screen bg-[#ffeed8] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={user?.role ? `/${user.role}-dashboard` : '/'}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Report Generator</h1>
            <p className="text-gray-600">Generate comprehensive business reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Select Report Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportTypes.map((report) => (
                    <div key={report.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={report.id}
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={() => handleReportSelection(report.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={report.id} className="font-medium cursor-pointer">
                          {report.name}
                        </Label>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from-date">From Date</Label>
                    <Input
                      id="from-date"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to-date">To Date</Label>
                    <Input
                      id="to-date"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Format */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Format Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={reportFormat === "pdf" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReportFormat("pdf")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    variant={reportFormat === "excel" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReportFormat("excel")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Excel
                  </Button>
                  <Button
                    variant={reportFormat === "csv" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReportFormat("csv")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Report Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Selected Reports</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedReports.length === 0 ? (
                        <Badge variant="secondary">None selected</Badge>
                      ) : (
                        selectedReports.map(reportId => (
                          <Badge key={reportId} variant="default">
                            {reportTypes.find(r => r.id === reportId)?.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Date Range</Label>
                    <p className="mt-1">
                      {dateRange.from && dateRange.to 
                        ? `${dateRange.from} to ${dateRange.to}`
                        : "No date range selected"
                      }
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Format</Label>
                    <p className="mt-1 capitalize">{reportFormat}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={generateReport}
              disabled={selectedReports.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report{selectedReports.length > 1 ? 's' : ''}
            </Button>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly Revenue</p>
                      <p className="text-sm text-gray-600">Generated 2 days ago</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Analytics</p>
                      <p className="text-sm text-gray-600">Generated 5 days ago</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}