import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SalesSQLResearch from './pages/tools/SalesSQLResearch'
import ApifyResearch from './pages/tools/ApifyResearch'
import ProspeoResearch from './pages/tools/ProspeoResearch'
import EmailExtractor from './pages/tools/EmailExtractor'
import DataScraper from './pages/tools/DataScraper'
import ICPBuilder from './pages/tools/ICPBuilder'
import LinkedInScraper from './pages/tools/LinkedInScraper'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools/salessql" element={<SalesSQLResearch />} />
        <Route path="/tools/apify" element={<ApifyResearch />} />
        <Route path="/tools/prospeo" element={<ProspeoResearch />} />
        <Route path="/tools/email-extractor" element={<EmailExtractor />} />
        <Route path="/tools/data-scraper" element={<DataScraper />} />
        <Route path="/tools/icp-builder" element={<ICPBuilder />} />
        <Route path="/tools/linkedin-scraper" element={<LinkedInScraper />} />
        <Route path="/billing" element={<Placeholder title="Credits & Billing" />} />
        <Route path="/flows" element={<Placeholder title="Flow Management" />} />
        <Route path="/profile" element={<Placeholder title="Profile" />} />
      </Routes>
    </Layout>
  )
}
