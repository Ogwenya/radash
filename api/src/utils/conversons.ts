// #########################################
// ########## CONVERT BYTES TO GB ##########
// #########################################
export function convert_bytes_to_gb(value: number) {
  return parseFloat((value / (1024 * 1024 * 1024)).toFixed(2));
}

// ########################################
// ########## CONVERT TO 12 HOUR ##########
// ########################################
export function format_hour_to_12_hour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
}
