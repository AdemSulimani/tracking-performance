import { useState, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import '../../Style/Dashboards style/Telemarketing.css'
import { useAuth } from '../../../context/AuthContext'

interface Agent {
    name: string
    callsMade: number
    leadsReached: number
    conversions: number
    callSuccessRate: number
}

interface TelemarketingData {
    totalCallsMade: number
    leadsContacted: number
    conversionRate: number
    successfulCalls: number
    agents: Agent[]
    callVolume: { day: string; calls: number }[]
    callSuccessRate: { day: string; rate: number }[]
    dailyAgentActivity: { agent: string; calls: number }[]
}

export function Telemarketing() {
    const { user, logout } = useAuth()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
        }

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showUserMenu])

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/delete-account`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    logout()
                } else {
                    const data = await response.json()
                    alert(data.message || 'Failed to delete account')
                }
            } catch (error) {
                console.error('Delete account error:', error)
                alert('An error occurred while deleting your account')
            }
        }
    }
    const [activeSection, setActiveSection] = useState('Dashboard')
    const [telemarketingData, setTelemarketingData] = useState<TelemarketingData>({
        totalCallsMade: 12450,
        leadsContacted: 8920,
        conversionRate: 18.5,
        successfulCalls: 1650,
        agents: [
            { name: 'Sarah Johnson', callsMade: 1250, leadsReached: 980, conversions: 245, callSuccessRate: 19.6 },
            { name: 'Michael Chen', callsMade: 1180, leadsReached: 920, conversions: 220, callSuccessRate: 18.6 },
            { name: 'Emily Rodriguez', callsMade: 1100, leadsReached: 850, conversions: 198, callSuccessRate: 18.0 },
            { name: 'David Thompson', callsMade: 1050, leadsReached: 820, conversions: 185, callSuccessRate: 17.6 },
            { name: 'Jessica Martinez', callsMade: 980, leadsReached: 750, conversions: 165, callSuccessRate: 16.8 },
            { name: 'Robert Williams', callsMade: 920, leadsReached: 710, conversions: 152, callSuccessRate: 16.5 },
            { name: 'Amanda Davis', callsMade: 880, leadsReached: 680, conversions: 142, callSuccessRate: 16.1 },
        ],
        callVolume: [
            { day: 'Mon', calls: 2100 },
            { day: 'Tue', calls: 1950 },
            { day: 'Wed', calls: 2200 },
            { day: 'Thu', calls: 2050 },
            { day: 'Fri', calls: 2150 },
        ],
        callSuccessRate: [
            { day: 'Mon', rate: 17.2 },
            { day: 'Tue', rate: 18.5 },
            { day: 'Wed', rate: 19.1 },
            { day: 'Thu', rate: 18.8 },
            { day: 'Fri', rate: 19.3 },
        ],
        dailyAgentActivity: [
            { agent: 'Sarah Johnson', calls: 250 },
            { agent: 'Michael Chen', calls: 236 },
            { agent: 'Emily Rodriguez', calls: 220 },
            { agent: 'David Thompson', calls: 210 },
            { agent: 'Jessica Martinez', calls: 196 },
            { agent: 'Robert Williams', calls: 184 },
            { agent: 'Amanda Davis', calls: 176 },
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
                setTelemarketingData(parsedData)
            } catch (error) {
                alert('Error parsing Excel file. Please ensure the file format is correct.')
                console.error('Error parsing Excel:', error)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const parseExcelData = (jsonData: any[]): TelemarketingData => {
        // Expected Excel format:
        // Columns: Name, Calls Made, Leads Reached, Conversions, Call Success Rate
        
        const agents: Agent[] = jsonData
            .filter(row => row['Name'] && row['Calls Made'] !== undefined)
            .map(row => ({
                name: String(row['Name'] || ''),
                callsMade: Number(row['Calls Made'] || 0),
                leadsReached: Number(row['Leads Reached'] || 0),
                conversions: Number(row['Conversions'] || 0),
                callSuccessRate: Number(row['Call Success Rate'] || 0),
            }))

        const totalCallsMade = agents.reduce((sum, agent) => sum + agent.callsMade, 0)
        const leadsContacted = agents.reduce((sum, agent) => sum + agent.leadsReached, 0)
        const successfulCalls = agents.reduce((sum, agent) => sum + agent.conversions, 0)
        const conversionRate = leadsContacted > 0
            ? (successfulCalls / leadsContacted) * 100
            : 0

        // Calculate daily activity from agents
        const avgCallsPerDay = totalCallsMade / 5
        const callVolume = [
            { day: 'Mon', calls: Math.round(avgCallsPerDay * 0.95) },
            { day: 'Tue', calls: Math.round(avgCallsPerDay * 0.88) },
            { day: 'Wed', calls: Math.round(avgCallsPerDay * 1.05) },
            { day: 'Thu', calls: Math.round(avgCallsPerDay * 0.98) },
            { day: 'Fri', calls: Math.round(avgCallsPerDay * 1.03) },
        ]

        const callSuccessRate = [
            { day: 'Mon', rate: conversionRate * 0.93 },
            { day: 'Tue', rate: conversionRate * 1.0 },
            { day: 'Wed', rate: conversionRate * 1.03 },
            { day: 'Thu', rate: conversionRate * 1.02 },
            { day: 'Fri', rate: conversionRate * 1.04 },
        ]

        const dailyAgentActivity = agents.map(agent => ({
            agent: agent.name,
            calls: Math.round(agent.callsMade / 5),
        }))

        return {
            totalCallsMade,
            leadsContacted,
            conversionRate,
            successfulCalls,
            agents,
            callVolume,
            callSuccessRate,
            dailyAgentActivity,
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
                    setTelemarketingData(parsedData)
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

    const maxCalls = Math.max(...telemarketingData.callVolume.map(d => d.calls), 0)
    const maxSuccessRate = Math.max(...telemarketingData.callSuccessRate.map(d => d.rate), 0)
    const maxDailyActivity = Math.max(...telemarketingData.dailyAgentActivity.map(d => d.calls), 0)

    const renderContent = () => {
        switch (activeSection) {
            case 'Dashboard':
                return (
                    <>
                        {/* Upload Data Section - First */}
                        <div className="upload-section">
                            <h3 className="section-title">Upload Call Data</h3>
                            <p className="upload-description">
                                Drop your Excel file here to upload call data for agents. The system will process the file and convert raw call data into real-time performance results.
                                Expected columns: Name, Calls Made, Leads Reached, Conversions, Call Success Rate
                            </p>
                            <div
                                className="upload-dropzone"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="upload-icon">📞</div>
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

                        {/* KPI Cards */}
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-label">Total Calls Made</div>
                                <div className="kpi-value">{telemarketingData.totalCallsMade.toLocaleString()}</div>
                                <div className="kpi-change positive">+8.2% vs last week</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Leads Contacted</div>
                                <div className="kpi-value">{telemarketingData.leadsContacted.toLocaleString()}</div>
                                <div className="kpi-change positive">+6.5% increase</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Conversion Rate</div>
                                <div className="kpi-value">{telemarketingData.conversionRate.toFixed(1)}%</div>
                                <div className="kpi-change positive">+1.2% improvement</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Successful Calls</div>
                                <div className="kpi-value">{telemarketingData.successfulCalls.toLocaleString()}</div>
                                <div className="kpi-change positive">+12.8% this week</div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="charts-section">
                            <div className="chart-card">
                                <h3 className="chart-title">Call Volume</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {telemarketingData.callVolume.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(data.calls / maxCalls) * 100}%`,
                                                    }}
                                                >
                                                    <span className="bar-value">{data.calls}</span>
                                                </div>
                                                <span className="bar-label">{data.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title">Call Success Rate</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {telemarketingData.callSuccessRate.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(data.rate / maxSuccessRate) * 100}%`,
                                                    }}
                                                >
                                                    <span className="bar-value">{data.rate.toFixed(1)}%</span>
                                                </div>
                                                <span className="bar-label">{data.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title">Daily Agent Activity</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {telemarketingData.dailyAgentActivity.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(data.calls / maxDailyActivity) * 100}%`,
                                                    }}
                                                >
                                                    <span className="bar-value">{data.calls}</span>
                                                </div>
                                                <span className="bar-label">{data.agent}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agent Table */}
                        <div className="table-section">
                            <h3 className="section-title">Agent Performance</h3>
                            <div className="table-wrapper">
                                <table className="agent-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Calls Made</th>
                                            <th>Leads Reached</th>
                                            <th>Conversions</th>
                                            <th>Call Success Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {telemarketingData.agents.map((agent, index) => (
                                            <tr key={index}>
                                                <td className="agent-name">{agent.name}</td>
                                                <td>{agent.callsMade.toLocaleString()}</td>
                                                <td>{agent.leadsReached.toLocaleString()}</td>
                                                <td>{agent.conversions.toLocaleString()}</td>
                                                <td>{agent.callSuccessRate.toFixed(1)}%</td>
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
                        <h3 className="section-title">Agent Performance</h3>
                        <div className="table-wrapper">
                            <table className="agent-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Calls Made</th>
                                        <th>Leads Reached</th>
                                        <th>Conversions</th>
                                        <th>Call Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {telemarketingData.agents.map((agent, index) => (
                                        <tr key={index}>
                                            <td className="agent-name">{agent.name}</td>
                                            <td>{agent.callsMade.toLocaleString()}</td>
                                            <td>{agent.leadsReached.toLocaleString()}</td>
                                            <td>{agent.conversions.toLocaleString()}</td>
                                            <td>{agent.callSuccessRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            case 'Calls':
                return (
                    <div className="charts-section">
                        <div className="chart-card">
                            <h3 className="chart-title">Call Volume</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {telemarketingData.callVolume.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(data.calls / maxCalls) * 100}%`,
                                                }}
                                            >
                                                <span className="bar-value">{data.calls}</span>
                                            </div>
                                            <span className="bar-label">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">Call Success Rate</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {telemarketingData.callSuccessRate.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(data.rate / maxSuccessRate) * 100}%`,
                                                }}
                                            >
                                                <span className="bar-value">{data.rate.toFixed(1)}%</span>
                                            </div>
                                            <span className="bar-label">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">Daily Agent Activity</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {telemarketingData.dailyAgentActivity.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(data.calls / maxDailyActivity) * 100}%`,
                                                }}
                                            >
                                                <span className="bar-value">{data.calls}</span>
                                            </div>
                                            <span className="bar-label">{data.agent}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'Upload Data':
                return (
                    <div className="upload-section">
                        <h3 className="section-title">Upload Call Data</h3>
                        <p className="upload-description">
                            Drop your Excel file here to upload call data for agents. The system will process the file and convert raw call data into real-time performance results.
                            Expected columns: Name, Calls Made, Leads Reached, Conversions, Call Success Rate
                        </p>
                        <div
                            className="upload-dropzone"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="upload-icon">📞</div>
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
            case 'Reports':
                return (
                    <div className="charts-section">
                        <div className="chart-card">
                            <h3 className="chart-title">Call Volume Report</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {telemarketingData.callVolume.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(data.calls / maxCalls) * 100}%`,
                                                }}
                                            >
                                                <span className="bar-value">{data.calls}</span>
                                            </div>
                                            <span className="bar-label">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">Call Success Rate Report</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {telemarketingData.callSuccessRate.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(data.rate / maxSuccessRate) * 100}%`,
                                                }}
                                            >
                                                <span className="bar-value">{data.rate.toFixed(1)}%</span>
                                            </div>
                                            <span className="bar-label">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'Settings':
                return (
                    <div className="table-section">
                        <h3 className="section-title">Settings</h3>
                        <p className="section-description">
                            Configure your telemarketing dashboard settings and preferences.
                        </p>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="telemarketing-dashboard">
            <aside className="telemarketing-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-title-container">
                        <h2 className="sidebar-title">Telemarketing</h2>
                        <div className="user-menu-container" ref={menuRef}>
                            <button 
                                className="logout-button" 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                title="User Menu"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                            {showUserMenu && (
                                <div className="user-menu-dropdown">
                                    <button 
                                        className="user-menu-item"
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            logout()
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                    <button 
                                        className="user-menu-item delete"
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            handleDeleteAccount()
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        <span>Delete Account</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {user && (
                        <p className="sidebar-greeting">Hello {user.name}</p>
                    )}
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeSection === 'Dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Agents' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Agents')}
                    >
                        Agents
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Calls' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Calls')}
                    >
                        Calls
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Upload Data' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Upload Data')}
                    >
                        Upload Data
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Reports' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Reports')}
                    >
                        Reports
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Settings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Settings')}
                    >
                        Settings
                    </button>
                </nav>
            </aside>

            <main className="telemarketing-main">
                <div className="telemarketing-content">
                    <h1 className="dashboard-title">
                        {activeSection === 'Dashboard' ? 'Performance Dashboard' : activeSection}
                    </h1>
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}
