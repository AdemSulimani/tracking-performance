import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <h1>Something went wrong</h1>
                    <p>{this.state.error?.message}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.5rem 1rem',
                            marginTop: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

