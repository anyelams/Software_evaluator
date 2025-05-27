import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CompaniesSection() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    nit: "",
    address: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    } catch (err) {
      console.error("Error al obtener empresas:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:4000/api/companies/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:4000/api/companies", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ name: "", nit: "", address: "", phone: "" });
      setEditingId(null);
      fetchCompanies();
    } catch (err) {
      console.error("Error al guardar empresa:", err);
    }
  };

  const handleEdit = (company) => {
    setForm(company);
    setEditingId(company.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/api/companies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCompanies();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <h3 className="text-2xl font-bold mb-4 text-center">
        Gestión de Empresas
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <input
          className="p-2 border rounded"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="p-2 border rounded"
          placeholder="NIT"
          value={form.nit}
          onChange={(e) => setForm({ ...form, nit: e.target.value })}
          required
        />
        <input
          className="p-2 border rounded"
          placeholder="Dirección"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
        <input
          className="p-2 border rounded"
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Nombre</th>
              <th className="border px-4 py-2">NIT</th>
              <th className="border px-4 py-2">Dirección</th>
              <th className="border px-4 py-2">Teléfono</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{c.id}</td>
                <td className="border px-4 py-2">{c.name}</td>
                <td className="border px-4 py-2">{c.nit}</td>
                <td className="border px-4 py-2">{c.address}</td>
                <td className="border px-4 py-2">{c.phone}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
    </div>
  );
}
