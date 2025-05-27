import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function EvaluationForm() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [scores, setScores] = useState([]);
  const [weights, setWeights] = useState({});
  const [generalComments, setGeneralComments] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await axios.get(
        `http://localhost:4000/api/evaluator/evaluation/${id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(res.data);
      const defaultScores = res.data.criteria.map((item) => ({
        subcriteria_id: item.subcriteria_id,
        score: "",
        comment: "",
      }));
      setScores(defaultScores);
    };

    fetchDetails();
  }, [id, token]);

  const handleScoreChange = (index, field, value) => {
    const updated = [...scores];
    updated[index][field] = value;
    setScores(updated);
  };

  const handleWeightChange = (criteria_id, value) => {
    setWeights((prev) => ({
      ...prev,
      [criteria_id]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const weightsArray = Object.entries(weights).map(
      ([category_id, weight_num]) => ({
        category_id: Number(category_id),
        weight_num: Number(weight_num),
      })
    );

    const totalWeight = weightsArray.reduce((acc, w) => acc + w.weight_num, 0);
    if (totalWeight !== 100) {
      alert("La suma de todos los pesos debe ser 100%");
      return;
    }

    // LOGS DE DEPURACIÓN
    console.log("Weights state:", weights);
    console.log("Weights array a enviar:", weightsArray);
    console.log("Payload enviado:", {
      general_comments: generalComments,
      scores,
      weights: weightsArray,
    });

    try {
      await axios.post(
        `http://localhost:4000/api/evaluator/evaluation/${id}/submit`,
        {
          general_comments: generalComments,
          scores,
          weights: weightsArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Evaluación enviada correctamente");
      navigate("/evaluator");
    } catch (err) {
      console.error("Error al enviar evaluación:", err);
    }
  };

  if (!data) {
    return <p className="text-center text-gray-600">Cargando...</p>;
  }

  const groupedCriteria = data.criteria.reduce((acc, item, index) => {
    const category = item.category_name || "Sin categoría";
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...item, index });
    return acc;
  }, {});

  const calculateCategoryTotal = (items) => {
    const totalMax = items.length * 5;
    const totalScore = items.reduce((acc, item) => {
      const scoreValue = parseInt(scores[item.index]?.score);
      return acc + (isNaN(scoreValue) ? 0 : scoreValue);
    }, 0);
    const percentage =
      totalMax === 0 ? 0 : Math.round((totalScore / totalMax) * 100);
    return { totalScore, totalMax, percentage };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Evaluar Software #{data.evaluation.software_id}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-10">
        {Object.entries(groupedCriteria).map(([category, items]) => {
          const { totalScore, totalMax, percentage } =
            calculateCategoryTotal(items);
          const criteriaId = items[0]?.criteria_id;

          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {category}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {items[0]?.category_description || ""}
                  </p>
                  <p className="text-sm mt-1 font-medium text-gray-700">
                    Total: {totalScore} / {totalMax} ({percentage}%)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mr-2">Peso %:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    placeholder="Peso"
                    className="w-20 border rounded p-1 text-right"
                    value={weights[criteriaId] || ""}
                    onChange={(e) =>
                      handleWeightChange(criteriaId, e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border">Código</th>
                      <th className="px-3 py-2 border">Ítem</th>
                      <th className="px-3 py-2 border">Descripción</th>
                      <th className="px-3 py-2 border w-24">Valor</th>
                      <th className="px-3 py-2 border w-62">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.subcriteria_id} className="border-t">
                        <td className="px-3 py-2 border">{`${
                          item.criteria_id
                        }.${item.index + 1}`}</td>
                        <td className="px-3 py-2 border font-medium">
                          {item.subcriteria_name}
                        </td>
                        <td className="px-3 py-2 border">
                          {item.subcriteria_description}
                        </td>
                        <td className="px-3 py-2 border">
                          <select
                            required
                            value={scores[item.index].score}
                            onChange={(e) =>
                              handleScoreChange(
                                item.index,
                                "score",
                                e.target.value
                              )
                            }
                            className="w-full p-1 border rounded"
                          >
                            <option value="">--</option>
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 border">
                          <input
                            type="text"
                            placeholder="Observaciones"
                            value={scores[item.index].comment}
                            onChange={(e) =>
                              handleScoreChange(
                                item.index,
                                "comment",
                                e.target.value
                              )
                            }
                            className="w-full p-1 border rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        <div>
          <label className="block text-sm font-medium mb-1">
            Comentarios generales:
          </label>
          <textarea
            rows="4"
            value={generalComments}
            onChange={(e) => setGeneralComments(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Enviar evaluación
          </button>
        </div>
      </form>
    </div>
  );
}
