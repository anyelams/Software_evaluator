import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import StandardsSection from "../sections/StandardsSection";
import CompaniesSection from "../sections/CompaniesSection";
import SoftwareSection from "../sections/SoftwareSection";
import AssignmentSection from "../sections/AssignmentSection";
import EvaluationListSection from "../sections/EvaluationListSection";
import CriteriaSection from "../sections/CriteriaSection";

const TABS = [
  { key: "standards", label: "Normas ISO" },
  { key: "criteria", label: "Criterios/Subcriterios" },
  { key: "companies", label: "Empresas" },
  { key: "softwares", label: "Softwares" },
  { key: "assignments", label: "Asignar Evaluaciones" },
  { key: "evaluations", label: "Ver Evaluaciones" },
];

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [tab, setTab] = useState("standards");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Bienvenido, {user.name}{" "}
          <span className="text-sm text-gray-500">(Admin)</span>
        </h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido dinámico */}
      <div className="bg-white shadow rounded-lg p-6">
        {tab === "standards" && <StandardsSection />}
        {tab === "criteria" && <CriteriaSection />}
        {tab === "companies" && <CompaniesSection />}
        {tab === "softwares" && <SoftwareSection />}
        {tab === "assignments" && <AssignmentSection />}
        {tab === "evaluations" && <EvaluationListSection />}
      </div>
    </div>
  );
}
