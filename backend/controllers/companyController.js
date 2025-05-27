const pool = require("../db/pool");

const createCompany = async (req, res) => {
  const { name, nit, address, phone } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO companies (name, nit, address, phone) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, nit, address, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear empresa:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const getCompanies = async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companies ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, nit, address, phone } = req.body;
  try {
    const result = await pool.query(
      "UPDATE companies SET name = $1, nit = $2, address = $3, phone = $4 WHERE id = $5 RETURNING *",
      [name, nit, address, phone, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM companies WHERE id = $1", [id]);
    res.json({ message: "Empresa eliminada" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
};
