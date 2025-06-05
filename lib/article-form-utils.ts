// lib/article-form-utils.ts

export type PriorityLabel = "P0" | "P1" | "P2" | "P3";

export const PRIORITY_LABELS: PriorityLabel[] = ["P0", "P1", "P2", "P3"];

/**
 * Toggles a priority label in a comma/space-separated label string.
 * It ensures only one priority label (from P0-P3) is active.
 * If the clicked priority label is already the active one, this implementation will effectively re-add it,
 * effectively "setting" it. A toggle-off behavior would require checking if priorityToToggle is already
 * the sole Px label present. For this version, it always sets the clicked priority.
 * @param currentLabelsString The current string of labels.
 * @param priorityToToggle The priority label (P0-P3) to set.
 * @returns The new label string with the specified priority label active.
 */
export function togglePriorityLabelInString(
  currentLabelsString: string,
  priorityToToggle: PriorityLabel
): string {
  if (typeof currentLabelsString !== 'string') {
    currentLabelsString = ''; // Ensure it's a string if null/undefined
  }

  let labelsArray = currentLabelsString
    .split(/[\s,]+/)
    .map((l) => l.trim())
    .filter((l) => l); // Filter out empty strings from multiple delimiters

  // Remove any existing P0-P3 labels from the array
  labelsArray = labelsArray.filter((label) => !PRIORITY_LABELS.includes(label as PriorityLabel));

  // Add the priority label that was clicked (effectively "setting" it)
  if (priorityToToggle) { // Ensure priorityToToggle is not empty/undefined
    labelsArray.push(priorityToToggle);
  }

  // Join back with a comma and a space for readability, and filter out any potential empty strings again if needed
  return labelsArray.filter(l => l).join(", ");
}

/**
 * Checks if a specific priority label is active in the current label string.
 * @param currentLabelsString The current string of labels.
 * @param priorityLabel The priority label to check for.
 * @returns True if the priority label is present, false otherwise.
 */
export function isPriorityLabelActive(
  currentLabelsString: string,
  priorityLabel: PriorityLabel
): boolean {
  if (typeof currentLabelsString !== 'string') {
    return false;
  }
  const labelsArray = currentLabelsString
    .split(/[\s,]+/)
    .map((l) => l.trim());

  return labelsArray.includes(priorityLabel);
}
