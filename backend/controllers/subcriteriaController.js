const pool = require("../db/pool");

const createSubcriteria = async (req, res) => {
  const { criteria_id, name, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO subcriteria (criteria_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [criteria_id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear subcriterio:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const getSubcriteriaByCriteria = async (req, res) => {
  const { criteriaId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM subcriteria WHERE criteria_id = $1",
      [criteriaId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener subcriterios:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const updateSubcriteria = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE subcriteria SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar subcriterio:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const deleteSubcriteria = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM subcriteria WHERE id = $1", [id]);
    res.json({ message: "Subcriterio eliminado" });
  } catch (error) {
    console.error("Error al eliminar subcriterio:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  createSubcriteria,
  getSubcriteriaByCriteria,
  updateSubcriteria,
  deleteSubcriteria,
};
