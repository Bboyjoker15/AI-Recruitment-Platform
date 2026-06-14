# Guion de Demo — AI Recruitment Platform

> **Version:** 1.0.0  
> **Fecha:** Junio 2026  
> **Duracion estimada:** 15-18 minutos

---

## Roles del equipo

| Rol | Responsabilidad |
|-----|----------------|
| **PO (Product Owner)** | Presenta el problema, contexto, alcance y cierre |
| **Frontend Lead** | Navega la aplicacion, muestra UI/UX y componentes |
| **Backend Lead** | Explica base de datos, autenticacion, RLS y middleware |
| **AI/Automation Lead** | Muestra analisis de CV con IA, workflows n8n y emails |

---

## Escenario de demostracion

- **Vacante:** "Senior Frontend Developer" — publicada
- **Candidato:** Carlos Martinez — CV con 8 años de experiencia en React, TypeScript y liderazgo tecnico
- **Resultado esperado:** Score 85+, clasificado como Senior, sugerencia: pasar a entrevista tecnica

---

## Desarrollo

### 1. Apertura — PO (1 min)

> "Hoy les presentamos **AI Recruitment Platform**, un sistema ATS que automatiza el reclutamiento usando inteligencia artificial. El problema que resuelve: los reclutadores pasan horas leyendo CVs manualmente. Nuestra plataforma analiza cada CV en segundos, asigna un score de compatibilidad y sugiere el siguiente paso."

Abrir la aplicacion en Vercel.

---

### 2. Landing page — Frontend Lead (1 min)

> "Cualquier persona puede ver las vacantes publicadas sin necesidad de autenticarse."

- Mostrar hero, features, lista de vacantes publicadas
- Hacer clic en "Ver detalle" de una vacante

---

### 3. Login — Frontend Lead (1 min)

> "El reclutador inicia sesion para acceder al dashboard."

- Navegar a `/login`
- Ingresar credenciales (mostrar registro si aplica)
- Click en "Iniciar sesion"

---

### 4. Dashboard — Backend Lead (1.5 min)

> "Este es el centro de control. Aqui vemos metricas en tiempo real."

- Senalar KPIs: vacantes activas, candidatos, entrevistas, score promedio
- Mostrar grafico de distribucion por etapa del pipeline
- Mostrar tabla de candidatos recientes
- Mencionar: "Los datos vienen de Supabase con RLS policies que aseguran que cada reclutador ve solo sus propios datos"

---

### 5. Crear vacante — Frontend Lead (1.5 min)

> "Vamos a crear una nueva vacante."

- Navegar a `/jobs/new`
- Llenar formulario: titulo "Senior Frontend Developer", descripcion, requisitos
- Publicar la vacante
- Mostrar el detalle con el boton "Compartir enlace"
- Copiar el enlace publico

---

### 6. Postulacion publica — Frontend Lead (2 min)

> "Ahora vamos a ver lo que ve un candidato."

- Abrir ventana de incognito o cambiar de navegador
- Navegar al enlace publico copiado
- Mostrar formulario de aplicacion: nombre, email, subir PDF
- Subir el CV de "Carlos Martinez"
- Hacer clic en "Enviar candidatura"
- Mostrar pantalla de exito con el score circle
- Volver al navegador del reclutador

---

### 7. Analisis IA — AI/Automation Lead (2 min)

> "En ese instante, la aplicacion llamo a Groq API con el CV extraido del PDF. Veamos el resultado."

- Recargar la pagina de candidatos de la vacante
- Mostrar la tarjeta del nuevo candidato con el score
- Ingresar al detalle del candidato
- Explicar cada seccion:
  - **Score circle:** color por rango (verde > 70, amarillo 40-70, rojo < 40)
  - **Resumen:** generado por IA
  - **Seniority:** detectado automaticamente
  - **Sugerencias:** que evaluar en entrevista
  - **Riesgo:** nivel de riesgo detectado
- Mencionar: "La respuesta de Groq es JSON validado: `summary`, `classification`, `suggestions`, `risk_level`, `score`, `suggested_next_step`"

---

### 8. Pipeline de etapas — Frontend Lead (1 min)

> "Podemos mover al candidato a traves del pipeline."

- Mostrar los 7 stages: New → Screening → Interview → Technical Test → Offer → Hired → Rejected
- Cambiar al candidato de "New" a "Screening"
- Mencionar que n8n recibe este evento y envia notificacion

---

### 9. Agendar entrevista — AI/Automation Lead (2 min)

> "Cuando el candidato avanza a la fase de entrevista, podemos agendarla."

- Navegar a `/interviews/new`
- Seleccionar candidato, fecha y notas
- Guardar la entrevista
- Mostrar el registro en la lista de entrevistas
- Ir al correo electronico y mostrar el email recibido con la guia de entrevista generada por IA
- Explicar: "n8n recibio el evento via webhook, consulto los datos del candidato, llamo a Groq para generar preguntas de entrevista basadas en el CV, y envio el email via Resend"

---

### 10. Token Usage — Backend Lead (1.5 min)

> "Auditamos cada llamada a IA para medir costos y desempeno."

- Navegar a `/tokens`
- Explicar cada metrica:
  - **Tokens totales:** volumen de procesamiento
  - **Costo estimado:** cuanto gastamos en IA
  - **Llamadas API:** cuantos analisis realizamos
  - **Latencia promedio:** velocidad de respuesta
  - **Tiempo ahorrado:** comparado con lectura manual (~20min por CV)
  - **Tasa de exito:** porcentaje de analisis con score valido
- Mostrar grafico de tokens por dia
- Mostrar tabla de ultimos analisis con detalle

---

### 11. Cierre — PO (1 min)

> "En resumen, logramos un sistema completo donde:"
>
> - Reclutadores **ahorran horas** de lectura manual de CVs
> - La IA **rankea y clasifica** candidatos objetivamente
> - Las automatizaciones **notifican** sin intervencion manual
> - Todo esta **auditado** y documentado

Mencionar enlaces a documentacion en `docs/`.

---

### 12. Preguntas y respuestas — Todo el equipo

> "Estamos abiertos a sus preguntas."

---

## Checklist pre-demo

- [ ] App deployada en Vercel y funcionando
- [ ] n8n corriendo con Cloudflare Tunnel activo
- [ ] `N8N_WEBHOOK_BASE_URL` actualizado en `.env.local`
- [ ] Al menos 1 vacante publicada con candidatos
- [ ] 1 CV de prueba (formato PDF, ~2-3 paginas)
- [ ] Navegador con sesion de reclutador iniciada
- [ ] Ventana de incognito lista para postulacion
- [ ] Bandeja de correo abierta (cesarvelasquez150814@gmail.com)
- [ ] Demostrador conoce los roles asignados
- [ ] Prueba completa del flujo 30 minutos antes

---

## Notas de troubleshooting

| Problema | Solucion |
|----------|----------|
| n8n no recibe webhook | Verificar Cloudflare Tunnel URL en `.env.local` y reiniciar `npm run dev` |
| Email no llega | Resend free tier solo envia a `cesarvelasquez150814@gmail.com` |
| PDF no se procesa | Verificar conexion a CDN de pdfjs-dist |
| Error de Groq API | Verificar `GROQ_API_KEY` en `.env.local` |
