import MainContentWrapper from "../components/MainContentWrapper";

function Home() {
    return (
        <MainContentWrapper useMaxWidth={false}>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-theme-primary mb-4">Welcome to Ticker Metrics App</h1>
                <p className="text-lg text-gray-600">Analyze asset metrics or view your portfolio.</p>
            </div>
        </MainContentWrapper>
    )
}

export default Home