const pool = require("../db/pool");

const createSoftware = async (req, res) => {
  const { company_id, name, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO softwares (company_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [company_id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear software:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const getSoftwaresByCompany = async (req, res) => {
  const { companyId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM softwares WHERE company_id = $1 ORDER BY id",
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener software:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const updateSoftware = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE softwares SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar software:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const deleteSoftware = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM softwares WHERE id = $1", [id]);
    res.json({ message: "Software eliminado" });
  } catch (error) {
    console.error("Error al eliminar software:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  createSoftware,
  getSoftwaresByCompany,
  updateSoftware,
  deleteSoftware,
};
