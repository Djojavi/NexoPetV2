// Roles del sistema NexoPet. El rol llega dentro del `actor` de cada mensaje,
// inyectado por el API Gateway tras validar el JWT.
//
// - USER  = cliente (dueño de mascotas).
// - ADMIN = veterinario / personal de la clínica.
//
// A nivel de este servicio solo existen estos dos niveles de permiso: el cliente
// gestiona sus propias mascotas y el veterinario (ADMIN) gestiona todas y el
// historial clínico.
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
