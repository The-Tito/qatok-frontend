# Prototipo (referencia visual)

Copia del código de cada pantalla del lienzo de diseño (24 nov 2026). Son especificaciones: no se importan ni se ejecutan en la app. Cómo leerlos: [../README.md](../README.md#cómo-leer-el-prototipo).

| Archivo | Pantalla (02-pantallas.md) |
|---|---|
| `Main.dc.html` | Sistema visual |
| `Login.dc.html` | 1 · Entrar |
| `Catalogo.dc.html` | 2 · Catálogo |
| `Simulacion.dc.html` | 3 · Antes de jugar |
| `JugarCorreo.dc.html` | 4 · Jugar, paso de correo |
| `Decision.dc.html` | 5 · Jugar, resultado de la decisión |
| `JugarConversacion.dc.html` | 6 · Jugar, paso de conversación |
| `Resultado.dc.html` | 7 · Jugar, completada |
| `Perfil.dc.html` | 8 · Perfil |
| `Registro.dc.html` | 9 · Crear cuenta |
| `Evidencias.dc.html` | 10 · Evidencias |
| `EvidenciaDetalle.dc.html` | 11 · Evidencia y enlaces |
| `Compartir.dc.html` | 12 · Crear enlace |
| `Publica.dc.html` | 13 · Evidencia pública |
| `Estados.dc.html` | 14 · Estados y errores |
| `AdminSimulaciones.dc.html` | A1 · Simulaciones |
| `AdminEditor.dc.html` | A2 · Editor de escenario |
| `AdminHabilidades.dc.html` | A3 · Habilidades |

Los pasos de reunión, tarea e incidente no tienen pantalla propia: se describen en 02 (vista paso) y usan los mismos componentes que el paso de correo.

Diferencias conocidas entre el prototipo y la especificación (manda 02):

- Admin › Habilidades muestra «En uso» en la tabla; la API no informa ese dato, así que la app muestra «Eliminar» y maneja `409 SKILL_IN_USE`.
- «Tu nivel» en Antes de jugar y la lista «Tus decisiones» en Completada dependen de datos que pueden faltar; 02 indica qué mostrar en ese caso.
