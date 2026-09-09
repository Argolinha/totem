import React from "react";
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

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

/**
 * Componente raiz: atua como um roteador simples baseado no estado
 * `screen` do SessionContext, renderizando a tela correspondente à
 * etapa atual do fluxo do totem.
 */
const App: React.FC = () => {
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
      {screens[screen]}
      {USE_MOCK && <DevScreenSwitcher />}
    </div>
  );
};

export default App;
