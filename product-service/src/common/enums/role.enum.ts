// Roles del sistema NexoPet. Coinciden con el `enum Role` del dominio
// (descripcion_proyecto.md). El rol llega dentro del `actor` de cada mensaje,
// inyectado por el API Gateway tras validar el JWT.
export enum Role {
  CLIENT = 'CLIENT',
  VET = 'VET',
  ADMIN = 'ADMIN',
}
