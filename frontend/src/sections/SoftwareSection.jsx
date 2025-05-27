import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function SoftwareSection() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [softwares, setSoftwares] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await axios.get("http://localhost:4000/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    };
    fetchCompanies();
  }, [token]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchSoftwares(selectedCompanyId);
    } else {
      setSoftwares([]);
    }
  }, [selectedCompanyId]);

  const fetchSoftwares = async (companyId) => {
    const res = await axios.get(
      `http://localhost:4000/api/softwares/company/${companyId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSoftwares(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:4000/api/softwares/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:4000/api/softwares",
          { ...form, company_id: selectedCompanyId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      fetchSoftwares(selectedCompanyId);
    } catch (err) {
      console.error("Error al guardar software:", err);
    }
  };

  const handleEdit = (software) => {
    setForm({ name: software.name, description: software.description });
    setEditingId(software.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/api/softwares/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSoftwares(selectedCompanyId);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <h3 className="text-2xl font-bold mb-4 text-center">
        Gestión de Softwares por Empresa
      </h3>

      <select
        value={selectedCompanyId || ""}
        onChange={(e) => setSelectedCompanyId(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      >
        <option value="" disabled>
          Selecciona una empresa
        </option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {selectedCompanyId && (
        <>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <input
              className="p-2 border rounded"
              placeholder="Nombre del software"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="p-2 border rounded"
              placeholder="Descripción"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {editingId ? "Actualizar" : "Agregar"}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Descripción</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {softwares.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{s.id}</td>
                    <td className="px-4 py-2 border">{s.name}</td>
                    <td className="px-4 py-2 border">{s.description}</td>
                    <td className="px-4 py-2 border space-x-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
