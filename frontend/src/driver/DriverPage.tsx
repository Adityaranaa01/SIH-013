import { useNavigate } from "react-router-dom";
import { DriverPage as LegacyDriverPage } from "../components/DriverPage";

export function DriverPage() {
  const navigate = useNavigate();
  return <LegacyDriverPage onBack={() => navigate("/")} />;
}

