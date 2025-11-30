import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'd MMM yyyy, HH:mm');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'EEEE, d MMMM yyyy \'at\' HH:mm');
};

export const formatDateTimeShort = (date) => {
  if (!date) return '';
  return format(new Date(date), 'EEE, d MMM yyyy, HH:mm');
};

export const formatTime = (time) => {
  if (!time) return '';
  return format(new Date(time), 'HH:mm');
};