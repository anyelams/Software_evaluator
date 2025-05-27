import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AssignmentSection() {
  const { token } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [softwares, setSoftwares] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [standards, setStandards] = useState([]);

  const [form, setForm] = useState({
    software_id: "",
    evaluator_id: "",
    standard_id: "",
    general_comments: "",
  });

  useEffect(() => {
    const fetchAll = async () => {
      const [companyRes, evalRes, stdRes] = await Promise.all([
        axios.get("http://localhost:4000/api/companies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:4000/api/users?role=evaluator", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:4000/api/standards", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCompanies(companyRes.data);
      setEvaluators(evalRes.data);
      setStandards(stdRes.data);
    };

    fetchAll();
  }, [token]);

  useEffect(() => {
    if (selectedCompanyId) {
      axios
        .get(
          `http://localhost:4000/api/softwares/company/${selectedCompanyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => setSoftwares(res.data));
    } else {
      setSoftwares([]);
    }
  }, [selectedCompanyId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/evaluations", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Evaluación asignada correctamente");
      setForm({
        software_id: "",
        evaluator_id: "",
        standard_id: "",
        general_comments: "",
      });
    } catch (error) {
      console.error("Error al asignar:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4 text-center">Asignar Evaluación</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Empresa</label>
          <select
            required
            value={selectedCompanyId || ""}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Selecciona empresa</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Software</label>
          <select
            required
            value={form.software_id}
            onChange={(e) => setForm({ ...form, software_id: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Selecciona software</option>
            {softwares.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Evaluador</label>
          <select
            required
            value={form.evaluator_id}
            onChange={(e) => setForm({ ...form, evaluator_id: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Selecciona evaluador</option>
            {evaluators.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} - {e.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Norma ISO</label>
          <select
            required
            value={form.standard_id}
            onChange={(e) => setForm({ ...form, standard_id: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Selecciona norma</option>
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Comentarios generales
          </label>
          <input
            type="text"
            placeholder="Opcional"
            value={form.general_comments}
            onChange={(e) =>
              setForm({ ...form, general_comments: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Asignar Evaluación
        </button>
      </form>
    </div>
  );
}
