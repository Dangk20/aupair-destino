// hooks/useAcceso.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAcceso(seccion) {
  const router = useRouter();
  const [permitido, setPermitido] = useState(null); // null = cargando

  useEffect(() => {
    fetch("/api/dashboard/acceso")
      .then(r => r.json())
      .then(d => {
        if (!d[seccion]) {
          router.replace("/dashboard"); // redirige al inicio
        } else {
          setPermitido(true);
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, []);

  return permitido;
}