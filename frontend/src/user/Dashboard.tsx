import { useNavigate } from "react-router-dom";
import { Dashboard as LegacyDashboard } from "../components/Dashboard";

export function Dashboard() {
  const navigate = useNavigate();
  return <LegacyDashboard onBack={() => navigate("/")} />;
}

