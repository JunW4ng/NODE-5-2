const { Pool } = require("pg");

//? Cambiar datos segun caso
const config = {
  user: "postgres",
  host: "127.0.0.1",
  password: "Junjie1995",
  database: "estudiantes",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);
const argumento = process.argv.slice(2);
const funcion = argumento[0];

//? Consulta formato JSON
const generarQuery = (name, rowMode, text, values) => ({
  name,
  rowMode,
  text,
  values,
});

//? Agrega nuevo estudiante
const agregarEstudiante = async () => {
  pool.connect(async (err_conexion, client, release) => {
    if (err_conexion) return console.error(err_conexion.code);

    const nombre = argumento[1];
    const rut = argumento[2];
    const curso = argumento[3];
    const nivel = argumento[4];
    const sqlQuery =
      "INSERT INTO estudiante (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4) RETURNING *;";
    const rowMode = "";
    const values = [nombre, rut, curso, nivel];

    try {
      const res = await client.query(
        generarQuery("agregar_estudiante", rowMode, sqlQuery, values)
      );
      console.log(`Estudiante ${nombre} agregado con exito:`, res.rows[0]);
    } catch (err_consulta) {
      console.error("Error al agregar, codigo:", err_consulta.code);
    }
    release();
    pool.end();
  });
};

//? Consulta por todos los alumnos registrados
const consultaTodos = async () => {
  pool.connect(async (err_conexion, client, release) => {
    if (err_conexion) return console.log(err_conexion.code);
    const sqlQuery = "SELECT * FROM estudiante";
    const rowMode = "array";
    const values = [];

    try {
      const res = await client.query(
        generarQuery("consulta_todos_alumnos", rowMode, sqlQuery, values)
      );
      console.log(res.rows);
    } catch (err_consulta) {
      console.error("Error en consulta, codigo:", err_consulta.code);
    }
    release();
    pool.end();
  });
};

//? Consulta alumno por RUT
const consultaRut = async () => {
  pool.connect(async (err_conexion, client, release) => {
    if (err_conexion) return console.error(err_conexion.code);

    const rut = argumento[1];
    const sqlQuery = "SELECT * FROM estudiante WHERE rut = $1";
    const rowMode = "";
    const values = [rut];

    try {
      const res = await client.query(
        generarQuery("busqueda_por_rut", rowMode, sqlQuery, values)
      );
      console.log(res.rows);
    } catch (err_consulta) {
      console.error("Error en consulta por rut, codigo:", err_consulta.code);
    }
    release();
    pool.end();
  });
};

//? Elimina alumno por RUT
const eliminarPorRut = async () => {
  pool.connect(async (err_conexion, client, release) => {
    if (err_conexion) return console.log(err_conexion.code);

    const rut = argumento[1];
    const sqlQuery = "DELETE FROM estudiante WHERE rut = $1 RETURNING *;";
    const rowMode = "";
    const values = [rut];

    try {
      await client.query(
        generarQuery("elimnar_estudiante", rowMode, sqlQuery, values)
      );
      console.log(`Registro de estudiante con rut ${rut} eliminado`);
    } catch (err_consulta) {
      console.error("Error al eliminar, codigo:", err_consulta.code);
    }
    release();
    pool.end();
  });
};

//? Ejecucion de funciones
if (funcion === "nuevo") {
  agregarEstudiante();
} else if (funcion === "consulta") {
  consultaTodos();
} else if (funcion === "rut") {
  consultaRut();
} else if (funcion === "eliminar") {
  eliminarPorRut();
} else {
  console.log("Error de comando");
}
