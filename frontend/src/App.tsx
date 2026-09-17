import React from "react";
import Layout from "./layout";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


// --- Contexto e telas do Totem ---
import { useSessionContext } from "./context/SessionContext";
import Welcome from "./components/Welcome";
import ExperienceSelect from "./components/ExperienceSelect";
import PeopleSelect from "./components/PeopleSelect";
import CameraCapture from "./components/CameraCapture";
import Processing from "./components/Processing";
import ResultsGrid from "./components/ResultsGrid";
import FrameSelect from "./components/FrameSelect";
import FinalPreview from "./components/FinalPreview";
import OutputOptions from "./components/OutputOptions";
import Printing from "./components/Printing";
import QRDisplay from "./components/QRDisplay";
import ThankYou from "./components/ThankYou";
import ErrorScreen from "./components/ErrorScreen";
import DevScreenSwitcher from "./components/DevScreenSwitcher";

// --- Telas do Admin ---
import Dashboard from "./admin/Dashboard";
import Eventos from "./admin/Eventos";
import Efeitos from "./admin/Efeitos";
import Molduras from "./admin/Molduras";
import Impressao from "./admin/Impressao";
import Fila from "./admin/Fila";
import Fotos from "./admin/Fotos";
import Config from "./admin/Config";
import Sistema from "./admin/Sistema";
import Relatorios from "./admin/Relatorios";
import Clientes from "./admin/Clientes";
import AdicionarCliente from "./admin/AdicionarCliente";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";
import Orcamentos from "./admin/Orcamentos";
/**
 * TOTEM (Kiosk)
 * Roteador interno baseado no estado `screen` do SessionContext.
 */
const KioskApp: React.FC = () => {
  const { screen } = useSessionContext();

  const screens: Record<string, React.ReactNode> = {
    welcome: <Welcome />,
    "experience-select": <ExperienceSelect />,
    "people-select": <PeopleSelect />,
    camera: <CameraCapture />,
    processing: <Processing />,
    results: <ResultsGrid />,
    "frame-select": <FrameSelect />,
    "final-preview": <FinalPreview />,
    "output-options": <OutputOptions />,
    printing: <Printing />,
    qr: <QRDisplay />,
    "thank-you": <ThankYou />,
    error: <ErrorScreen />,
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {screens[screen] ?? <Welcome />}
      {USE_MOCK && <DevScreenSwitcher />}
    </div>
  );
};

/**
 * ADMIN
 * Painel administrativo — rota fechada acessível apenas via /admin.
 * Todas as rotas abaixo são relativas ao prefixo /admin.
 */
const AdminApp: React.FC = () => {
  return (
    <Routes>
      {/* /admin → redireciona para /admin/dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/efeitos" element={<Efeitos />} />
      <Route path="/molduras" element={<Molduras />} />
      <Route path="/impressao" element={<Impressao />} />
      <Route path="/fila" element={<Fila />} />
      <Route path="/fotos" element={<Fotos />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/orcamentos" element={<Orcamentos />} />
      

      <Route
       path="/clientes/adicionar"
       element={<AdicionarCliente />}
      />  

      {/* Rotas ainda não implementadas → voltam para o dashboard */}
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/config" element={<Config />} />
      <Route path="/sistema" element={<Sistema />} />

      {/* Qualquer rota /admin/* inválida → volta para o dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

/**
 * APP (ROOT)
 *  - /admin/*  → Painel Administrativo (rota fechada)
 *  - /*        → Totem (Kiosk)
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<KioskApp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;