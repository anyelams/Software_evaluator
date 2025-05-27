const pool = require("../db/pool");

// Obtener evaluaciones asignadas al evaluador
const getMyEvaluations = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT e.*, s.name AS software_name, c.name AS company_name, st.name AS standard_name
      FROM evaluations e
      JOIN softwares s ON e.software_id = s.id
      JOIN companies c ON s.company_id = c.id
      JOIN standards st ON e.standard_id = st.id
      WHERE evaluator_id = $1
      ORDER BY e.evaluation_date DESC
    `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Obtener criterios y subcriterios de una evaluación
const getEvaluationDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const evalResult = await pool.query(
      "SELECT * FROM evaluations WHERE id = $1",
      [id]
    );
    if (evalResult.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    const standardId = evalResult.rows[0].standard_id;

    const criteriaResult = await pool.query(
      `
      SELECT 
        cr.id AS criteria_id,
        cr.name AS category_name,
        cr.description AS category_description,
        sc.id AS subcriteria_id,
        sc.criteria_id,
        sc.name AS subcriteria_name,
        sc.description AS subcriteria_description
      FROM criteria cr
      JOIN subcriteria sc ON cr.id = sc.criteria_id
      WHERE cr.standard_id = $1
      ORDER BY cr.id, sc.id;
      `,
      [standardId]
    );

    res.json({
      evaluation: evalResult.rows[0],
      criteria: criteriaResult.rows,
    });
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Enviar evaluación con puntajes por subcriterio y pesos por categoría
const submitEvaluation = async (req, res) => {
  const { id } = req.params;
  const { scores, general_comments, weights } = req.body;

  console.log("📩 Payload recibido:");
  console.log("scores:", scores);
  console.log("weights:", weights);

  if (!Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({ message: "Faltan puntuaciones" });
  }

  if (!Array.isArray(weights) || weights.length === 0) {
    return res.status(400).json({ message: "Faltan pesos por categoría" });
  }

  const totalWeight = weights.reduce((acc, w) => acc + Number(w.weight_num), 0);
  if (totalWeight !== 100) {
    return res
      .status(400)
      .json({ message: "La suma de los pesos debe ser 100%" });
  }

  try {
    await pool.query("BEGIN");

    for (const { subcriteria_id, score, comment } of scores) {
      await pool.query(
        `INSERT INTO evaluation_scores (evaluation_id, subcriteria_id, score, comment)
         VALUES ($1, $2, $3, $4)`,
        [id, subcriteria_id, score, comment || null]
      );
    }

    for (const { category_id, weight_num } of weights) {
      console.log("💾 Guardando peso:", { category_id, weight_num });
      await pool.query(
        `INSERT INTO evaluation_category_weights (evaluation_id, category_id, weight_num)
         VALUES ($1, $2, $3)`,
        [id, category_id, weight_num]
      );
    }

    await pool.query(
      `UPDATE evaluations
       SET status = 'completed', general_comments = $1
       WHERE id = $2`,
      [general_comments || null, id]
    );

    await pool.query("COMMIT");
    console.log("✅ Evaluación guardada correctamente con pesos");
    res.json({ message: "Evaluación enviada correctamente" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("❌ Error al enviar evaluación:", error);
    res.status(500).json({ message: "Error interno al guardar la evaluación" });
  }
};

// Ver resumen de evaluación (evaluador)
const getEvaluationSummary = async (req, res) => {
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

    console.log("🧮 Resumen completo:", {
      total_score,
      total_max,
      percentage: roundedPct,
      value,
      label: ["No cumple", "Muy bajo", "Bajo", "Regular", "Bueno", "Excelente"][
        value
      ],
    });

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
    console.error("Error al obtener resumen:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Descargar datos de evaluación (evaluador)
const downloadEvaluationReport = async (req, res) => {
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
      SELECT cr.name AS criteria_name, sc.name AS subcriteria_name, es.score, es.comment
      FROM evaluation_scores es
      JOIN subcriteria sc ON sc.id = es.subcriteria_id
      JOIN criteria cr ON cr.id = sc.criteria_id
      WHERE es.evaluation_id = $1
      ORDER BY cr.id, sc.id
    `,
      [id]
    );

    res.json({
      evaluation: evalRes.rows[0],
      scores: scoresRes.rows,
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// Ver evaluación completa (admin)
const getEvaluationFullDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const evalRes = await pool.query(
      `
      SELECT 
        cr.id AS criteria_id,
        cr.name AS category_name,
        cr.description AS category_description,
        sc.id AS subcriteria_id,
        sc.criteria_id,
        sc.name AS subcriteria_name,
        sc.description AS subcriteria_description
      FROM criteria cr
      JOIN subcriteria sc ON cr.id = sc.criteria_id
      WHERE cr.standard_id = $1
      ORDER BY cr.id, sc.id;
    `,
      [id]
    );

    if (evalRes.rows.length === 0) {
      return res.status(404).json({ message: "Evaluación no encontrada" });
    }

    const scoresRes = await pool.query(
      `
      SELECT cr.name AS criteria_name, sc.name AS subcriteria_name, es.score, es.comment
      FROM evaluation_scores es
      JOIN subcriteria sc ON sc.id = es.subcriteria_id
      JOIN criteria cr ON cr.id = sc.criteria_id
      WHERE es.evaluation_id = $1
      ORDER BY cr.id, sc.id
    `,
      [id]
    );

    res.json({
      evaluation: evalRes.rows[0],
      scores: scoresRes.rows,
    });
  } catch (error) {
    console.error("Error al obtener detalles completos:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  getMyEvaluations,
  getEvaluationDetails,
  submitEvaluation,
  getEvaluationSummary,
  downloadEvaluationReport,
  getEvaluationFullDetails,
};
