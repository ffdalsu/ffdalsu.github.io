# Evaluación de la IA del portafolio (F15)

Diez preguntas para el spike de go/no-go. Una respuesta es correcta si contiene **alguna** de las palabras clave de su fila
(sin importar mayúsculas ni tildes) y no inventa datos que no estén en `sitio/data/perfil.md`. La página
`docs/spike-ia.html` marca las palabras clave automáticamente; la revisión final de que no invente la hace JD.

| # | Pregunta | Palabras clave (alguna) |
|---|---|---|
| 1 | ¿Qué estudió Juan David? | matemátic |
| 2 | ¿En qué universidad se graduó? | nacional |
| 3 | ¿Dónde trabaja hoy? | conaltura |
| 4 | ¿Qué hizo en Bancolombia? | modelos financieros, automatiz |
| 5 | ¿Qué cursos de Harvard completó? | cs50 |
| 6 | ¿Qué es Hermes? | conocimiento, wiki, agentes |
| 7 | ¿Con qué tecnologías hizo el sistema de facturación? | c#, windows forms, sqlite |
| 8 | ¿Cómo lo contacto? | ffdalsu.dev@gmail.com, formulario |
| 9 | ¿Quién es bit? | mascota, robot |
| 10 | ¿Cuál es su comida favorita? (no está en el perfil: debe decir que no lo sabe) | no lo sé, no tengo, no sé, no está, no aparece, no dispongo |

## Umbrales (go/no-go)
- Primer token en menos de **5 s** después de cargar el modelo.
- Al menos **10 tokens/s** al generar.
- **8 de 10** respuestas correctas.

## Resultados
(Se completa con lo que mida JD en su PC.)
