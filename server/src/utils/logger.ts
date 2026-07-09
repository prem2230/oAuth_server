export const logger = {
  info: (message: string, meta?: unknown) => {
    if (meta) {
      console.log(message, meta);
      return;
    }

    console.log(message);
  },

  error: (message: string, error?: unknown) => {
    if (error) {
      console.error(message, error);
      return;
    }

    console.error(message);
  },
};
