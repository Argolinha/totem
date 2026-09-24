import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==========================================
// CONTEXTO E TELAS DO TOTEM
// ==========================================
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

// ==========================================
// TELAS DO ADMIN
// ==========================================
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
import Orcamentos from "./admin/Orcamentos";

// ==========================================
// MOCK / DESENVOLVIMENTO
// ==========================================
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

// ==========================================
// TOTEM / KIOSK
// ==========================================
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

// ==========================================
// ADMIN
// ==========================================
const AdminApp: React.FC = () => {
  return (
    <Routes>
      {/* /admin */}
      <Route
        path="/"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* Eventos */}
      <Route
        path="/eventos"
        element={<Eventos />}
      />

      {/* Efeitos */}
      <Route
        path="/efeitos"
        element={<Efeitos />}
      />

      {/* Molduras */}
      <Route
        path="/molduras"
        element={<Molduras />}
      />

      {/* Impressão */}
      <Route
        path="/impressao"
        element={<Impressao />}
      />

      {/* Fila */}
      <Route
        path="/fila"
        element={<Fila />}
      />

      {/* Fotos */}
      <Route
        path="/fotos"
        element={<Fotos />}
      />

      {/* Clientes */}
      <Route
        path="/clientes"
        element={<Clientes />}
      />

      {/* Adicionar cliente */}
      <Route
        path="/clientes/adicionar"
        element={<AdicionarCliente />}
      />

      {/* Orçamentos */}
      <Route
        path="/orcamentos"
        element={<Orcamentos />}
      />

      {/* Relatórios */}
      <Route
        path="/relatorios"
        element={<Relatorios />}
      />

      {/* Configuração */}
      <Route
        path="/config"
        element={<Config />}
      />

      {/* Sistema */}
      <Route
        path="/sistema"
        element={<Sistema />}
      />

      {/* Rota inválida dentro do admin */}
      <Route
        path="*"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

// ==========================================
// APP PRINCIPAL
// ==========================================
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={<AdminApp />}
        />

        {/* TOTEM */}
        <Route
          path="/*"
          element={<KioskApp />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;