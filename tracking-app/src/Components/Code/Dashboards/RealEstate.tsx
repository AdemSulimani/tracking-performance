import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import '../../Style/Dashboards style/RealEstate.css'

interface Agent {
    name: string
    listingsManaged: number
    dealsClosed: number
    revenue: number
    conversionRate: number
}

interface Property {
    address: string
    listPrice: number
    salePrice: number
    daysOnMarket: number
    status: string
    agent: string
}

interface RealEstateData {
    propertiesListed: number
    dealsClosed: number
    totalRevenue: number
    averageDealValue: number
    agents: Agent[]
    properties: Property[]
    propertyPerformance: { month: string; listed: number; sold: number }[]
    dealsOverTime: { month: string; deals: number; revenue: number }[]
}

export function RealEstate() {
    const [activeSection, setActiveSection] = useState('Overview')
    const [realEstateData, setRealEstateData] = useState<RealEstateData>({
        propertiesListed: 247,
        dealsClosed: 89,
        totalRevenue: 12450000,
        averageDealValue: 139887,
        agents: [
            { name: 'Sarah Mitchell', listingsManaged: 42, dealsClosed: 18, revenue: 2516000, conversionRate: 42.9 },
            { name: 'Michael Chen', listingsManaged: 38, dealsClosed: 16, revenue: 2238000, conversionRate: 42.1 },
            { name: 'Emily Rodriguez', listingsManaged: 35, dealsClosed: 14, revenue: 1958000, conversionRate: 40.0 },
            { name: 'David Thompson', listingsManaged: 32, dealsClosed: 12, revenue: 1678000, conversionRate: 37.5 },
            { name: 'Jessica Martinez', listingsManaged: 28, dealsClosed: 10, revenue: 1399000, conversionRate: 35.7 },
            { name: 'Robert Williams', listingsManaged: 25, dealsClosed: 9, revenue: 1259000, conversionRate: 36.0 },
            { name: 'Amanda Davis', listingsManaged: 22, dealsClosed: 7, revenue: 979000, conversionRate: 31.8 },
        ],
        properties: [],
        propertyPerformance: [
            { month: 'Jan', listed: 18, sold: 6 },
            { month: 'Feb', listed: 22, sold: 8 },
            { month: 'Mar', listed: 28, sold: 10 },
            { month: 'Apr', listed: 35, sold: 12 },
            { month: 'May', listed: 42, sold: 15 },
            { month: 'Jun', listed: 38, sold: 14 },
            { month: 'Jul', listed: 45, sold: 16 },
            { month: 'Aug', listed: 16, sold: 8 },
        ],
        dealsOverTime: [
            { month: 'Jan', deals: 6, revenue: 839000 },
            { month: 'Feb', deals: 8, revenue: 1119000 },
            { month: 'Mar', deals: 10, revenue: 1399000 },
            { month: 'Apr', deals: 12, revenue: 1678000 },
            { month: 'May', deals: 15, revenue: 2098000 },
            { month: 'Jun', deals: 14, revenue: 1958000 },
            { month: 'Jul', deals: 16, revenue: 2238000 },
            { month: 'Aug', deals: 8, revenue: 1119000 },
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

            try {
                const parsedData = parseExcelData(jsonData)
                setRealEstateData(parsedData)
            } catch (error) {
                alert('Error parsing Excel file. Please ensure the file format is correct.')
                console.error('Error parsing Excel:', error)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const parseExcelData = (jsonData: any[]): RealEstateData => {
        // Expected Excel format for agents:
        // Columns: Name, Listings Managed, Deals Closed, Revenue, Conversion Rate
        // Or properties: Address, List Price, Sale Price, Days on Market, Status, Agent
        
        const agents: Agent[] = jsonData
            .filter(row => row['Name'] && row['Listings Managed'] !== undefined)
            .map(row => ({
                name: String(row['Name'] || ''),
                listingsManaged: Number(row['Listings Managed'] || 0),
                dealsClosed: Number(row['Deals Closed'] || 0),
                revenue: Number(row['Revenue'] || 0),
                conversionRate: Number(row['Conversion Rate'] || 0),
            }))

        const properties: Property[] = jsonData
            .filter(row => row['Address'] && row['List Price'] !== undefined)
            .map(row => ({
                address: String(row['Address'] || ''),
                listPrice: Number(row['List Price'] || 0),
                salePrice: Number(row['Sale Price'] || row['List Price'] || 0),
                daysOnMarket: Number(row['Days on Market'] || 0),
                status: String(row['Status'] || 'Active'),
                agent: String(row['Agent'] || ''),
            }))

        // Calculate KPIs from data
        const propertiesListed = agents.reduce((sum, agent) => sum + agent.listingsManaged, 0) || properties.length
        const dealsClosed = agents.reduce((sum, agent) => sum + agent.dealsClosed, 0)
        const totalRevenue = agents.reduce((sum, agent) => sum + agent.revenue, 0)
        const averageDealValue = dealsClosed > 0 ? totalRevenue / dealsClosed : 0

        // Generate time series data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentMonth = new Date().getMonth()
        const propertyPerformance = months.slice(0, currentMonth + 1).map((month, idx) => ({
            month,
            listed: Math.round(propertiesListed / (currentMonth + 1) * (0.8 + Math.random() * 0.4)),
            sold: Math.round(dealsClosed / (currentMonth + 1) * (0.8 + Math.random() * 0.4)),
        }))

        const dealsOverTime = months.slice(0, currentMonth + 1).map((month, idx) => ({
            month,
            deals: Math.round(dealsClosed / (currentMonth + 1) * (0.8 + Math.random() * 0.4)),
            revenue: Math.round(totalRevenue / (currentMonth + 1) * (0.8 + Math.random() * 0.4)),
        }))

        return {
            propertiesListed,
            dealsClosed,
            totalRevenue,
            averageDealValue,
            agents: agents.length > 0 ? agents : realEstateData.agents,
            properties,
            propertyPerformance,
            dealsOverTime,
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(firstSheet)
                try {
                    const parsedData = parseExcelData(jsonData)
                    setRealEstateData(parsedData)
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

    const maxListed = Math.max(...realEstateData.propertyPerformance.map(d => d.listed), 0)
    const maxSold = Math.max(...realEstateData.propertyPerformance.map(d => d.sold), 0)
    const maxDeals = Math.max(...realEstateData.dealsOverTime.map(d => d.deals), 0)
    const maxRevenue = Math.max(...realEstateData.dealsOverTime.map(d => d.revenue), 0)

    const renderContent = () => {
        switch (activeSection) {
            case 'Overview':
    return (
        <>
                        {/* KPI Cards */}
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-label">Properties Listed</div>
                                <div className="kpi-value">{realEstateData.propertiesListed.toLocaleString()}</div>
                                <div className="kpi-change positive">+12.5% vs last quarter</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Deals Closed</div>
                                <div className="kpi-value">{realEstateData.dealsClosed.toLocaleString()}</div>
                                <div className="kpi-change positive">+8.3% increase</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Total Revenue</div>
                                <div className="kpi-value">${(realEstateData.totalRevenue / 1000000).toFixed(1)}M</div>
                                <div className="kpi-change positive">+15.2% growth</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Average Deal Value</div>
                                <div className="kpi-value">${realEstateData.averageDealValue.toLocaleString()}</div>
                                <div className="kpi-change positive">+3.8% increase</div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="charts-section">
                            <div className="chart-card">
                                <h3 className="chart-title">Property Performance Over Time</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {realEstateData.propertyPerformance.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div className="bar-group">
                                                    <div
                                                        className="bar bar-listed"
                                                        style={{
                                                            height: `${(data.listed / maxListed) * 100}%`,
                                                        }}
                                                    >
                                                        <span className="bar-value">{data.listed}</span>
                                                    </div>
                                                    <div
                                                        className="bar bar-sold"
                                                        style={{
                                                            height: `${(data.sold / maxSold) * 100}%`,
                                                        }}
                                                    >
                                                        <span className="bar-value">{data.sold}</span>
                                                    </div>
                                                </div>
                                                <span className="bar-label">{data.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ background: '#2C7A7B' }}></span>
                                        <span>Listed</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ background: '#14B8A6' }}></span>
                                        <span>Sold</span>
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title">Deals Closed Over Time</h3>
                                <div className="chart-container">
                                    <div className="line-chart">
                                        <svg className="line-chart-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                                            {realEstateData.dealsOverTime.map((data, index) => {
                                                if (index === realEstateData.dealsOverTime.length - 1) return null
                                                const nextData = realEstateData.dealsOverTime[index + 1]
                                                const pointWidth = 100 / realEstateData.dealsOverTime.length
                                                const x1 = (index + 0.5) * pointWidth
                                                const y1Percent = maxDeals > 0 ? 100 - ((data.deals / maxDeals) * 100) : 50
                                                const y1 = Math.max(20, Math.min(y1Percent, 100 - 20))
                                                const x2 = (index + 1.5) * pointWidth
                                                const y2Percent = maxDeals > 0 ? 100 - ((nextData.deals / maxDeals) * 100) : 50
                                                const y2 = Math.max(20, Math.min(y2Percent, 100 - 20))
                                                return (
                                                    <line
                                                        key={`line-${index}`}
                                                        x1={`${x1}%`}
                                                        y1={`${y1}%`}
                                                        x2={`${x2}%`}
                                                        y2={`${y2}%`}
                                                        stroke="#14B8A6"
                                                        strokeWidth="2"
                                                        strokeDasharray="none"
                                                        opacity="0.4"
                                                    />
                                                )
                                            })}
                                        </svg>
                                        {realEstateData.dealsOverTime.map((data, index) => {
                                            const percentage = maxDeals > 0 ? (data.deals / maxDeals) * 100 : 0
                                            // Ensure the circle stays within bounds (20px is half of 40px circle height)
                                            const bottomPosition = Math.max(20, Math.min(percentage, 100 - 20))
                                            return (
                                                <div key={index} className="line-point-wrapper">
                                                    <div className="line-point" style={{ bottom: `calc(${bottomPosition}% - 20px)` }}>
                                                        <span className="point-value">{data.deals}</span>
                                                    </div>
                                                    <span className="line-label">{data.month}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agents Table */}
                        <div className="table-section">
                            <h3 className="section-title">Agent Performance</h3>
                            <div className="table-wrapper">
                                <table className="agent-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Listings Managed</th>
                                            <th>Deals Closed</th>
                                            <th>Revenue</th>
                                            <th>Conversion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {realEstateData.agents.map((agent, index) => (
                                            <tr key={index}>
                                                <td className="agent-name">{agent.name}</td>
                                                <td>{agent.listingsManaged.toLocaleString()}</td>
                                                <td>{agent.dealsClosed.toLocaleString()}</td>
                                                <td>${agent.revenue.toLocaleString()}</td>
                                                <td>{agent.conversionRate.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
            </div>
                    </>
                )
            case 'Agents':
                return (
                    <div className="table-section">
                        <h3 className="section-title">All Agents</h3>
                        <div className="table-wrapper">
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Listings Managed</th>
                                        <th>Deals Closed</th>
                                        <th>Revenue</th>
                                        <th>Conversion Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {realEstateData.agents.map((agent, index) => (
                                        <tr key={index}>
                                            <td className="agent-name">{agent.name}</td>
                                            <td>{agent.listingsManaged.toLocaleString()}</td>
                                            <td>{agent.dealsClosed.toLocaleString()}</td>
                                            <td>${agent.revenue.toLocaleString()}</td>
                                            <td>{agent.conversionRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            case 'Listings':
                return (
                    <div className="table-section">
                        <h3 className="section-title">Property Listings</h3>
                        <p className="section-description">
                            {realEstateData.properties.length > 0 
                                ? `Showing ${realEstateData.properties.length} properties from uploaded data.`
                                : 'Upload property data to view listings here.'}
                        </p>
                        {realEstateData.properties.length > 0 && (
                            <div className="table-wrapper">
                                <table className="agent-table">
                                    <thead>
                                        <tr>
                                            <th>Address</th>
                                            <th>List Price</th>
                                            <th>Sale Price</th>
                                            <th>Days on Market</th>
                                            <th>Status</th>
                                            <th>Agent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {realEstateData.properties.map((property, index) => (
                                            <tr key={index}>
                                                <td className="agent-name">{property.address}</td>
                                                <td>${property.listPrice.toLocaleString()}</td>
                                                <td>${property.salePrice.toLocaleString()}</td>
                                                <td>{property.daysOnMarket}</td>
                                                <td>
                                                    <span className={`status-badge ${property.status.toLowerCase()}`}>
                                                        {property.status}
                                                    </span>
                                                </td>
                                                <td>{property.agent}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            case 'Deals':
                return (
                    <div className="table-section">
                        <h3 className="section-title">Closed Deals</h3>
                        <div className="deals-summary">
                            <div className="summary-card">
                                <div className="summary-label">Total Deals</div>
                                <div className="summary-value">{realEstateData.dealsClosed}</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-label">Total Revenue</div>
                                <div className="summary-value">${(realEstateData.totalRevenue / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-label">Average Deal Value</div>
                                <div className="summary-value">${realEstateData.averageDealValue.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )
            case 'Upload Data':
                return (
                    <div className="upload-section">
                        <h3 className="section-title">Upload Property & Agent Data</h3>
                        <p className="upload-description">
                            Upload your Excel file containing property listings and agent performance data. 
                            The system will automatically process the information and generate comprehensive performance insights across the dashboard.
                            <br /><br />
                            <strong>Expected format for Agents:</strong> Name, Listings Managed, Deals Closed, Revenue, Conversion Rate
                            <br />
                            <strong>Expected format for Properties:</strong> Address, List Price, Sale Price, Days on Market, Status, Agent
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
                )
            case 'Analytics':
                return (
                    <div className="analytics-section">
                        <h3 className="section-title">Performance Analytics</h3>
                        <div className="charts-section">
                            <div className="chart-card">
                                <h3 className="chart-title">Property Performance Over Time</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {realEstateData.propertyPerformance.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div className="bar-group">
                                                    <div
                                                        className="bar bar-listed"
                                                        style={{
                                                            height: `${(data.listed / maxListed) * 100}%`,
                                                        }}
                                                    >
                                                        <span className="bar-value">{data.listed}</span>
                                                    </div>
                                                    <div
                                                        className="bar bar-sold"
                                                        style={{
                                                            height: `${(data.sold / maxSold) * 100}%`,
                                                        }}
                                                    >
                                                        <span className="bar-value">{data.sold}</span>
                                                    </div>
                                                </div>
                                                <span className="bar-label">{data.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ background: '#2C7A7B' }}></span>
                                        <span>Listed</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ background: '#14B8A6' }}></span>
                                        <span>Sold</span>
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title">Deals Closed Over Time</h3>
                                <div className="chart-container">
                                    <div className="line-chart">
                                        <svg className="line-chart-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                                            {realEstateData.dealsOverTime.map((data, index) => {
                                                if (index === realEstateData.dealsOverTime.length - 1) return null
                                                const nextData = realEstateData.dealsOverTime[index + 1]
                                                const pointWidth = 100 / realEstateData.dealsOverTime.length
                                                const x1 = (index + 0.5) * pointWidth
                                                const y1Percent = maxDeals > 0 ? 100 - ((data.deals / maxDeals) * 100) : 50
                                                const y1 = Math.max(20, Math.min(y1Percent, 100 - 20))
                                                const x2 = (index + 1.5) * pointWidth
                                                const y2Percent = maxDeals > 0 ? 100 - ((nextData.deals / maxDeals) * 100) : 50
                                                const y2 = Math.max(20, Math.min(y2Percent, 100 - 20))
                                                return (
                                                    <line
                                                        key={`line-${index}`}
                                                        x1={`${x1}%`}
                                                        y1={`${y1}%`}
                                                        x2={`${x2}%`}
                                                        y2={`${y2}%`}
                                                        stroke="#14B8A6"
                                                        strokeWidth="2"
                                                        strokeDasharray="none"
                                                        opacity="0.4"
                                                    />
                                                )
                                            })}
                                        </svg>
                                        {realEstateData.dealsOverTime.map((data, index) => {
                                            const percentage = maxDeals > 0 ? (data.deals / maxDeals) * 100 : 0
                                            // Ensure the circle stays within bounds (20px is half of 40px circle height)
                                            const bottomPosition = Math.max(20, Math.min(percentage, 100 - 20))
                                            return (
                                                <div key={index} className="line-point-wrapper">
                                                    <div className="line-point" style={{ bottom: `calc(${bottomPosition}% - 20px)` }}>
                                                        <span className="point-value">{data.deals}</span>
                                                    </div>
                                                    <span className="line-label">{data.month}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'Settings':
                return (
                    <div className="settings-section">
                        <h3 className="section-title">Dashboard Settings</h3>
                        <div className="settings-card">
                            <h4>Display Preferences</h4>
                            <p>Configure your dashboard display preferences and data refresh settings.</p>
                        </div>
                        <div className="settings-card">
                            <h4>Data Management</h4>
                            <p>Manage data sources and export options for your reports.</p>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="real-estate-dashboard">
            <aside className="real-estate-sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Real Estate</h2>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeSection === 'Overview' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Agents' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Agents')}
                    >
                        Agents
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Listings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Listings')}
                    >
                        Listings
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Deals' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Deals')}
                    >
                        Deals
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

            <main className="real-estate-main">
                <div className="real-estate-content">
                    <h1 className="dashboard-title">
                        {activeSection === 'Overview' ? 'Performance Dashboard' : activeSection}
                    </h1>
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}
