export default function handler(req, res) {
  console.log("[TEST] API 호출됨")
  res.status(200).json({ message: "Vercel API routing OK" });
}
