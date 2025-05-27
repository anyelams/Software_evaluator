import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash, FaListUl, FaEyeSlash } from "react-icons/fa";

export default function StandardsSection() {
  const { token } = useAuth();
  const [standards, setStandards] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [expandedStandardId, setExpandedStandardId] = useState(null);
  const [criteriaByStandard, setCriteriaByStandard] = useState({});
  const [subcriteriaMap, setSubcriteriaMap] = useState({});

  const fetchStandards = async () => {
    const res = await axios.get("http://localhost:4000/api/standards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStandards(res.data);
  };

  const fetchCriteriaAndSubcriteria = async (standardId) => {
    const res = await axios.get(
      `http://localhost:4000/api/criteria/standard/${standardId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const criteriaList = res.data;
    const subMap = {};

    for (const criterio of criteriaList) {
      const subRes = await axios.get(
        `http://localhost:4000/api/subcriteria/criteria/${criterio.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      subMap[criterio.id] = subRes.data;
    }

    setCriteriaByStandard((prev) => ({ ...prev, [standardId]: criteriaList }));
    setSubcriteriaMap((prev) => ({ ...prev, ...subMap }));
  };

  const toggleCriteria = (standardId) => {
    const isOpen = expandedStandardId === standardId;
    setExpandedStandardId(isOpen ? null : standardId);

    if (!isOpen && !criteriaByStandard[standardId]) {
      fetchCriteriaAndSubcriteria(standardId);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `http://localhost:4000/api/standards/${editingId}`
        : `http://localhost:4000/api/standards`;
      const method = editingId ? "put" : "post";

      await axios[method](url, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({ name: "", description: "" });
      setEditingId(null);
      fetchStandards();
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleEdit = (standard) => {
    setForm({ name: standard.name, description: standard.description });
    setEditingId(standard.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/api/standards/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchStandards();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h3 className="text-2xl font-bold mb-4 text-center">
        Gestión de Normas ISO
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Descripción</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {standards.map((s) => (
              <React.Fragment key={s.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{s.id}</td>
                  <td className="px-4 py-2 border">{s.name}</td>
                  <td className="px-4 py-2 border">{s.description}</td>
                  <td className="px-4 py-2 border space-x-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-3 py-2 text-xs bg-amber-400 text-white rounded hover:bg-amber-500 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => toggleCriteria(s.id)}
                      className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    >
                      {expandedStandardId === s.id ? (
                        <FaEyeSlash />
                      ) : (
                        <FaListUl />
                      )}
                    </button>
                  </td>
                </tr>

                {expandedStandardId === s.id && criteriaByStandard[s.id] && (
                  <tr>
                    <td colSpan="4" className="p-4 bg-gray-50 border-t text-sm">
                      {criteriaByStandard[s.id].length === 0 ? (
                        <p>No hay criterios registrados.</p>
                      ) : (
                        <div className="space-y-6">
                          {criteriaByStandard[s.id].map((c) => (
                            <div
                              key={c.id}
                              className="border rounded-lg shadow p-4 bg-white"
                            >
                              <h4 className="text-base font-semibold text-gray-800 mb-2">
                                {c.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                {c.description}
                              </p>

                              {subcriteriaMap[c.id] && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border border-gray-300">
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
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subcriteriaMap[c.id].length > 0 ? (
                                        subcriteriaMap[c.id].map(
                                          (sc, index) => (
                                            <tr
                                              key={sc.id}
                                              className="border-t"
                                            >
                                              <td className="px-3 py-2 border border-gray-300">{`${
                                                c.id
                                              }.${index + 1}`}</td>
                                              <td className="px-3 py-2 border border-gray-300 font-semibold">
                                                {sc.name}
                                              </td>
                                              <td className="px-3 py-2 border border-gray-300">
                                                {sc.description}
                                              </td>
                                            </tr>
                                          )
                                        )
                                      ) : (
                                        <tr>
                                          <td
                                            colSpan="3"
                                            className="italic text-gray-400 px-3 py-2"
                                          >
                                            (Sin subcriterios)
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
