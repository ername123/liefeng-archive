import {
  Bone,
  Microscope,
  HeartPulse,
  Dna,
  Layers,
  GitBranch,
  Pill,
  Shield,
  Bug,
  Stethoscope,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Bone,
  Microscope,
  HeartPulse,
  Dna,
  Layers,
  GitBranch,
  Pill,
  Shield,
  Bug,
  Stethoscope,
};

export function subjectIcon(name?: string | null): LucideIcon {
  return (name && SUBJECT_ICONS[name]) || BookOpen;
}
