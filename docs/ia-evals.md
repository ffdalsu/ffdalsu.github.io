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

### 2026-10-15 · Qwen2.5-1.5B-Instruct-q4f16_1-MLC (Chrome, PC de JD) → NO-GO
- Automático: 9/10 · peor primer token 23,68 s · 5,9 tokens/s en promedio.
- Revisión a mano: 7/10. La 1 inventa «Ingeniería en Matemáticas»; la 3 responde en primera persona sobre otro
  proyecto en vez de decir Conaltura.
- Falla por velocidad (la mitad de lo exigido) y por inventar datos. Siguiente: medir Llama-3.2-1B .

### 2026-10-15 · Llama-3.2-1B-Instruct-q4f16_1-MLC → NO-GO
- 3/10 · peor primer token 19,49 s · 9,0 tokens/s. Ignora el perfil (dice no saber dónde trabaja ni qué es bit) e
  inventa que Hermes es un sistema de facturación. Descartado por calidad.
- Siguiente: gemma-4-E2B-it (WebLLM 0.2.86, ~3,4 GB de VRAM).

### 2026-10-15 · gemma-4-E2B-it-q4f16_1-MLC → no se midió
- Demasiado pesado para el PC de JD (~3,4 GB de VRAM y descarga). **Veredicto final: NO-GO, F15 descartada (D34).**
