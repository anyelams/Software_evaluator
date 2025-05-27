const pool = require("../db/pool");

// Crear evaluación asignada
const assignEvaluation = async (req, res) => {
  const { software_id, evaluator_id, standard_id, general_comments } = req.body;

  if (!software_id || !evaluator_id || !standard_id) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO evaluations (software_id, evaluator_id, standard_id, general_comments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [software_id, evaluator_id, standard_id, general_comments || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al asignar evaluación:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Obtener todas las evaluaciones (admin)
const getAllEvaluations = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.status,
        e.evaluation_date,
        s.name AS software_name,
        c.name AS company_name,
        st.name AS standard_name,
        u.name AS evaluator_name
      FROM evaluations e
      LEFT JOIN users u ON e.evaluator_id = u.id
      LEFT JOIN softwares s ON e.software_id = s.id
      LEFT JOIN companies c ON s.company_id = c.id
      LEFT JOIN standards st ON e.standard_id = st.id
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Obtener evaluación por ID (admin)
const getEvaluationById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM evaluations WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Ver evaluación completa (admin)
const getEvaluationFullDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const evalRes = await pool.query(
      `
      SELECT e.*, u.name AS evaluator_name, u.email, s.name AS software_name, s.description AS software_description,
             c.name AS company_name, st.name AS standard_name
      FROM evaluations e
      JOIN users u ON u.id = e.evaluator_id
      JOIN softwares s ON s.id = e.software_id
      JOIN companies c ON c.id = s.company_id
      JOIN standards st ON st.id = e.standard_id
      WHERE e.id = $1
      `,
      [id]
    );

    if (evalRes.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    const scoresRes = await pool.query(
      `
      SELECT 
        cr.id AS criteria_id,
        cr.name AS criteria_name,
        sc.id AS subcriteria_id,
        sc.criteria_id, 
        sc.name AS subcriteria_name,
        es.score,
        es.comment
      FROM evaluation_scores es
      JOIN subcriteria sc ON sc.id = es.subcriteria_id
      JOIN criteria cr ON cr.id = sc.criteria_id
      WHERE es.evaluation_id = $1
      ORDER BY cr.id, sc.id
      `,
      [id]
    );

    const weightsRes = await pool.query(
      `
      SELECT category_id, weight_num
      FROM evaluation_category_weights
      WHERE evaluation_id = $1
      `,
      [id]
    );

    const scores = scoresRes.rows;
    const weights = weightsRes.rows;

    // Agrupar scores por criteria_id
    const groupedScores = {};
    for (const s of scores) {
      if (!groupedScores[s.criteria_id]) groupedScores[s.criteria_id] = [];
      groupedScores[s.criteria_id].push(s);
    }

    // Calcular porcentaje global ponderado + total puntos
    let globalPct = 0;
    let total_score = 0;
    let total_max = 0;

    for (const { category_id, weight_num } of weights) {
      const items = groupedScores[category_id] || [];
      const sum = items.reduce((acc, s) => acc + s.score, 0);
      const max = items.length * 5;

      total_score += sum;
      total_max += max;

      const pct = max > 0 ? (sum / max) * 100 : 0;
      globalPct += (pct * weight_num) / 100;
    }

    const roundedPct = Math.round(globalPct * 100) / 100;

    // Mapear porcentaje a calificación 0–5
    const calcEvalValue = (pct) => {
      if (pct <= 16) return 0;
      if (pct <= 32) return 1;
      if (pct <= 48) return 2;
      if (pct <= 64) return 3;
      if (pct <= 80) return 4;
      return 5;
    };

    const value = calcEvalValue(roundedPct);

    return res.json({
      evaluation: evalRes.rows[0],
      scores,
      weights,
      summary: {
        total_score,
        total_max,
        percentage: roundedPct,
        value,
        label: [
          "No cumple",
          "Muy bajo",
          "Bajo",
          "Regular",
          "Bueno",
          "Excelente",
        ][value],
      },
    });
  } catch (error) {
    console.error("Error al obtener detalles completos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  assignEvaluation,
  getAllEvaluations,
  getEvaluationById,
  getEvaluationFullDetails,
};
