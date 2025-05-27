const pool = require("../db/pool");

// Crear norma
const createStandard = async (req, res) => {
  const { name, description } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO standards (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear norma:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Obtener todas las normas
const getAllStandards = async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM standards ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener normas:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Obtener norma por ID
const getStandardById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM standards WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Norma no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Actualizar norma
const updateStandard = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE standards SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Eliminar norma
const deleteStandard = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM standards WHERE id = $1", [id]);
    res.json({ message: "Norma eliminada" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  createStandard,
  getAllStandards,
  getStandardById,
  updateStandard,
  deleteStandard,
};
