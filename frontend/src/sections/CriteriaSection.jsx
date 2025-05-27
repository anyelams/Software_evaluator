import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash, FaListUl, FaEyeSlash } from "react-icons/fa";

export default function CriteriaSection() {
  const { token } = useAuth();
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState("");
  const [criteriaList, setCriteriaList] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [subForm, setSubForm] = useState({
    criteria_id: null,
    name: "",
    description: "",
    id: null,
  });
  const [subcriteriaVisible, setSubcriteriaVisible] = useState({});
  const [subcriteriaMap, setSubcriteriaMap] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/standards", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStandards(res.data));
  }, [token]);

  useEffect(() => {
    if (selectedStandard) fetchCriteria();
    else setCriteriaList([]);
  }, [selectedStandard, token]);

  const fetchCriteria = async () => {
    const res = await axios.get(
      `http://localhost:4000/api/criteria/standard/${selectedStandard}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setCriteriaList(res.data);
  };

  const handleCriteriaSubmit = async (e) => {
    e.preventDefault();
    const confirmMessage = editingId
      ? "¿Deseas actualizar este criterio?"
      : "¿Deseas crear este criterio?";
    if (!window.confirm(confirmMessage)) return;

    const url = editingId
      ? `http://localhost:4000/api/criteria/${editingId}`
      : "http://localhost:4000/api/criteria";
    const method = editingId ? "put" : "post";

    await axios[method](
      url,
      {
        standard_id: selectedStandard,
        name: form.name,
        description: form.description,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setForm({ name: "", description: "" });
    setEditingId(null);
    await fetchCriteria();
  };

  const handleEdit = (c) =>
    setForm({ name: c.name, description: c.description }) || setEditingId(c.id);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este criterio?")) return;
    await axios.delete(`http://localhost:4000/api/criteria/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchCriteria();
  };

  const toggleSubcriteria = async (criteriaId) => {
    const visible = !subcriteriaVisible[criteriaId];
    setSubcriteriaVisible((prev) => ({ ...prev, [criteriaId]: visible }));

    if (visible && !subcriteriaMap[criteriaId]) {
      const res = await axios.get(
        `http://localhost:4000/api/subcriteria/criteria/${criteriaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubcriteriaMap((prev) => ({ ...prev, [criteriaId]: res.data }));
    }
  };

  const handleSubcriteriaSubmit = async (e, criteriaId) => {
    e.preventDefault();
    const confirmMessage = subForm.id
      ? "¿Deseas actualizar este subcriterio?"
      : "¿Deseas agregar este subcriterio?";
    if (!window.confirm(confirmMessage)) return;

    const { id, name, description } = subForm;
    const method = id ? "put" : "post";
    const url = id
      ? `http://localhost:4000/api/subcriteria/${id}`
      : "http://localhost:4000/api/subcriteria";

    await axios[method](
      url,
      { criteria_id: criteriaId, name, description },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setSubForm({ criteria_id: null, name: "", description: "", id: null });

    const res = await axios.get(
      `http://localhost:4000/api/subcriteria/criteria/${criteriaId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setSubcriteriaMap((prev) => ({ ...prev, [criteriaId]: res.data }));
  };

  const handleDeleteSubcriteria = async (id, criteriaId) => {
    if (!window.confirm("¿Deseas eliminar este subcriterio?")) return;
    await axios.delete(`http://localhost:4000/api/subcriteria/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await axios.get(
      `http://localhost:4000/api/subcriteria/criteria/${criteriaId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setSubcriteriaMap((prev) => ({ ...prev, [criteriaId]: res.data }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Gestión de Criterios y Subcriterios
      </h2>

      <select
        className="w-full p-3 border rounded mb-6"
        value={selectedStandard}
        onChange={(e) => setSelectedStandard(e.target.value)}
      >
        <option value="">Selecciona una norma</option>
        {standards.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {selectedStandard && (
        <>
          <form
            onSubmit={handleCriteriaSubmit}
            className="flex flex-col md:flex-row gap-4 items-start mb-6"
          >
            <input
              type="text"
              placeholder="Nombre del criterio"
              className="flex-1 p-2 border rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Descripción"
              className="flex-1 p-2 border rounded"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingId ? "Actualizar" : "Crear"}
            </button>
          </form>

          <div className="space-y-6">
            {criteriaList.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg shadow-md p-5 bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {c.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-3 py-2 text-xs bg-amber-400 text-white rounded hover:bg-amber-500 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => toggleSubcriteria(c.id)}
                      className="px-3 py-2 text-xs bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                    >
                      {subcriteriaVisible[c.id] ? <FaEyeSlash /> : <FaListUl />}
                    </button>
                  </div>
                </div>

                {subcriteriaVisible[c.id] && (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm border border-gray-300 rounded">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 border border-gray-300 text-left">
                            Código
                          </th>
                          <th className="px-3 py-2 border border-gray-300 text-left">
                            Ítem
                          </th>
                          <th className="px-3 py-2 border border-gray-300 text-left">
                            Descripción
                          </th>
                          <th className="px-3 py-2 border border-gray-300 text-left">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subcriteriaMap[c.id]?.map((sc, index) => (
                          <tr key={sc.id} className="border-t">
                            <td className="px-3 py-2 border border-gray-300">{`${
                              c.id
                            }.${index + 1}`}</td>
                            <td className="px-3 py-2 border border-gray-300 font-semibold">
                              {sc.name}
                            </td>
                            <td className="px-3 py-2 border border-gray-300">
                              {sc.description}
                            </td>
                            <td className="px-3 py-2 border border-gray-300">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setSubForm({
                                      criteria_id: c.id,
                                      name: sc.name,
                                      description: sc.description,
                                      id: sc.id,
                                    })
                                  }
                                  className="px-3 py-2 text-xs bg-amber-300 text-white rounded hover:bg-amber-400 transition"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubcriteria(sc.id, c.id)
                                  }
                                  className="px-3 py-2 text-xs bg-red-400 text-white rounded hover:bg-red-500 transition"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <form
                      onSubmit={(e) => handleSubcriteriaSubmit(e, c.id)}
                      className="flex flex-col md:flex-row gap-2 items-start mt-4"
                    >
                      <input
                        type="text"
                        placeholder="Nombre del subcriterio"
                        className="flex-1 p-2 border rounded"
                        value={subForm.criteria_id === c.id ? subForm.name : ""}
                        onChange={(e) =>
                          setSubForm({
                            ...subForm,
                            criteria_id: c.id,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Descripción"
                        className="flex-1 p-2 border rounded"
                        value={
                          subForm.criteria_id === c.id
                            ? subForm.description
                            : ""
                        }
                        onChange={(e) =>
                          setSubForm({
                            ...subForm,
                            criteria_id: c.id,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {subForm.id && subForm.criteria_id === c.id
                          ? "Actualizar"
                          : "Agregar"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
