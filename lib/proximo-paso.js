// El próximo paso de la candidata: UNA regla para el inicio y para «Mi
// proceso». Antes cada pantalla tenía la suya y «Mi proceso» se saltaba el
// perfil: podía decir «Perfil en revisión» sin que el perfil se hubiera
// enviado (change candidata-datos-reales).
//
// Prioridad: lo que la candidata tiene que hacer (curso, pago, perfil,
// documentos); si ya hizo lo suyo, el `proximoPaso` del servidor, que conoce
// la etapa (revisión, correcciones, agencia…).
export function proximoPasoCandidata({ cursoCompleto, tieneAcceso, perfilListo, docsListos, proceso }) {
  if (!cursoCompleto) return { kicker:"TU PRÓXIMO PASO", title:"Continúa tu formación", desc:"Mira tus videos: te preparan para todo lo que viene. Son 100% gratis.", cta:"Continuar mi curso", href:"/dashboard/curso" };
  if (!tieneAcceso)   return { kicker:"TU PRÓXIMO PASO", title:"Terminaste tu formación. Ahora prepárate para conocer a tu agencia.", desc:"Activa tu acompañamiento para que una agencia aliada revise tu perfil y te acepte.", cta:"Activar mi acompañamiento", href:"/pago" };
  if (!perfilListo)   return { kicker:"TU PRÓXIMO PASO", title:"Cuéntanos de ti", desc:"Completa tu perfil (ambas partes) para que podamos presentarte ante una agencia.", cta:"Completar mi perfil", href:"/dashboard/perfil" };
  if (!docsListos)    return { kicker:"TU PRÓXIMO PASO", title:"Carga tu documentación", desc:"Sube tus documentos para que presentemos tu perfil a una agencia aliada.", cta:"Ir a mis documentos", href:"/dashboard/documentos" };
  if (proceso?.proximoPaso) {
    const esperando = /revisando|revisi/i.test(proceso.proximoPaso.titulo||"");
    return { kicker: esperando?"EN PROCESO":"TU PRÓXIMO PASO", title: proceso.proximoPaso.titulo, desc: proceso.proximoPaso.detalle, cta: esperando?null:proceso.proximoPaso.label_boton, href: proceso.proximoPaso.link };
  }
  return { kicker:"EN PROCESO", title:"Estamos revisando tu perfil", desc:"Nuestro equipo lo revisa y te avisará aquí y por correo (1–3 días hábiles).", cta:null, href:"/dashboard/proceso" };
}
