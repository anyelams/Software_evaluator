import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EvaluatorDashboard() {
  const { user, token, logout } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const navigate = useNavigate();

  const fetchMyEvaluations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/evaluator/my-evaluations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvaluations(res.data);
    } catch (err) {
      console.error("Error al obtener evaluaciones:", err);
    }
  };

  useEffect(() => {
    fetchMyEvaluations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Bienvenido, {user.name}{" "}
          <span className="text-sm text-gray-500">(Evaluador)</span>
        </h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold mb-4">Evaluaciones asignadas</h3>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Software</th>
              <th className="border px-4 py-2">Empresa</th>
              <th className="border px-4 py-2">Norma</th>
              <th className="border px-4 py-2">Estado</th>
              <th className="border px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((ev) => (
              <tr key={ev.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{ev.id}</td>
                <td className="border px-4 py-2">{ev.software_name}</td>
                <td className="border px-4 py-2">{ev.company_name}</td>
                <td className="border px-4 py-2">{ev.standard_name}</td>
                <td className="border px-4 py-2 capitalize">
                  {ev.status === "pending" ? "Pendiente" : "Completado"}
                </td>
                <td className="border px-4 py-2">
                  {ev.status === "pending" ? (
                    <button
                      onClick={() => navigate(`/evaluate/${ev.id}`)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Evaluar
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/summary/${ev.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Ver resumen
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
