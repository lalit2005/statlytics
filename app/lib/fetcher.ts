import api from "./axios";

const fetcher = (...args: Parameters<typeof fetch>) =>
  api.get(args[0] as string).then((res) => res.data);

export default fetcher;
