import { connectDB } from "../../../lib/db";
import Scheme from "../../../models/Scheme";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const { category, state, search } = req.query;
    const filter = {};

    if (category) filter.category = { $regex: category, $options: "i" };
    if (state) filter.state = { $regex: state, $options: "i" };
    if (search) filter.schemeName = { $regex: search, $options: "i" };

    try {
      const schemes = await Scheme.find(filter);
      res.status(200).json(schemes);
    } catch (err) {
      console.error("❌ Error fetching schemes:", err);
      res.status(500).json({ error: "Failed to fetch schemes" });
    }
  }

  else if (req.method === "POST") {
    try {
      const newScheme = new Scheme(req.body);
      await newScheme.save();
      res.status(201).json({ message: "Scheme added successfully" });
    } catch (err) {
      console.error("❌ Error adding scheme:", err);
      res.status(500).json({ error: "Failed to add scheme" });
    }
  }

  else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

