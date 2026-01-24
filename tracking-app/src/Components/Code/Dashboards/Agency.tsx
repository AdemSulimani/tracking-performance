import { useState, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import '../../Style/Dashboards style/Agency.css'
import { useAuth } from '../../../context/AuthContext'

interface TeamMember {
    name: string
    projectsAssigned: number
    tasksCompleted: number
    performanceScore: number
    status: 'Active' | 'On Leave' | 'Busy'
}

interface Project {
    name: string
    progress: number
    status: 'In Progress' | 'Completed' | 'On Hold'
}

interface Campaign {
    name: string
    leads: number
    conversions: number
    roi: number
}

interface AgencyData {
    activeProjects: number
    tasksCompleted: number
    leadsGenerated: number
    campaignPerformance: number
    teamMembers: TeamMember[]
    projectProgress: { project: string; progress: number }[]
    teamProductivity: { member: string; productivity: number }[]
    campaignResults: { campaign: string; results: number }[]
    projects: Project[]
    campaigns: Campaign[]
}

export function Agency() {
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
    const [agencyData, setAgencyData] = useState<AgencyData>({
        activeProjects: 24,
        tasksCompleted: 342,
        leadsGenerated: 1280,
        campaignPerformance: 87.5,
        teamMembers: [
            { name: 'Alexandra Chen', projectsAssigned: 5, tasksCompleted: 48, performanceScore: 94, status: 'Active' },
            { name: 'Marcus Rodriguez', projectsAssigned: 4, tasksCompleted: 42, performanceScore: 91, status: 'Active' },
            { name: 'Sophie Williams', projectsAssigned: 6, tasksCompleted: 56, performanceScore: 88, status: 'Active' },
            { name: 'Jordan Taylor', projectsAssigned: 3, tasksCompleted: 38, performanceScore: 85, status: 'Busy' },
            { name: 'Riley Martinez', projectsAssigned: 4, tasksCompleted: 45, performanceScore: 92, status: 'Active' },
            { name: 'Casey Johnson', projectsAssigned: 5, tasksCompleted: 52, performanceScore: 89, status: 'Active' },
            { name: 'Morgan Davis', projectsAssigned: 2, tasksCompleted: 28, performanceScore: 82, status: 'On Leave' },
        ],
        projectProgress: [
            { project: 'Brand Refresh', progress: 85 },
            { project: 'Social Campaign', progress: 72 },
            { project: 'Website Redesign', progress: 60 },
            { project: 'SEO Optimization', progress: 45 },
            { project: 'Content Strategy', progress: 90 },
        ],
        teamProductivity: [
            { member: 'Alexandra', productivity: 94 },
            { member: 'Marcus', productivity: 91 },
            { member: 'Sophie', productivity: 88 },
            { member: 'Jordan', productivity: 85 },
            { member: 'Riley', productivity: 92 },
        ],
        campaignResults: [
            { campaign: 'Q4 Launch', results: 95 },
            { campaign: 'Summer Promo', results: 78 },
            { campaign: 'Brand Awareness', results: 82 },
            { campaign: 'Lead Gen', results: 88 },
            { campaign: 'Retargeting', results: 91 },
        ],
        projects: [
            { name: 'Brand Refresh', progress: 85, status: 'In Progress' },
            { name: 'Social Campaign', progress: 72, status: 'In Progress' },
            { name: 'Website Redesign', progress: 60, status: 'In Progress' },
            { name: 'SEO Optimization', progress: 45, status: 'In Progress' },
            { name: 'Content Strategy', progress: 90, status: 'In Progress' },
        ],
        campaigns: [
            { name: 'Q4 Launch', leads: 320, conversions: 45, roi: 95 },
            { name: 'Summer Promo', leads: 280, conversions: 38, roi: 78 },
            { name: 'Brand Awareness', leads: 240, conversions: 32, roi: 82 },
            { name: 'Lead Gen', leads: 260, conversions: 42, roi: 88 },
            { name: 'Retargeting', leads: 180, conversions: 28, roi: 91 },
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
                setAgencyData(parsedData)
            } catch (error) {
                alert('Error parsing Excel file. Please ensure the file format is correct.')
                console.error('Error parsing Excel:', error)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const parseExcelData = (jsonData: any[]): AgencyData => {
        // Expected Excel format for Team Data:
        // Columns: Name, Projects Assigned, Tasks Completed, Performance Score, Status
        
        const teamMembers: TeamMember[] = jsonData
            .filter(row => row['Name'] && row['Projects Assigned'] !== undefined)
            .map(row => ({
                name: String(row['Name'] || ''),
                projectsAssigned: Number(row['Projects Assigned'] || 0),
                tasksCompleted: Number(row['Tasks Completed'] || 0),
                performanceScore: Number(row['Performance Score'] || 0),
                status: (row['Status'] === 'Active' || row['Status'] === 'On Leave' || row['Status'] === 'Busy') 
                    ? row['Status'] as 'Active' | 'On Leave' | 'Busy'
                    : 'Active' as const,
            }))

        const activeProjects = teamMembers.reduce((sum, member) => sum + member.projectsAssigned, 0)
        const tasksCompleted = teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)
        const avgPerformance = teamMembers.length > 0
            ? teamMembers.reduce((sum, member) => sum + member.performanceScore, 0) / teamMembers.length
            : 0

        // Calculate leads generated (estimate based on tasks completed)
        const leadsGenerated = Math.round(tasksCompleted * 3.7)
        const campaignPerformance = avgPerformance

        // Generate project progress data
        const projectProgress = teamMembers.slice(0, 5).map((member, index) => ({
            project: `Project ${String.fromCharCode(65 + index)}`,
            progress: Math.min(100, Math.round((member.tasksCompleted / 60) * 100)),
        }))

        // Generate team productivity data
        const teamProductivity = teamMembers.slice(0, 5).map(member => ({
            member: member.name.split(' ')[0],
            productivity: member.performanceScore,
        }))

        // Generate campaign results data
        const campaignResults = [
            { campaign: 'Campaign A', results: Math.round(avgPerformance + Math.random() * 10 - 5) },
            { campaign: 'Campaign B', results: Math.round(avgPerformance + Math.random() * 10 - 5) },
            { campaign: 'Campaign C', results: Math.round(avgPerformance + Math.random() * 10 - 5) },
            { campaign: 'Campaign D', results: Math.round(avgPerformance + Math.random() * 10 - 5) },
            { campaign: 'Campaign E', results: Math.round(avgPerformance + Math.random() * 10 - 5) },
        ]

        return {
            activeProjects,
            tasksCompleted,
            leadsGenerated,
            campaignPerformance,
            teamMembers,
            projectProgress,
            teamProductivity,
            campaignResults,
            projects: projectProgress.map((p) => ({
                name: p.project,
                progress: p.progress,
                status: p.progress >= 90 ? 'Completed' as const : p.progress >= 50 ? 'In Progress' as const : 'On Hold' as const,
            })),
            campaigns: campaignResults.map((c) => ({
                name: c.campaign,
                leads: Math.round(leadsGenerated / campaignResults.length + Math.random() * 50),
                conversions: Math.round((leadsGenerated / campaignResults.length) * 0.15),
                roi: c.results,
            })),
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
                    setAgencyData(parsedData)
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

    const maxProgress = Math.max(...agencyData.projectProgress.map(d => d.progress), 0)
    const maxProductivity = Math.max(...agencyData.teamProductivity.map(d => d.productivity), 0)
    const maxCampaignResults = Math.max(...agencyData.campaignResults.map(d => d.results), 0)

    const renderContent = () => {
        switch (activeSection) {
            case 'Dashboard':
    return (
        <>
                        {/* Upload Data Section - First */}
                        <div className="upload-section">
                            <h3 className="section-title">Upload Team & Campaign Data</h3>
                            <p className="upload-description">
                                Drop your Excel file here to upload team or campaign data. Our smart system will automatically calculate performance metrics, 
                                generate insights, and transform raw data into actionable intelligence. 
                                <br /><br />
                                <strong>Expected columns for Team Data:</strong> Name, Projects Assigned, Tasks Completed, Performance Score, Status
                                <br />
                                <strong>Expected columns for Campaign Data:</strong> Campaign Name, Leads, Conversions, ROI
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

                        {/* KPI Cards */}
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-label">Active Projects</div>
                                <div className="kpi-value">{agencyData.activeProjects}</div>
                                <div className="kpi-change positive">+3 new this month</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Tasks Completed</div>
                                <div className="kpi-value">{agencyData.tasksCompleted.toLocaleString()}</div>
                                <div className="kpi-change positive">+12% vs last month</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Leads Generated</div>
                                <div className="kpi-value">{agencyData.leadsGenerated.toLocaleString()}</div>
                                <div className="kpi-change positive">+18% growth</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Campaign Performance</div>
                                <div className="kpi-value">{agencyData.campaignPerformance.toFixed(1)}%</div>
                                <div className="kpi-change positive">+2.5% improvement</div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="charts-section">
                            <div className="chart-card">
                                <h3 className="chart-title">Project Progress</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {agencyData.projectProgress.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(data.progress / maxProgress) * 100}%`,
                                                    }}
                                                >
                                                    <span className="bar-value">{data.progress}%</span>
                                                </div>
                                                <span className="bar-label">{data.project}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title">Team Productivity</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {agencyData.teamProductivity.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(data.productivity / maxProductivity) * 100}%`,
                                                    }}
                                                >
                                                    <span className="bar-value">{data.productivity}</span>
                                                </div>
                                                <span className="bar-label">{data.member}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3 className="chart-title">Campaign Results</h3>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {agencyData.campaignResults.map((data, index) => (
                                            <div key={index} className="bar-wrapper">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(data.results / maxCampaignResults) * 100}%`,
                                                    }}
                                                >
                                                    <span className="bar-value">{data.results}%</span>
                                                </div>
                                                <span className="bar-label">{data.campaign}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team Table Section */}
                        <div className="table-section">
                            <h3 className="section-title">Team Performance</h3>
                            <p className="section-description">
                                Track your team's productivity and performance metrics. See who's crushing it and who might need a boost.
                            </p>
                            <div className="table-wrapper">
                                <table className="team-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Projects Assigned</th>
                                            <th>Tasks Completed</th>
                                            <th>Performance Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agencyData.teamMembers.map((member, index) => (
                                            <tr key={index}>
                                                <td className="member-name">{member.name}</td>
                                                <td>{member.projectsAssigned}</td>
                                                <td>{member.tasksCompleted}</td>
                                                <td>
                                                    <span className="score-badge">{member.performanceScore}</span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${member.status.toLowerCase().replace(' ', '-')}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Projects Section */}
                        <div className="projects-section">
                            <h3 className="section-title">Active Projects</h3>
                            <p className="section-description">
                                Monitor project progress and keep everything on track. Visualize where each project stands.
                            </p>
                            <div className="projects-grid">
                                {agencyData.projects.map((project, index) => (
                                    <div key={index} className="project-card">
                                        <div className="project-header">
                                            <h4 className="project-name">{project.name}</h4>
                                            <span className={`project-status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text">{project.progress}% Complete</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
            </div>
                    </>
                )
            case 'Team':
                return (
                    <div className="table-section">
                        <h3 className="section-title">Team Performance</h3>
                        <p className="section-description">
                            Track your team's productivity and performance metrics. See who's crushing it and who might need a boost.
                        </p>
                        <div className="table-wrapper">
                            <table className="team-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Projects Assigned</th>
                                        <th>Tasks Completed</th>
                                        <th>Performance Score</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agencyData.teamMembers.map((member, index) => (
                                        <tr key={index}>
                                            <td className="member-name">{member.name}</td>
                                            <td>{member.projectsAssigned}</td>
                                            <td>{member.tasksCompleted}</td>
                                            <td>
                                                <span className="score-badge">{member.performanceScore}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${member.status.toLowerCase().replace(' ', '-')}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            case 'Projects':
                return (
                    <div className="projects-section">
                        <h3 className="section-title">Active Projects</h3>
                        <p className="section-description">
                            Monitor project progress and keep everything on track. Visualize where each project stands.
                        </p>
                        <div className="projects-grid">
                            {agencyData.projects.map((project, index) => (
                                <div key={index} className="project-card">
                                    <div className="project-header">
                                        <h4 className="project-name">{project.name}</h4>
                                        <span className={`project-status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">{project.progress}% Complete</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 'Upload Data':
                return (
                    <div className="upload-section">
                        <h3 className="section-title">Upload Team & Campaign Data</h3>
                        <p className="upload-description">
                            Drop your Excel file here to upload team or campaign data. Our smart system will automatically calculate performance metrics, 
                            generate insights, and transform raw data into actionable intelligence. 
                            <br /><br />
                            <strong>Expected columns for Team Data:</strong> Name, Projects Assigned, Tasks Completed, Performance Score, Status
                            <br />
                            <strong>Expected columns for Campaign Data:</strong> Campaign Name, Leads, Conversions, ROI
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
            case 'Performance':
                return (
                    <div className="performance-section">
                        <h3 className="section-title">Campaign Performance</h3>
                        <p className="section-description">
                            Dive deep into campaign analytics. See which campaigns are driving results and which need optimization.
                        </p>
                        <div className="campaigns-grid">
                            {agencyData.campaigns.map((campaign, index) => (
                                <div key={index} className="campaign-card">
                                    <h4 className="campaign-name">{campaign.name}</h4>
                                    <div className="campaign-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Leads</span>
                                            <span className="metric-value">{campaign.leads}</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Conversions</span>
                                            <span className="metric-value">{campaign.conversions}</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">ROI</span>
                                            <span className="metric-value">{campaign.roi}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 'Settings':
                return (
                    <div className="settings-section">
                        <h3 className="section-title">Dashboard Settings</h3>
                        <div className="settings-grid">
                            <div className="settings-card">
                                <h4>Notification Preferences</h4>
                                <p>Configure how and when you receive updates about team performance and project milestones.</p>
                            </div>
                            <div className="settings-card">
                                <h4>Data Refresh Rate</h4>
                                <p>Set how frequently the dashboard updates with the latest metrics and performance data.</p>
                            </div>
                            <div className="settings-card">
                                <h4>Export Settings</h4>
                                <p>Customize report formats and scheduling for automated performance reports.</p>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="agency-dashboard">
            <aside className="agency-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-title-container">
                        <h2 className="sidebar-title">Agency Hub</h2>
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
                        className={`nav-item ${activeSection === 'Team' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Team')}
                    >
                        Team
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Projects' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Projects')}
                    >
                        Projects
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Upload Data' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Upload Data')}
                    >
                        Upload Data
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Performance' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Performance')}
                    >
                        Performance
                    </button>
                    <button
                        className={`nav-item ${activeSection === 'Settings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('Settings')}
                    >
                        Settings
                    </button>
                </nav>
            </aside>

            <main className="agency-main">
                <div className="agency-content">
                    <h1 className="dashboard-title">Marketing Dashboard</h1>
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}
