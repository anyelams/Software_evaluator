import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EvaluationListSection() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [evaluationsByCompany, setEvaluationsByCompany] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchEvaluations = async () => {
      const res = await axios.get("http://localhost:4000/api/evaluations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Agrupar por empresa
      const grouped = {};
      res.data.forEach((ev) => {
        if (!grouped[ev.company_name]) grouped[ev.company_name] = [];
        grouped[ev.company_name].push(ev);
      });
      setEvaluationsByCompany(grouped);
    };

    fetchEvaluations();
  }, [token]);

  const toggleCompany = (companyName) => {
    setExpanded((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">
        Evaluaciones por Empresa
      </h3>

      {Object.entries(evaluationsByCompany).map(([company, evaluations]) => (
        <div key={company} className="mb-6 border rounded">
          <button
            onClick={() => toggleCompany(company)}
            className={`w-full flex items-center justify-between px-4 py-3 border-b text-gray-800 font-medium transition ${
              expanded[company] ? "bg-gray-100" : "bg-white hover:bg-gray-100"
            }`}
          >
            <span>{company}</span>
            <span className="text-gray-500">
              {expanded[company] ? "▲" : "▼"}
            </span>
          </button>

          {expanded[company] && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-300">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Software</th>
                    <th className="px-4 py-2 border">Norma</th>
                    <th className="px-4 py-2 border">Evaluador</th>
                    <th className="px-4 py-2 border">Estado</th>
                    <th className="px-4 py-2 border">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{ev.id}</td>
                      <td className="px-4 py-2 border">{ev.software_name}</td>
                      <td className="px-4 py-2 border">{ev.standard_name}</td>
                      <td className="px-4 py-2 border">{ev.evaluator_name}</td>
                      <td className="px-4 py-2 border capitalize">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            ev.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => navigate(`/admin/evaluation/${ev.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
