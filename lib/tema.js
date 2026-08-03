// ════════════════════════════════════════════════════════════════════════
// lib/tema.js — La línea gráfica del producto. Para TODOS los paneles.
//
// Paleta BORGOÑA de marca (#A0435F) + fondos rosados suaves + Poppins, fiel
// al landing. Fuente única de color: nada de hex regados por las pantallas.
//
// Se llamaba `tema-candidata.js` y eso hizo que sólo lo usara el panel de la
// candidata: el nombre decía que no era de los demás. Los otros tres paneles
// escribieron sus colores a mano y derivaron — el de administración acumuló
// 158 colores distintos, siendo el más usado #a0435f, que es `primary`.
// ════════════════════════════════════════════════════════════════════════
export const T = {
  // marca
  primary:   "#A0435F",   // borgoña principal
  primary2:  "#7D2F47",   // borgoña profundo (gradientes)
  primary3:  "#C77D93",   // rosa-borgoña claro / acento
  ink:       "#4A2A38",   // marrón-vino oscuro (títulos, pasaporte)
  text:      "#3A2530",   // texto principal
  textSoft:  "#9C8790",   // texto secundario
  // superficies
  bg:        "#FBF4F6",   // fondo del shell (rosado suave)
  card:      "#fff",
  lilac:     "#FCE8EE",   // relleno suave (íconos, chips) — antes lila
  border:    "#F5E1E7",
  softText:  "#C9A9B4",   // texto/íconos apagados
  softLine:  "#EFE0E6",   // líneas de conexión apagadas
  softFill:  "#FBEEF1",   // relleno muy tenue
  // estados — confirmado / pendiente / problema
  green:     "#12A46B",
  greenBg:   "#E6F9F0",
  greenDot:  "#22C55E",   // sello "completado" en la ruta
  amber:     "#E8853B",
  amberBg:   "#FFF4EC",
  // Añadidos para el panel de administración, que necesita expresar acciones
  // destructivas —anular una venta, eliminar un código— y estados neutros de
  // tabla. Antes los escribía a mano con cuatro rojos y tres grises distintos.
  danger:    "#C0392B",   // anular, eliminar, rechazar
  dangerBg:  "#FDECEC",
  neutral:   "#6B7280",   // texto de dato secundario en tablas
  neutralBg: "#F3F4F6",
  neutralLine: "#E5E7EB", // separadores de tabla
  // gradientes
  gradHero:  "linear-gradient(120deg,#A0435F 0%,#B85E7C 55%,#C77D93 100%)",
  gradIcon:  "linear-gradient(135deg,#A0435F,#7D2F47)",
  gradPass:  "linear-gradient(150deg,#4A2A38,#A0435F)",
  shadow:    "0 10px 30px rgba(160,67,95,.06)",
  shadowHero:"0 20px 44px rgba(160,67,95,.28)",
  ring:      "rgba(160,67,95,.5)",   // pulsering
  font:      "'Poppins',system-ui,-apple-system,sans-serif",
};

export const POPPINS_HREF =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
