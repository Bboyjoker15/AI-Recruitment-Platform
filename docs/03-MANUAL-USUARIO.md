# Manual de Usuario - AI Recruitment Platform

> **Version:** 1.0.0  
> **Fecha:** Junio 2026  
> **URL de produccion:** `https://ai-recruitment-platform.vercel.app`

---

## Tabla de contenidos

1. [Introduccion](#1-introduccion)
2. [Roles del sistema](#2-roles-del-sistema)
3. [Registro e inicio de sesion](#3-registro-e-inicio-de-sesion)
4. [Dashboard principal](#4-dashboard-principal)
5. [Modulo: Vacantes (Jobs)](#5-modulo-vacantes-jobs)
   - [Lista de vacantes](#51-lista-de-vacantes)
   - [Crear una vacante](#52-crear-una-vacante)
   - [Detalle de vacante](#53-detalle-de-vacante)
   - [Editar y eliminar vacantes](#54-editar-y-eliminar-vacantes)
   - [Compartir enlace de postulacion](#55-compartir-enlace-de-postulacion)
6. [Modulo: Candidatos (Candidates)](#6-modulo-candidatos-candidates)
   - [Lista de candidatos](#61-lista-de-candidatos)
   - [Subir y analizar CV](#62-subir-y-analizar-cv)
   - [Detalle del candidato y analisis IA](#63-detalle-del-candidato-y-analisis-ia)
   - [Pipeline de etapas](#64-pipeline-de-etapas)
   - [Editar y eliminar candidatos](#65-editar-y-eliminar-candidatos)
7. [Modulo: Entrevistas (Interviews)](#7-modulo-entrevistas-interviews)
   - [Lista de entrevistas](#71-lista-de-entrevistas)
   - [Agendar una entrevista](#72-agendar-una-entrevista)
   - [Completar y cancelar entrevistas](#73-completar-y-cancelar-entrevistas)
8. [Modulo: Tokens](#8-modulo-tokens)
9. [Postulacion publica](#9-postulacion-publica)
   - [Landing page y vacantes publicas](#91-landing-page-y-vacantes-publicas)
   - [Formulario de postulacion](#92-formulario-de-postulacion)
   - [Pantalla de confirmacion](#93-pantalla-de-confirmacion)
10. [Cierre de sesion](#10-cierre-de-sesion)
11. [Solucion de problemas](#11-solucion-de-problemas)

---

## 1. Introduccion

**AI Recruitment Platform** es una plataforma de gestion de reclutamiento que utiliza inteligencia artificial para analizar curriculums, asignar scores de compatibilidad y automatizar el proceso de seleccion.

### Requisitos tecnicos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexion a internet
- Cuenta de correo electronico valida
- Lector de PDF (para visualizar CVs)

---

## 2. Roles del sistema

| Icono | Rol | Descripcion |
|-------|-----|-------------|
| 👔 | **Recruiter** | Gestiona vacantes, evalua candidatos, programa entrevistas |

La plataforma tiene un unico rol operativo. Todos los usuarios registrados son reclutadores con acceso completo a todas las funcionalidades.

---

## 3. Registro e inicio de sesion

### Registro

1. Navegue a la pagina principal (`/`)
2. Haga clic en **"Registrarse"** (esquina superior derecha)
3. Complete los campos:
   - **Full name:** su nombre completo
   - **Email:** una direccion de correo valida
   - **Password:** minimo 6 caracteres
4. Haga clic en **"Create account"**
5. Recibira un correo de confirmacion. Haga clic en el enlace para verificar su cuenta
6. Inicie sesion con sus credenciales

### Inicio de sesion

1. Haga clic en **"Iniciar sesion"** en la pagina principal
2. Ingrese su correo electronico y contrasena
3. Haga clic en **"Sign in"**
4. Sera redirigido al dashboard principal

> **Nota:** Si aun no ha confirmado su email, aparecera un mensaje de error al intentar iniciar sesion. Revise su bandeja de entrada y haga clic en el enlace de confirmacion.

---

## 4. Dashboard principal

Al iniciar sesion, accedera al dashboard con las siguientes metricas:

| Metrica | Descripcion |
|---------|-------------|
| **Vacantes activas** | Numero de vacantes publicadas / total de vacantes |
| **Candidatos** | Total de candidatos en todas las vacantes |
| **Score promedio** | Puntaje promedio de todos los candidatos analizados |
| **Contratados / Rechazados** | Conteo de candidatos contratados y rechazados |

Ademas, el dashboard incluye:
- **Grafico de distribucion por etapa:** barras horizontales que muestran cuantos candidatos hay en cada etapa del pipeline
- **Ultimos candidatos:** tabla con los 8 candidatos mas recientes, con enlace al detalle de cada uno

### Navegacion superior

La barra de navegacion contiene las siguientes secciones:

| Seccion | Icono | Descripcion |
|---------|:-----:|-------------|
| Dashboard | 📊 | Metricas principales |
| Jobs | 💼 | Gestion de vacantes |
| Candidates | 👥 | Lista de candidatos |
| Interviews | 📅 | Calendario de entrevistas |
| Tokens | ⚡ | Consumo de IA |
| Sign out | 🚪 | Cerrar sesion |

---

## 5. Modulo: Vacantes (Jobs)

### 5.1 Lista de vacantes

En `/jobs` se muestra un grid con todas sus vacantes. Cada tarjeta muestra:

- **Titulo** del puesto
- **Estado:** Borrador (gris), Publicada (verde) o Cerrada (naranja)
- **Descripcion** (primeras 2 lineas)
- **Fecha** de creacion
- Las tarjetas son clickeables y llevan al detalle de la vacante

Desde esta pagina puede:
- **Crear una nueva vacante** (boton "Crear Vacante")
- **Filtrar visualmente** por estado (los colores de las badges indican el estado)

### 5.2 Crear una vacante

1. Haga clic en **"Crear Vacante"**
2. Complete los campos:
   - **Titulo:** nombre del puesto (ej: "Desarrollador Frontend Next.js")
   - **Descripcion:** detalle de responsabilidades y requisitos
   - **Estado:** Borrador (para guardar sin publicar) o Publicada (visible en landing page)
3. Haga clic en **"Guardar"**

### 5.3 Detalle de vacante

Al hacer clic en una vacante, vera:

- **Informacion completa:** titulo, estado, descripcion
- **Acciones:** Editar, Eliminar, Compartir enlace publico
- **Lista de candidatos:** tabla con nombre, etapa, score, clasificacion y acciones
- **Boton "Nuevo candidato":** para subir manualmente un CV

### 5.4 Editar y eliminar vacantes

**Editar:** haga clic en el boton "Editar" en el detalle de la vacante. Modifique los campos y guarde.

**Eliminar:** haga clic en "Eliminar". Aparecera un dialogo de confirmacion. Confirme para eliminar la vacante y todos sus candidatos asociados.

### 5.5 Compartir enlace de postulacion

Cada vacante tiene un enlace publico unico. Haga clic en **"Compartir vacante"** para copiar el enlace al portapapeles. Este enlace lleva al formulario de postulacion publica donde los candidatos pueden enviar su CV.

El enlace tiene el formato: `https://[dominio]/apply/[id-de-la-vacante]`

---

## 6. Modulo: Candidatos (Candidates)

### 6.1 Lista de candidatos

En `/candidates` se muestra una tabla completa con todos los candidatos de todas las vacantes. La tabla incluye:

- **Nombre:** enlace al detalle del candidato
- **Email**
- **Vacante:** titulo del puesto al que postula
- **Etapa:** badge de color con la etapa actual
- **Score:** puntaje de compatibilidad
- **Clasificacion:** perfil detectado por IA
- **Fecha:** fecha de postulacion

Puede usar el campo de busqueda para filtrar por nombre o email, y el selector de etapa para filtrar por estado del pipeline.

### 6.2 Subir y analizar CV

Desde el detalle de una vacante, haga clic en **"Nuevo candidato"** para subir un CV:

1. Complete los campos:
   - **Nombre** del candidato
   - **Email** del candidato
   - **Archivo PDF:** seleccione el CV en formato PDF
2. Al seleccionar el PDF, el sistema extrae automaticamente el texto
3. Haga clic en **"Analizar candidato"**
4. La IA procesa el CV y muestra el resultado en la misma pagina:
   - **Score:** puntaje de compatibilidad (0-100)
   - **Clasificacion:** tipo de perfil detectado
   - **Resumen:** analisis detallado
   - **Sugerencias:** recomendaciones accionables
   - **Riesgo:** nivel de riesgo de contratacion
   - **Siguiente paso:** accion recomendada

5. El candidato se guarda automaticamente en la vacante

### 6.3 Detalle del candidato y analisis IA

Al hacer clic en un candidato, vera:

- **Informacion basica:** nombre, email, vacante
- **Score visual:** circulo de progreso con el puntaje (verde ≥75, amarillo 50-74, rojo <50)
- **Clasificacion:** badge con el perfil detectado
- **Nivel de riesgo:** badge de color (verde = bajo, amarillo = medio, rojo = alto)
- **Resumen:** texto analitico generado por IA
- **Sugerencias:** lista de recomendaciones
- **Siguiente paso recomendado**
- **Controles de etapa:** botones para mover al candidato entre etapas
- **Entrevistas:** lista de entrevistas agendadas para este candidato

### 6.4 Pipeline de etapas

El sistema tiene 7 etapas. Use los botones en el detalle del candidato para avanzar o retroceder:

| Etapa | Descripcion |
|-------|-------------|
| **New** | Recien postulado, sin revision |
| **Screening** | En revision inicial |
| **Interview** | Programado para entrevista |
| **Technical Test** | Realizando prueba tecnica |
| **Offer** | Oferta enviada |
| **Hired** | Contratado |
| **Rejected** | Descartado |

Cada cambio de etapa dispara una notificacion por email al candidato via n8n.

### 6.5 Editar y eliminar candidatos

**Editar:** desde el detalle del candidato, haga clic en "Editar". Puede modificar nombre, email y etapa actual.

**Eliminar:** haga clic en "Eliminar" y confirme en el dialogo. Esto elimina al candidato, su score y entrevistas asociadas.

---

## 7. Modulo: Entrevistas (Interviews)

### 7.1 Lista de entrevistas

En `/interviews` se muestra una tabla con todas las entrevistas agendadas:

- **Candidato** (enlace al detalle)
- **Vacante** asociada
- **Fecha y hora**
- **Estado:** Agendada (azul), Completada (verde), Cancelada (roja)
- **Acciones:** Editar, Completar, Cancelar

### 7.2 Agendar una entrevista

1. Haga clic en **"Agendar entrevista"**
2. Seleccione:
   - **Candidato:** de la lista de candidatos disponibles
   - **Fecha y hora:** use el selector de fecha
   - **Notas (opcional):** instrucciones o comentarios
3. Haga clic en **"Agendar"**

Al agendar, se dispara un webhook a n8n que envia emails de confirmacion al candidato y al reclutador.

### 7.3 Completar y cancelar entrevistas

- **Completar:** marca la entrevista como realizada
- **Cancelar:** cancela la entrevista con confirmacion previa
- **Editar:** permite modificar fecha, hora y notas de una entrevista existente

---

## 8. Modulo: Tokens

En `/tokens` se muestra el consumo del modelo de IA:

| KPI | Descripcion |
|-----|-------------|
| **Total Tokens** | Suma de todos los tokens consumidos |
| **Costo Total** | Costo estimado en USD |
| **Llamadas** | Numero total de llamadas a la API |
| **Latencia Promedio** | Tiempo promedio de respuesta en ms |

Ademas:
- **Grafico de 7 dias:** barras que muestran el consumo diario de tokens
- **Tabla de logs:** listado de las ultimas 20 llamadas con detalle de tokens, costo y latencia

---

## 9. Postulacion publica

### 9.1 Landing page y vacantes publicas

La pagina principal (`/`) muestra:
- Hero con descripcion de la plataforma
- Seccion de caracteristicas
- **Vacantes abiertas:** lista de todas las vacantes con estado "Publicada"
- Cada vacante es clickeable y lleva al formulario de postulacion

### 9.2 Formulario de postulacion

Al hacer clic en una vacante publica, el candidato ve un formulario con:

- **Nombre completo** (requerido)
- **Correo electronico** (requerido)
- **Curriculum en PDF** (requerido)
  - Al seleccionar el archivo, el sistema extrae automaticamente el texto
  - Solo se aceptan archivos PDF
- **Boton "Enviar postulacion"**

### 9.3 Pantalla de confirmacion

Al enviar la postulacion, el candidato ve:

- Icono de verificacion verde
- Mensaje: "¡Postulacion recibida!"
- **Score de compatibilidad** con color segun rango:
  - Verde (≥75): alta compatibilidad
  - Amarillo (50-74): compatibilidad media
  - Rojo (<50): baja compatibilidad
- **Clasificacion del perfil**
- Mensaje: "Recibiras un correo de confirmacion en los proximos minutos"

El candidato recibe un correo con el resumen de su postulacion y el reclutador recibe una notificacion con los datos del nuevo candidato.

---

## 10. Cierre de sesion

Haga clic en **"Sign out"** en la esquina superior derecha del dashboard. Sera redirigido a la pagina de inicio de sesion.

---

## 11. Solucion de problemas

### Error al iniciar sesion
- Verifique que el correo y contrasena sean correctos
- Asegurese de haber confirmado su email (revise su bandeja de entrada)
- Si el problema persiste, registre una nueva cuenta

### No aparecen vacantes en la landing page
- Asegurese de haber cambiado el estado de la vacante a "Published" (Publicada)
- Solo las vacantes con estado "published" son visibles al publico

### El PDF no se procesa
- Asegurese de que el archivo sea un PDF valido
- El tamano maximo es 10 MB
- Si el PDF tiene imagenes en lugar de texto, el sistema no podra extraer el contenido

### La IA no analiza el CV
- Verifique que la clave de API de Groq este configurada en `.env.local`
- Si no hay clave configurada, el sistema usa un analisis simulado para desarrollo

### El analisis IA demora mucho
- La latencia tipica es de 2-5 segundos
- Si la API de Groq esta congestionada, puede tomar hasta 15 segundos

### No llegan los correos electronicos
- Verifique que n8n este ejecutandose y el tunel Cloudflare este activo
- La URL base del webhook debe estar actualizada en `.env.local`
- El plan gratuito de Resend solo permite enviar a `cesarvelasquez150814@gmail.com`

---

*Documentacion generada en Junio 2026 para el proyecto AI Recruitment Platform.*
