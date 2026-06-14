# Guia de Validacion con Usuarios

> **Version:** 1.0.0  
> **Fecha:** Junio 2026  
> **Proposito:** Checklist y preguntas para sesion de validacion con reclutadores

---

## Preparacion

- [ ] App deployada en Vercel (ultimo build exitoso)
- [ ] n8n funcionando con Cloudflare Tunnel
- [ ] 2 vacantes de ejemplo creadas (1 publicada, 1 en borrador)
- [ ] 3 candidatos de prueba con CVs variados (junior, senior, perfil no match)
- [ ] 1 entrevista agendada
- [ ] Dispositivo con sesion de reclutador iniciada
- [ ] Dispositivo secundario o ventana de incognito para postulacion
- [ ] Bandeja de correo lista para mostrar notificaciones (cesarvelasquez150814@gmail.com)
- [ ] Cronometro para medir tiempos

---

## Instrucciones para el facilitador

1. Explicar el proposito de la sesion: "Vamos a probar la plataforma juntos. No hay respuestas correctas o incorrectas. Queremos entender si el flujo tiene sentido y si las funcionalidades resuelven problemas reales."
2. Pedir al usuario que piense en voz alta mientras navega
3. No ayudar al usuario a menos que este bloqueado por mas de 30 segundos
4. Tomar notas de cada observacion, confusión o sugerencia

---

## Flujo de validacion

### 1. Landing page y registro

| Paso | Accion del usuario | Observar |
|------|--------------------|----------|
| 1.1 | Abrir la URL de la aplicacion | ¿Entiende que es la plataforma? ¿El hero es claro? |
| 1.2 | Navegar por la landing | ¿Encuentra las vacantes publicadas facilmente? |
| 1.3 | Ir a `/login` | ¿Encuentra el boton de login? |
| 1.4 | Registrarse como nuevo usuario | ¿El formulario de registro es claro? ¿Entiende que necesita nombre + email + password? |
| 1.5 | Confirmar registro | ¿La pantalla de confirmacion es util? |

Preguntas:
- ¿Que esperabas encontrar al abrir la pagina?
- ¿El mensaje principal te dice claramente que hace la plataforma?
- ¿Fue facil encontrar como registrarte?

---

### 2. Dashboard

| Paso | Accion | Observar |
|------|--------|----------|
| 2.1 | Ver dashboard post-login | ¿Las metricas son utiles? ¿Entiende cada KPI? |
| 2.2 | Leer los números | ¿Los labels son claros? ("Vacantes activas", "Candidatos", etc.) |
| 2.3 | Ver grafico de etapas | ¿Entiende la distribucion? |
| 2.4 | Ver tabla de candidatos recientes | ¿La informacion mostrada es suficiente? |

Preguntas:
- ¿Que informacion te gustaria ver aqui que no aparece?
- ¿Las tarjetas de KPIs te dan una buena vision general?
- ¿El grafico de etapas refleja como trabajas?

---

### 3. Gestion de vacantes

| Paso | Accion | Observar |
|------|--------|----------|
| 3.1 | Ir a "Vacantes" | ¿La lista es clara? |
| 3.2 | Crear nueva vacante | ¿El formulario tiene todos los campos necesarios? |
| 3.3 | Publicar la vacante | ¿Entiende los estados (borrador/publicada/cerrada)? |
| 3.4 | Ver detalle de vacante | ¿La informacion es completa? |
| 3.5 | Usar "Compartir enlace" | ¿Entiende que es un enlace publico para candidatos? |

Preguntas:
- ¿Que campos agregarias o quitarias del formulario de vacante?
- ¿El boton de compartir enlace es intuitivo?
- ¿Te gustaria poder editar mas campos despues de publicar?

---

### 4. Candidatos y analisis IA

| Paso | Accion | Observar |
|------|--------|----------|
| 4.1 | Ir a candidatos de una vacante | ¿La lista es clara? ¿Entiende los scores? |
| 4.2 | Subir un CV (nuevo candidato) | ¿El formulario de subida es intuitivo? ¿El feedback de carga es claro? |
| 4.3 | Esperar el analisis | ¿La espera se siente razonable? ¿Hay feedback visual? |
| 4.4 | Ver resultado del analisis | ¿Entiende el score, resumen, seniority, sugerencias? |
| 4.5 | Cambiar etapa del candidato | ¿El pipeline de 7 etapas tiene sentido? |
| 4.6 | Ver detalle completo del candidato | ¿La informacion es suficiente para tomar una decision? |

Preguntas:
- ¿El score numerico te parece util para comparar candidatos?
- ¿El resumen generado por IA captura lo importante del CV?
- ¿Las sugerencias te ayudarian a preparar una entrevista?
- ¿El nivel de riesgo detectado coincide con tu evaluacion?
- ¿Falta alguna etapa en el pipeline?

---

### 5. Entrevistas

| Paso | Accion | Observar |
|------|--------|----------|
| 5.1 | Ir a "Entrevistas" | ¿La lista es clara? |
| 5.2 | Agendar nueva entrevista | ¿El formulario es completo? |
| 5.3 | Ver entrevista agendada | ¿La informacion es suficiente? |
| 5.4 | Completar/cancelar entrevista | ¿Las acciones son claras? |

Preguntas:
- ¿Que informacion adicional te gustaria ver en una entrevista?
- ¿El flujo de agendamiento es rapido?
- ¿Te gustaria recibir un recordatorio antes de la entrevista?

---

### 6. Postulacion publica (lado del candidato)

| Paso | Accion | Observar |
|------|--------|----------|
| 6.1 | Abrir enlace publico en ventana de incognito | ¿La pagina es clara para un candidato externo? |
| 6.2 | Completar formulario de aplicacion | ¿Los campos son claros? |
| 6.3 | Subir CV en PDF | ¿La subida funciona bien? |
| 6.4 | Ver pantalla de exito | ¿El feedback es claro? ¿Entiende el score? |

Preguntas:
- ¿Como candidato, te sentiste informado durante el proceso?
- ¿El score mostrado te da una idea de tu desempeno?
- ¿Te gustaria recibir un email de confirmacion?

---

### 7. Token Usage

| Paso | Accion | Observar |
|------|--------|----------|
| 7.1 | Ir a "Token Usage" | ¿Entiende que son los tokens? |
| 7.2 | Leer las metricas | ¿Los KPIs son claros? |

Preguntas:
- ¿La pagina de uso de tokens te parece util?
- ¿Entiendes la relacion entre tokens, costo y llamadas?
- ¿El tiempo ahorrado estimado es una metrica valiosa para ti?

---

## Evaluacion final

### Satisfaccion general (1-5)

| Aspecto | Puntaje | Notas |
|---------|---------|-------|
| Facilidad de uso | /5 | |
| Utilidad de analisis IA | /5 | |
| Velocidad del sistema | /5 | |
| Diseño visual | /5 | |
| Claridad de la informacion | /5 | |

### Preguntas de cierre

1. ¿Usarias esta plataforma en tu trabajo diario?
2. ¿Que es lo que mas te gustó?
3. ¿Que es lo que menos te gustó?
4. ¿Que funcionalidad agregarias?
5. ¿Hay algo que te haya parecido confuso o frustrante?
6. ¿Recomendarias esta herramienta a otros reclutadores?

---

## Template de reporte

```markdown
## Reporte de validacion

**Fecha:** [fecha]
**Usuario:** [rol/experiencia]
**Duracion:** [tiempo]

### Hallazgos positivos
- [hallazgo 1]
- [hallazgo 2]

### Problemas encontrados
- [problema 1] (prioridad: alta/media/baja)
- [problema 2] (prioridad: alta/media/baja)

### Sugerencias del usuario
- [sugerencia 1]
- [sugerencia 2]

### Acciones a tomar
- [ ] [accion 1]
- [ ] [accion 2]

### Score general: [x]/5
```
