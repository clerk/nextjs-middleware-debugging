export default function serialize(data: any) {
  return JSON.stringify({ ...data, runtime: process.env.NEXT_RUNTIME });
}
