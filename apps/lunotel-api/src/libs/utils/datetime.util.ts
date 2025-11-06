export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_REGEX = /^\d{2}:\d{2}$/;

export const isDateString = (value: unknown): value is string =>
	typeof value === 'string' && DATE_REGEX.test(value);

export const isTimeString = (value: unknown): value is string =>
	typeof value === 'string' && TIME_REGEX.test(value);

export const formatDateString = (value: Date | string): string => {
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	if (typeof value === 'string') {
		if (DATE_REGEX.test(value)) {
			return value;
		}

		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toISOString().slice(0, 10);
		}
	}

	throw new Error('Invalid date value');
};

export const formatTimeString = (value: Date | string): string => {
	if (value instanceof Date) {
		return value.toISOString().slice(11, 16);
	}

	if (typeof value === 'string') {
		if (TIME_REGEX.test(value)) {
			return value;
		}

		const parsed = new Date(`1970-01-01T${value.endsWith('Z') ? value : `${value}Z`}`);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toISOString().slice(11, 16);
		}
	}

	throw new Error('Invalid time value');
};
