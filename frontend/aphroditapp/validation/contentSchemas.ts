import * as Yup from 'yup';

export const noteSchema = Yup.object().shape({
  title: Yup.string().max(200, 'Máximo 200 caracteres').optional(),
  body: Yup.string().min(1, 'La nota no puede estar vacía').required('El contenido es obligatorio'),
  color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional(),
});

export const sharedListSchema = Yup.object().shape({
  title: Yup.string().min(1, 'El título es obligatorio').max(200).required('El título es obligatorio'),
  description: Yup.string().max(1000).optional(),
  emoji: Yup.string().max(5).optional(),
});

export const checklistSchema = Yup.object().shape({
  title: Yup.string().min(1).max(200).required('El título es obligatorio'),
  description: Yup.string().max(1000).optional(),
});

export const eventSchema = Yup.object().shape({
  title: Yup.string().min(1).max(200).required('El título es obligatorio'),
  description: Yup.string().max(2000).optional(),
  location: Yup.string().max(300).optional(),
  start_datetime: Yup.string().required('La fecha de inicio es obligatoria'),
  end_datetime: Yup.string().nullable().optional(),
  is_all_day: Yup.boolean().optional(),
  recurrence: Yup.string().oneOf(['none', 'daily', 'weekly', 'monthly', 'yearly']).optional(),
  reminder_minutes_before: Yup.number().min(0).optional(),
  event_color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const listItemSchema = Yup.object().shape({
  text: Yup.string().min(1, 'El ítem no puede estar vacío').max(500).required(),
});

export type NoteValues = Yup.InferType<typeof noteSchema>;
export type SharedListValues = Yup.InferType<typeof sharedListSchema>;
export type ChecklistValues = Yup.InferType<typeof checklistSchema>;
export type EventValues = Yup.InferType<typeof eventSchema>;
