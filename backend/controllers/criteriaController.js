const pool = require("../db/pool");

const createCriteria = async (req, res) => {
  const { standard_id, name, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO criteria (standard_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [standard_id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear criterio:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const getCriteriaByStandard = async (req, res) => {
  const { standardId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM criteria WHERE standard_id = $1 ORDER BY id ASC",
      [standardId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener criterios:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const updateCriteria = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE criteria SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar criterio:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

const deleteCriteria = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM criteria WHERE id = $1", [id]);
    res.json({ message: "Criterio eliminado" });
  } catch (error) {
    console.error("Error al eliminar criterio:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  createCriteria,
  getCriteriaByStandard,
  updateCriteria,
  deleteCriteria,
};
