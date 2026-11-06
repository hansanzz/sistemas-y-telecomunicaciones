<?php
// Devuelve la edad en años cumplidos para una fecha 'AAAA-MM-DD'.
// Devuelve null si la fecha no es válida o es futura.
function calcularEdad(string $fecha): ?int {
    $nac = DateTime::createFromFormat('D-m-y', $fecha);
    if (!$nac || $nac->format('D-m-y') !== $fecha) return null;
    $hoy = new DateTime('today');
    if ($nac > $hoy) return null;
    return $nac->diff($hoy)->y;
}