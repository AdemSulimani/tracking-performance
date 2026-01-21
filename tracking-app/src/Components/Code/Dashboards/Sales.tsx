import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import '../../Style/Dashboards style/Sales.css'

interface Employee {
    name: string
    dealsClosed: number
    revenueGenerated: number
    conversionRate: number
    status: 'Active' | 'On Target' | 'Exceeding'
}

interface SalesData {
    totalRevenue: number
    dealsClosed: number
    conversionRate: number
    averageDealValue: number
    employees: Employee[]
    salesPerformance: { month: string; revenue: number }[]
    funnel: { stage: string; count: number }[]
}

export function Sales() {
    const [activeSection, setActiveSection] = useState('Overview')
    const [salesData, setSalesData] = useState<SalesData>({
        totalRevenue: 2450000,
        dealsClosed: 127,
        conversionRate: 23.5,
        averageDealValue: 19291,
        employees: [
            { name: 'Sarah Johnson', dealsClosed: 18, revenueGenerated: 347000, conversionRate: 28.5, status: 'Exceeding' },
            { name: 'Michael Chen', dealsClosed: 15, revenueGenerated: 289000, conversionRate: 25.2, status: 'Exceeding' },
            { name: 'Emily Rodriguez', dealsClosed: 14, revenueGenerated: 270000, conversionRate: 22.8, status: 'On Target' },
            { name: 'David Thompson', dealsClosed: 12, revenueGenerated: 231000, conversionRate: 20.1, status: 'On Target' },
            { name: 'Jessica Martinez', dealsClosed: 11, revenueGenerated: 212000, conversionRate: 19.5, status: 'Active' },
            { name: 'Robert Williams', dealsClosed: 10, revenueGenerated: 193000, conversionRate: 18.2, status: 'Active' },
            { name: 'Amanda Davis', dealsClosed: 9, revenueGenerated: 174000, conversionRate: 17.8, status: 'Active' },
            { name: 'James Wilson', dealsClosed: 8, revenueGenerated: 154000, conversionRate: 16.5, status: 'Active' },
        ],
        salesPerformance: [
            { month: 'Jan', revenue: 180000 },
            { month: 'Feb', revenue: 210000 },
            { month: 'Mar', revenue: 195000 },
            { month: 'Apr', revenue: 230000 },
            { month: 'May', revenue: 245000 },
            { month: 'Jun', revenue: 260000 },
        ],
        funnel: [
            { stage: 'Leads', count: 540 },
            { stage: 'Qualified', count: 298 },
            { stage: 'Closed', count: 127 },
        ],
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet)

            // Parse Excel data and update state
            try {
                const parsedData = parseExcelData(jsonData)
                setSalesData(parsedData)
            } catch (error) {
                alert('Error parsing Excel file. Please ensure the file format is correct.')
                console.error('Error parsing Excel:', error)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const parseExcelData = (jsonData: any[]): SalesData => {
        // Expected Excel format:
        // Columns: Name, Deals Closed, Revenue Generated, Conversion Rate, Status
        // Plus performance data and funnel data
        
        const employees: Employee[] = jsonData
            .filter(row => row['Name'] && row['Deals Closed'] !== undefined)
            .map(row => ({
                name: String(row['Name'] || ''),
                dealsClosed: Number(row['Deals Closed'] || 0),
                revenueGenerated: Number(row['Revenue Generated'] || 0),
                conversionRate: Number(row['Conversion Rate'] || 0),
                status: (row['Status'] === 'Exceeding' || row['Status'] === 'On Target') 
                    ? row['Status'] as 'Exceeding' | 'On Target'
                    : 'Active' as const,
            }))

        const totalRevenue = employees.reduce((sum, emp) => sum + emp.revenueGenerated, 0)
        const dealsClosed = employees.reduce((sum, emp) => sum + emp.dealsClosed, 0)
        const conversionRate = employees.length > 0
            ? employees.reduce((sum, emp) => sum + emp.conversionRate, 0) / employees.length
            : 0
        const averageDealValue = dealsClosed > 0 ? totalRevenue / dealsClosed : 0

        // Calculate funnel data from employees
        const totalLeads = Math.round(employees.reduce((sum, emp) => {
            if (emp.conversionRate > 0) {
                return sum + (emp.dealsClosed / (emp.conversionRate / 100))
            }
            return sum
        }, 0))
        const qualified = Math.round(totalLeads * 0.55)
        const closed = dealsClosed

        return {
            totalRevenue,
            dealsClosed,
            conversionRate,
            averageDealValue,
            employees,
            salesPerformance: salesData.salesPerformance, // Keep existing or calculate from data
            funnel: [
                { stage: 'Leads', count: totalLeads },
                { stage: 'Qualified', count: qualified },
                { stage: 'Closed', count: closed },
            ],
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(firstSheet)
                try {
                    const parsedData = parseExcelData(jsonData)
                    setSalesData(parsedData)
                } catch (error) {
                    alert('Error parsing Excel file. Please ensure the file format is correct.')
                    console.error('Error parsing Excel:', error)
                }
            }
            reader.readAsArrayBuffer(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const maxRevenue = Math.max(...salesData.salesPerformance.map(d => d.revenue), 0)
    const maxFunnel = Math.max(...salesData.funnel.map(f => f.count), 0)

    return (
        <div className="sales-dashboard">
            <aside className="sales-sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Sales Dashboard</h2>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeSection === 'Overview' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Employees' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Employees')}
                    >
                        Employees
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Sales Funnel' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Sales Funnel')}
                    >
                        Sales Funnel
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Upload Data' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Upload Data')}
                    >
                        Upload Data
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Analytics' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Analytics')}
                    >
                        Analytics
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Settings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Settings')}
                    >
                        Settings
                    </button>
                </nav>
            </aside>

            <main className="sales-main">
                <div className="sales-content">
                    <h1 className="dashboard-title">Sales Performance Overview</h1>

                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-label">Total Revenue</div>
                            <div className="kpi-value">${(salesData.totalRevenue / 1000000).toFixed(2)}M</div>
                            <div className="kpi-change positive">+12.5% vs last quarter</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Deals Closed</div>
                            <div className="kpi-value">{salesData.dealsClosed}</div>
                            <div className="kpi-change positive">+8 deals this month</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Conversion Rate</div>
                            <div className="kpi-value">{salesData.conversionRate.toFixed(1)}%</div>
                            <div className="kpi-change positive">+2.3% improvement</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Average Deal Value</div>
                            <div className="kpi-value">${(salesData.averageDealValue / 1000).toFixed(1)}K</div>
                            <div className="kpi-change positive">+5.2% increase</div>
                        </div>
                    </div>

                    {/* Excel Upload Section */}
                    <div className="upload-section">
                        <h3 className="section-title">Upload Employee Sales Data</h3>
                        <p className="upload-description">
                            Upload an Excel file (.xlsx) with employee sales data to automatically update all KPIs, charts, and tables.
                            Expected columns: Name, Deals Closed, Revenue Generated, Conversion Rate, Status
                        </p>
                        <div
                            className="upload-dropzone"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="upload-icon">📊</div>
                            <p className="upload-text">
                                <strong>Drop your Excel file here</strong> or click to browse
                            </p>
                            <p className="upload-hint">Supports .xlsx and .xls formats</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-section">
                        <div className="chart-card">
                            <h3 className="chart-title">Sales Performance Over Time</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {salesData.salesPerformance.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(data.revenue / maxRevenue) * 100}%`,
                                                }}
                                            >
                                                <span className="bar-value">${(data.revenue / 1000).toFixed(0)}K</span>
                                            </div>
                                            <span className="bar-label">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">Sales Funnel</h3>
                            <div className="chart-container">
                                <div className="funnel-chart">
                                    {salesData.funnel.map((stage, index) => (
                                        <div key={index} className="funnel-stage">
                                            <div className="funnel-bar-wrapper">
                                                <div
                                                    className="funnel-bar"
                                                    style={{
                                                        width: `${(stage.count / maxFunnel) * 100}%`,
                                                    }}
                                                >
                                                    <span className="funnel-label">{stage.stage}</span>
                                                    <span className="funnel-value">{stage.count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employee Table */}
                    <div className="table-section">
                        <h3 className="section-title">Team Performance</h3>
                        <div className="table-wrapper">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Deals Closed</th>
                                        <th>Revenue Generated</th>
                                        <th>Conversion Rate</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.employees.map((employee, index) => (
                                        <tr key={index}>
                                            <td className="employee-name">{employee.name}</td>
                                            <td>{employee.dealsClosed}</td>
                                            <td>${(employee.revenueGenerated / 1000).toFixed(0)}K</td>
                                            <td>{employee.conversionRate.toFixed(1)}%</td>
                                            <td>
                                                <span className={`status-badge status-${employee.status.toLowerCase().replace(' ', '-')}`}>
                                                    {employee.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
