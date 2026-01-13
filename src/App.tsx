import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import EventManagement from './pages/solutions/EventManagement';
import PersonnelControl from './pages/solutions/PersonnelControl';
import TimeTracking from './pages/solutions/TimeTracking';
import Payroll from './pages/solutions/Payroll';
import CostEstimation from './pages/solutions/CostEstimation';
import SmartReports from './pages/solutions/SmartReports';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/sobre" element={<About />} />
        
        {/* Solutions Routes */}
        <Route path="/solucoes/gestao-eventos" element={<EventManagement />} />
        <Route path="/solucoes/controle-pessoal" element={<PersonnelControl />} />
        <Route path="/solucoes/lancamento-horas" element={<TimeTracking />} />
        <Route path="/solucoes/folha-pagamento" element={<Payroll />} />
        <Route path="/solucoes/estimativa-custos" element={<CostEstimation />} />
        <Route path="/solucoes/relatorios-inteligentes" element={<SmartReports />} />
      </Routes>
    </Router>
  );
}

export default App;
