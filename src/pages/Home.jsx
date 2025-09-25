import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MainContentWrapper from "../components/MainContentWrapper";

function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <MainContentWrapper useMaxWidth={false}>
            <div className="min-h-[80vh] flex flex-col">
                {/* Hero Section */}
                <section className="flex-1 flex items-center justify-center py-16">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h1 className="text-5xl md:text-6xl font-bold text-theme-primary mb-6">
                            Risk UI
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                            Modern Portfolio Risk Management
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            A full-stack investment portfolio management platform with real-time price updates, 
                            risk analytics, and modern event-driven architecture.
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link 
                                to="/ticker" 
                                className="bg-theme-primary hover:bg-theme-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 text-lg"
                            >
                                Analyze Tickers
                            </Link>
                            {isAuthenticated ? (
                                <Link 
                                    to="/portfolio" 
                                    className="border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 text-lg"
                                >
                                    View Portfolio
                                </Link>
                            ) : (
                                <Link 
                                    to="/register" 
                                    className="border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 text-lg"
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4">
                        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            Key Features
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="w-16 h-16 bg-theme-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Management</h4>
                                <p className="text-gray-600">
                                    Manage investment positions with real-time price updates and comprehensive tracking.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="w-16 h-16 bg-theme-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">Risk Analytics</h4>
                                <p className="text-gray-600">
                                    Calculate volatility, Sharpe ratio, max drawdown, and other key risk metrics.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="w-16 h-16 bg-theme-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h4>
                                <p className="text-gray-600">
                                    Event-driven architecture with Redis pub/sub for instant price synchronization.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technology Stack Section */}
                <section className="py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            Built With Modern Technology
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-blue-600">⚛️</span>
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1">React 19</h5>
                                <p className="text-sm text-gray-600">Modern UI with Vite</p>
                            </div>
                            
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-green-600">🚀</span>
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1">FastAPI</h5>
                                <p className="text-sm text-gray-600">High-performance backend</p>
                            </div>
                            
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-blue-800">🐘</span>
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1">PostgreSQL</h5>
                                <p className="text-sm text-gray-600">Reliable data storage</p>
                            </div>
                            
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-red-600">📡</span>
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1">Redis</h5>
                                <p className="text-sm text-gray-600">Event-driven updates</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Deployment Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h3 className="text-3xl font-bold text-gray-900 mb-8">
                            Production Deployment
                        </h3>
                        <p className="text-lg text-gray-600 mb-8">
                            Deployed across modern cloud platforms for scalability and reliability
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                                <span className="w-8 h-8 bg-black rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">▲</span>
                                </span>
                                <span className="font-semibold text-gray-900">Vercel</span>
                                <span className="text-gray-500 text-sm">Frontend</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                                <span className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">R</span>
                                </span>
                                <span className="font-semibold text-gray-900">Render</span>
                                <span className="text-gray-500 text-sm">Backend</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                                <span className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">U</span>
                                </span>
                                <span className="font-semibold text-gray-900">Upstash</span>
                                <span className="text-gray-500 text-sm">Redis</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainContentWrapper>
    )
}

export default Home