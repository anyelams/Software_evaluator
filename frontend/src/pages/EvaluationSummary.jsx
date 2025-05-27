import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EvaluationSummary() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const now = new Date();
  const formattedDate = now.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/evaluator/evaluation/${id}/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("📦 Resumen recibido:", res.data);
        setData(res.data);
      } catch (error) {
        console.error("❌ Error al cargar el resumen:", error);
      }
    };

    fetchSummary();
  }, [id, token]);

  const generatePDF = () => {
    if (!data) return;
    const { evaluation, scores = [], summary, weights = [] } = data;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Evaluación", 14, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Fecha de generación: ${formattedDate}`, 14, 22);
    doc.text(`Evaluador: ${evaluation.evaluator_name}`, 14, 30);
    doc.text(`Software: ${evaluation.software_name}`, 14, 37);
    doc.text(`Empresa: ${evaluation.company_name}`, 14, 44);
    doc.text(`Norma: ${evaluation.standard_name}`, 14, 51);

    doc.text("Comentarios generales:", 14, 66);
    doc.text(evaluation.general_comments || "N/A", 14, 73);

    autoTable(doc, {
      startY: 83,
      head: [["Criterio", "Subcriterio", "Puntaje", "Comentario"]],
      body: (() => {
        const grouped = scores.reduce((acc, curr) => {
          if (!acc[curr.criteria_name]) acc[curr.criteria_name] = [];
          acc[curr.criteria_name].push(curr);
          return acc;
        }, {});

        const rows = [];
        Object.entries(grouped).forEach(([criteria, items]) => {
          items.forEach((s, idx) => {
            rows.push([
              idx === 0 ? criteria : "",
              s.subcriteria_name,
              s.score,
              s.comment || "-",
            ]);
          });
        });
        return rows;
      })(),
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: 0,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });

    if (weights.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Criterio", "Peso (%)", "Total puntos", "Cumplimiento (%)"]],
        body: weights.map((w) => {
          const criteriaScores = scores.filter(
            (s) => s.criteria_id === w.category_id
          );
          const totalPoints = criteriaScores.reduce(
            (sum, s) => sum + (parseFloat(s.score) || 0),
            0
          );
          const maxPoints = criteriaScores.length * 5;
          const percentage =
            maxPoints > 0
              ? ((totalPoints / maxPoints) * 100).toFixed(2) + "%"
              : "-";

          return [
            criteriaScores[0]?.criteria_name || `ID ${w.category_id}`,
            `${w.weight_num}%`,
            `${totalPoints} / ${maxPoints}`,
            percentage,
          ];
        }),
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: 0,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
      });
    }

    doc.save(`evaluacion_${evaluation.id}.pdf`);
  };

  if (!data) {
    return <p className="text-center text-gray-600">Cargando resumen...</p>;
  }

  const { evaluation, summary, scores = [], weights = [] } = data;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Resumen de Evaluación
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
        <p>
          <strong>Fecha de generación:</strong> {formattedDate}
        </p>
        <p>
          <strong>Evaluador:</strong> {evaluation.evaluator_name}
        </p>
        <p>
          <strong>Software:</strong> {evaluation.software_name}
        </p>
        <p>
          <strong>Empresa:</strong> {evaluation.company_name}
        </p>
        <p className="md:col-span-2">
          <strong>Norma:</strong> {evaluation.standard_name}
        </p>
        <p className="md:col-span-2">
          <strong>Comentarios generales:</strong>{" "}
          {evaluation.general_comments || "N/A"}
        </p>
      </div>

      {summary && (
        <div className="mt-6 mb-6 bg-gray-100 p-4 rounded grid grid-cols-1 md:grid-cols-3 text-center gap-4 font-medium">
          <div>
            <p className="text-sm text-gray-600">Total puntos</p>
            <p className="text-lg font-bold">
              {summary.total_score ?? "-"} / {summary.total_max ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Porcentaje</p>
            <p className="text-lg font-bold">{summary.percentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor final</p>
            <p className="text-lg font-bold">
              {summary.value} – {summary.label}
            </p>
          </div>
        </div>
      )}

      <h3 className="text-xl font-semibold mt-6 mb-2">Calificaciones</h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Criterio</th>
              <th className="border px-4 py-2">Subcriterio</th>
              <th className="border px-4 py-2">Puntaje</th>
              <th className="border px-4 py-2">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const grouped = scores.reduce((acc, curr) => {
                if (!acc[curr.criteria_name]) acc[curr.criteria_name] = [];
                acc[curr.criteria_name].push(curr);
                return acc;
              }, {});

              return Object.entries(grouped).flatMap(([criteria, items], i) =>
                items.map((s, idx) => (
                  <tr key={`${criteria}-${idx}`} className="hover:bg-gray-50">
                    {idx === 0 && (
                      <td
                        className="border px-4 py-2 font-semibold"
                        rowSpan={items.length}
                      >
                        {criteria}
                      </td>
                    )}
                    <td className="border px-4 py-2">{s.subcriteria_name}</td>
                    <td className="border px-4 py-2">{s.score}</td>
                    <td className="border px-4 py-2">{s.comment || "-"}</td>
                  </tr>
                ))
              );
            })()}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-2">Pesos por Categoría</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Criterio</th>
              <th className="border px-4 py-2">Peso (%)</th>
              <th className="border px-4 py-2">Total puntos</th>
              <th className="border px-4 py-2">Cumplimiento (%)</th>
            </tr>
          </thead>
          <tbody>
            {weights.length > 0 ? (
              weights.map((w, i) => {
                const criteriaScores = scores.filter(
                  (s) => s.criteria_id === w.category_id
                );
                const totalPoints = criteriaScores.reduce(
                  (sum, s) => sum + (parseFloat(s.score) || 0),
                  0
                );
                const maxPoints = criteriaScores.length * 5;
                const percentage =
                  maxPoints > 0
                    ? ((totalPoints / maxPoints) * 100).toFixed(2) + "%"
                    : "-";

                const name =
                  criteriaScores[0]?.criteria_name || `ID ${w.category_id}`;

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{name}</td>
                    <td className="border px-4 py-2">{w.weight_num}%</td>
                    <td className="border px-4 py-2">{`${totalPoints} / ${maxPoints}`}</td>
                    <td className="border px-4 py-2">{percentage}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-2 text-gray-500">
                  No hay pesos registrados para esta evaluación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
        >
          Volver atrás
        </button>

        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
